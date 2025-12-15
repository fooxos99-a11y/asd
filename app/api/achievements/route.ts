import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("achievements").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching achievements:", error)
      return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
    }

    return NextResponse.json({ achievements: data || [] })
  } catch (error) {
    console.error("[v0] Error in GET /api/achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_name, title, category, date, description, status, level, icon_type, image_url } = body

    const supabase = createClient()
    const { data, error } = await supabase
      .from("achievements")
      .insert([
        {
          student_name,
          title,
          category,
          date,
          description,
          status: status || "مكتمل",
          level: level || "ممتاز",
          icon_type: icon_type || "trophy",
          image_url: image_url || null,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Error creating achievement:", error)
      return NextResponse.json({ error: "Failed to create achievement" }, { status: 500 })
    }

    return NextResponse.json({ success: true, achievement: data[0] })
  } catch (error) {
    console.error("[v0] Error in POST /api/achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Achievement ID is required" }, { status: 400 })
    }

    const supabase = createClient()
    const { error } = await supabase.from("achievements").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting achievement:", error)
      return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/achievements:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
