import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "لم يتم العثور على ملف" }, { status: 400 })
    }

    // قراءة محتوى الملف
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // إنشاء اسم ملف فريد
    const timestamp = Date.now()
    const originalName = file.name.replace(/\s+/g, "-")
    const fileName = `${timestamp}-${originalName}`

    // المسار إلى مجلد الصور
    const uploadsDir = join(process.cwd(), "public", "guess-images")
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // حفظ الملف
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // إرجاع رابط الصورة
    const imageUrl = `/guess-images/${fileName}`

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 })
  }
}
