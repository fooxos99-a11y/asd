import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function calculatePoints(level: string): number {
  switch (level) {
    case "excellent":
      return 10
    case "very_good":
      return 8
    case "good":
      return 6
    case "not_completed":
      return 0
    default:
      return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get("student_id")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch attendance records for the student
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("student_id", studentId)
      .order("date", { ascending: false })

    if (attendanceError) {
      console.error("[v0] Error fetching attendance records:", attendanceError)
      return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
    }

    // Fetch evaluations for each attendance record
    const recordsWithEvaluations = await Promise.all(
      (attendanceData || []).map(async (record) => {
        const { data: evaluation } = await supabase
          .from("evaluations")
          .select("*")
          .eq("attendance_record_id", record.id)
          .maybeSingle()

        return {
          id: record.id,
          date: record.date,
          status: record.status,
          hafiz_level: evaluation?.hafiz_level || null,
          tikrar_level: evaluation?.tikrar_level || null,
          samaa_level: evaluation?.samaa_level || null,
          rabet_level: evaluation?.rabet_level || null,
        }
      }),
    )

    return NextResponse.json({ records: recordsWithEvaluations })
  } catch (error) {
    console.error("[v0] Error in attendance API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_id, teacher_id, halaqah, status, hafiz_level, tikrar_level, samaa_level, rabet_level } = body

    if (!student_id || !teacher_id || !halaqah) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = new Date()
    const todayDate = today.toISOString().split("T")[0]

    console.log("[v0] Adding evaluation for student:", student_id, "on date:", todayDate)

    // Check if there's already an attendance record for this student today
    const { data: existingRecord, error: checkError } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("student_id", student_id)
      .eq("date", todayDate)
      .maybeSingle()

    if (checkError) {
      console.error("[v0] Error checking existing attendance:", checkError)
      return NextResponse.json({ error: "Failed to check existing attendance" }, { status: 500 })
    }

    let attendanceRecord
    let isUpdate = false

    if (existingRecord) {
      console.log("[v0] Updating existing attendance record for today:", existingRecord.id)
      isUpdate = true

      // First, get the old evaluation to subtract old points
      const { data: oldEvaluation } = await supabase
        .from("evaluations")
        .select("*")
        .eq("attendance_record_id", existingRecord.id)
        .maybeSingle()

      // Calculate old points to subtract
      let oldPoints = 0
      if (oldEvaluation) {
        oldPoints =
          calculatePoints(oldEvaluation.hafiz_level) +
          calculatePoints(oldEvaluation.tikrar_level) +
          calculatePoints(oldEvaluation.samaa_level) +
          calculatePoints(oldEvaluation.rabet_level)

        console.log("[v0] Old points to subtract:", oldPoints)

        // Delete old evaluation
        const { error: deleteEvalError } = await supabase
          .from("evaluations")
          .delete()
          .eq("attendance_record_id", existingRecord.id)

        if (deleteEvalError) {
          console.error("[v0] Error deleting old evaluation:", deleteEvalError)
        }
      }

      // Update attendance record status
      const { data: updatedRecord, error: updateError } = await supabase
        .from("attendance_records")
        .update({
          status: status || "present",
        })
        .eq("id", existingRecord.id)
        .select()
        .single()

      if (updateError) {
        console.error("[v0] Error updating attendance record:", updateError)
        return NextResponse.json({ error: "Failed to update attendance record" }, { status: 500 })
      }

      attendanceRecord = updatedRecord

      // Subtract old points from student if there were any
      if (oldPoints > 0) {
        const { data: studentData } = await supabase.from("students").select("points").eq("id", student_id).single()

        if (studentData) {
          const currentPoints = studentData.points || 0
          const newPoints = Math.max(0, currentPoints - oldPoints)

          console.log("[v0] Subtracting old points:", {
            currentPoints,
            subtract: oldPoints,
            newPoints,
          })

          await supabase.from("students").update({ points: newPoints }).eq("id", student_id)
        }
      }

      // Add new points to student if new evaluation data is provided
      if (hafiz_level && tikrar_level && samaa_level && rabet_level) {
        const hafizPoints = calculatePoints(hafiz_level)
        const tikrarPoints = calculatePoints(tikrar_level)
        const samaaPoints = calculatePoints(samaa_level)
        const rabetPoints = calculatePoints(rabet_level)

        const totalPoints = hafizPoints + tikrarPoints + samaaPoints + rabetPoints

        console.log("[v0] Points breakdown:", {
          hafiz: hafizPoints,
          tikrar: tikrarPoints,
          samaa: samaaPoints,
          rabet: rabetPoints,
          total: totalPoints,
        })

        const { data: evaluation, error: evaluationError } = await supabase
          .from("evaluations")
          .insert({
            attendance_record_id: attendanceRecord.id,
            hafiz_level,
            tikrar_level,
            samaa_level,
            rabet_level,
          })
          .select()
          .single()

        if (evaluationError) {
          console.error("[v0] Error creating evaluation:", evaluationError)
          return NextResponse.json({
            success: true,
            attendance: attendanceRecord,
            warning: "Attendance created but evaluation failed",
          })
        }

        console.log("[v0] Evaluation created:", evaluation.id)

        if (totalPoints > 0) {
          const { data: studentData, error: fetchError } = await supabase
            .from("students")
            .select("points")
            .eq("id", student_id)
            .single()

          if (fetchError) {
            console.error("[v0] Error fetching student points:", fetchError)
          } else {
            const currentPoints = studentData.points || 0
            const newPoints = currentPoints + totalPoints

            console.log("[v0] Updating student points:", {
              currentPoints,
              addedPoints: totalPoints,
              newPoints,
            })

            const { error: updateError } = await supabase
              .from("students")
              .update({ points: newPoints })
              .eq("id", student_id)

            if (updateError) {
              console.error("[v0] Error updating student points:", updateError)
            } else {
              console.log("[v0] Student points updated successfully to:", newPoints)
            }
          }
        }

        return NextResponse.json({
          success: true,
          attendance: attendanceRecord,
          evaluation,
          pointsAdded: totalPoints,
          isUpdate,
        })
      }
    } else {
      // Create new attendance record
      const { data: newRecord, error: attendanceError } = await supabase
        .from("attendance_records")
        .insert({
          student_id,
          teacher_id,
          halaqah,
          status: status || "present",
          date: todayDate,
        })
        .select()
        .single()

      if (attendanceError) {
        console.error("[v0] Error creating attendance record:", attendanceError)
        return NextResponse.json({ error: "Failed to create attendance record" }, { status: 500 })
      }

      attendanceRecord = newRecord

      // Create evaluation record if evaluation data is provided
      if (hafiz_level && tikrar_level && samaa_level && rabet_level) {
        const hafizPoints = calculatePoints(hafiz_level)
        const tikrarPoints = calculatePoints(tikrar_level)
        const samaaPoints = calculatePoints(samaa_level)
        const rabetPoints = calculatePoints(rabet_level)

        const totalPoints = hafizPoints + tikrarPoints + samaaPoints + rabetPoints

        console.log("[v0] Points breakdown:", {
          hafiz: hafizPoints,
          tikrar: tikrarPoints,
          samaa: samaaPoints,
          rabet: rabetPoints,
          total: totalPoints,
        })

        const { data: evaluation, error: evaluationError } = await supabase
          .from("evaluations")
          .insert({
            attendance_record_id: attendanceRecord.id,
            hafiz_level,
            tikrar_level,
            samaa_level,
            rabet_level,
          })
          .select()
          .single()

        if (evaluationError) {
          console.error("[v0] Error creating evaluation:", evaluationError)
          return NextResponse.json({
            success: true,
            attendance: attendanceRecord,
            warning: "Attendance created but evaluation failed",
          })
        }

        console.log("[v0] Evaluation created:", evaluation.id)

        if (totalPoints > 0) {
          const { data: studentData, error: fetchError } = await supabase
            .from("students")
            .select("points")
            .eq("id", student_id)
            .single()

          if (fetchError) {
            console.error("[v0] Error fetching student points:", fetchError)
          } else {
            const currentPoints = studentData.points || 0
            const newPoints = currentPoints + totalPoints

            console.log("[v0] Updating student points:", {
              currentPoints,
              addedPoints: totalPoints,
              newPoints,
            })

            const { error: updateError } = await supabase
              .from("students")
              .update({ points: newPoints })
              .eq("id", student_id)

            if (updateError) {
              console.error("[v0] Error updating student points:", updateError)
            } else {
              console.log("[v0] Student points updated successfully to:", newPoints)
            }
          }
        }

        return NextResponse.json({
          success: true,
          attendance: attendanceRecord,
          evaluation,
          pointsAdded: totalPoints,
          isUpdate,
        })
      }
    }

    return NextResponse.json({
      success: true,
      attendance: attendanceRecord,
      isUpdate,
    })
  } catch (error) {
    console.error("[v0] Error in attendance POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
