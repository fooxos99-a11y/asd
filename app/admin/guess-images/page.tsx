"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react"

type GuessImage = {
  id: string
  image_url: string
  answer: string
  hint: string | null
  difficulty: string
  active: boolean
}

export default function GuessImagesManagement() {
  const [images, setImages] = useState<GuessImage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<GuessImage | null>(null)
  const [formData, setFormData] = useState({
    image_url: "",
    answer: ""
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/guess-images")
      const data = await response.json()
      setImages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching images:", error)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formDataUpload
    })
    
    if (!response.ok) {
      throw new Error('فشل رفع الصورة')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = formData.image_url

      // إذا تم اختيار ملف جديد، رفعه أولاً
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }

      const dataToSend = {
        image_url: imageUrl,
        answer: formData.answer,
        hint: null,
        difficulty: 'متوسط'
      }

      if (editingImage) {
        // تحديث صورة موجودة
        const response = await fetch("/api/guess-images", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingImage.id,
            ...dataToSend
          })
        })

        if (response.ok) {
          await fetchImages()
          handleCloseDialog()
        }
      } else {
        // إضافة صورة جديدة
        const response = await fetch("/api/guess-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend)
        })

        if (response.ok) {
          await fetchImages()
          handleCloseDialog()
        }
      }
    } catch (error) {
      console.error("Error saving image:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return

    try {
      const response = await fetch(`/api/guess-images?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchImages()
      }
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files[0] && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleEdit = (image: GuessImage) => {
    setEditingImage(image)
    setFormData({
      image_url: image.image_url,
      answer: image.answer
    })
    setPreviewUrl(image.image_url)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingImage(null)
    setFormData({
      image_url: "",
      answer: ""
    })
    setSelectedFile(null)
    setPreviewUrl("")
    setUploading(false)
  }

  const toggleActive = async (image: GuessImage) => {
    try {
      await fetch("/api/guess-images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: image.id,
          active: !image.active
        })
      })
      await fetchImages()
    } catch (error) {
      console.error("Error toggling image active state:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-2 border-[#d8a355]/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-[#1a2332]">
            إدارة صور خمن الصورة
          </h1>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437] text-white"
          >
            <Plus className="ml-2" />
            إضافة صورة جديدة
          </Button>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">لا توجد صور حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className={`border-2 rounded-lg p-4 ${
                  image.active ? "border-[#d8a355]" : "border-gray-300 opacity-60"
                }`}
              >
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.answer}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">{image.answer}</h3>
                {image.hint && (
                  <p className="text-sm text-gray-600 mb-2">تلميح: {image.hint}</p>
                )}
                <p className="text-sm text-gray-500 mb-4">
                  الصعوبة: {image.difficulty}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(image)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Pencil className="ml-2 w-4 h-4" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => toggleActive(image)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {image.active ? "إيقاف" : "تفعيل"}
                  </Button>
                  <Button
                    onClick={() => handleDelete(image.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog للإضافة والتعديل */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1a2332]">
              {editingImage ? "تعديل صورة" : "إضافة صورة جديدة"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* منطقة السحب والإفلات */}
            <div>
              <Label>الصورة *</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#d8a355] bg-[#faf8f5]'
                    : 'border-gray-300 hover:border-[#d8a355]'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="معاينة"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600">
                      اضغط أو اسحب صورة جديدة للتغيير
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-lg font-semibold text-gray-700">
                      اسحب الصورة هنا
                    </p>
                    <p className="text-sm text-gray-500">
                      أو اضغط لاختيار ملف من جهازك
                    </p>
                  </div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
            </div>

            <div>
              <Label htmlFor="answer">الإجابة (اسم الصورة) *</Label>
              <Input
                id="answer"
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="مثال: برج إيفل"
                required
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={uploading || (!selectedFile && !editingImage)}
                className="flex-1 bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437] text-white disabled:opacity-50"
              >
                {uploading ? "جاري الرفع..." : editingImage ? "حفظ التعديلات" : "إضافة الصورة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
                disabled={uploading}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
