import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()

  // جلب جميع الطلاب
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, name, account_number")
    .order("account_number", { ascending: true })

  if (studentsError) {
    return NextResponse.json({ error: "فشل في جلب الطلاب" }, { status: 500 })
  }

  // جلب جميع سجلات الحضور
  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance_records")
    .select("id, student_id, date, status, created_at")

  if (attendanceError) {
    return NextResponse.json({ error: "فشل في جلب سجلات الحضور" }, { status: 500 })
  }

  // دعم فلترة حسب تاريخ محدد (يأتي من الكويري باراميتر)
  // إذا لم يوجد باراميتر، استخدم تاريخ اليوم بتوقيت السعودية
  const url = new URL(request.url)
  let selectedDate = url.searchParams.get("date")
  if (!selectedDate) {
    const now = new Date()
    const saDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }))
    selectedDate = saDate.toISOString().split("T")[0]
  }

  // لكل الطلاب، ابحث عن سجل حضور في التاريخ المطلوب
  const records = students.map((student) => {
    const rec = (attendance || []).find((r) => r.student_id === student.id && r.date === selectedDate)
    if (rec) {
      return {
        id: rec.id,
        student_id: student.id,
        student_name: student.name,
        account_number: student.account_number,
        attendance_date: rec.date,
        status: rec.status,
        created_at: rec.created_at,
      }
    } else {
      return {
        id: `no-record-${student.id}-${selectedDate}`,
        student_id: student.id,
        student_name: student.name,
        account_number: student.account_number,
        attendance_date: selectedDate,
        status: null,
        created_at: null,
      }
    }
  })

  return NextResponse.json({ records })
}
