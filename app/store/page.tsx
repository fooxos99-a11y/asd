"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Star, Lock, Palette, Type, Award, Sparkles } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  description: string
  price: number
  icon: React.ReactNode
  category: "theme" | "badge" | "font" | "coming_soon"
  themeValue?: string
}

interface Purchase {
  product_id: string
  purchased_at: string
}

const PRODUCTS: Product[] = [
  {
    id: "theme_beige",
    name: "خلفية بيجي كلاسيكية",
    description: "الخلفية الكلاسيكية الأنيقة بلون البيج الذهبي",
    price: 500,
    icon: <Palette className="w-8 h-8" />,
    category: "theme",
    themeValue: "beige",
  },
  {
    id: "theme_ocean",
    name: "خلفية المحيط الأزرق",
    description: "خلفية مستوحاة من أعماق المحيط بدرجات الأزرق",
    price: 500,
    icon: <Palette className="w-8 h-8" />,
    category: "theme",
    themeValue: "ocean",
  },
  {
    id: "theme_sunset",
    name: "خلفية غروب الشمس",
    description: "خلفية دافئة بألوان الغروب البرتقالية",
    price: 500,
    icon: <Palette className="w-8 h-8" />,
    category: "theme",
    themeValue: "sunset",
  },
  {
    id: "theme_forest",
    name: "خلفية الغابة الخضراء",
    description: "تصميم كامل مستوحى من الغابة مع أوراق وظلال",
    price: 500,
    icon: <Palette className="w-8 h-8" />,
    category: "theme",
    themeValue: "forest",
  },
  {
    id: "theme_purple",
    name: "خلفية بنفسجية ملكية",
    description: "خلفية أنيقة بدرجات البنفسجي الملكي",
    price: 500,
    icon: <Palette className="w-8 h-8" />,
    category: "theme",
    themeValue: "purple",
  },
  {
    id: "special_title",
    name: "لقب خاص",
    description: "لقب مميز يظهر بجانب اسمك في لائحة الترتيب",
    price: 1000,
    icon: <Award className="w-8 h-8" />,
    category: "badge",
  },
  {
    id: "star_badge",
    name: "نجمة الإتقان",
    description: "نجمة ذهبية تظهر بجانب اسمك في الترتيب",
    price: 1500,
    icon: <Star className="w-8 h-8" />,
    category: "badge",
  },
  {
    id: "custom_font",
    name: "تغيير الخط",
    description: "خط مميز لعرض اسمك في لائحة الترتيب",
    price: 2000,
    icon: <Type className="w-8 h-8" />,
    category: "font",
  },
  {
    id: "coming_soon_1",
    name: "منتج قريباً",
    description: "منتج جديد سيتم إضافته قريباً",
    price: 0,
    icon: <Lock className="w-8 h-8" />,
    category: "coming_soon",
  },
  {
    id: "coming_soon_2",
    name: "منتج قريباً",
    description: "منتج جديد سيتم إضافته قريباً",
    price: 0,
    icon: <Lock className="w-8 h-8" />,
    category: "coming_soon",
  },
]

const CATEGORIES = [
  {
    id: "backgrounds",
    name: "الخلفيات",
    description: "اختر خلفية وتصميم فريد لبطاقتك في لائحة الترتيب",
    icon: Palette,
    design: (
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="relative w-40 h-40">
          <div className="absolute top-2 left-2 w-24 h-32 border-4 border-dashed rounded-lg"></div>
          <div className="absolute top-8 right-4 w-20 h-24 bg-white/30 rounded-lg"></div>
          <div className="absolute bottom-4 left-8 w-16 h-20 bg-white/20 rounded-lg"></div>
        </div>
      </div>
    ),
  },
  {
    id: "effects",
    name: "التأثيرات",
    description: "تأثيرات مميزة تُطبق على كامل بطاقتك في لائحة الترتيب",
    icon: Sparkles,
    design: (
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="relative w-40 h-40">
          <div className="absolute inset-0 border-4 rounded-xl animate-pulse"></div>
          <Sparkles className="absolute top-4 left-4 w-8 h-8 animate-ping" />
          <Sparkles className="absolute bottom-4 right-4 w-6 h-6 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <Sparkles className="absolute top-8 right-8 w-7 h-7 animate-ping" style={{ animationDelay: "0.7s" }} />
        </div>
      </div>
    ),
  },
  {
    id: "badges",
    name: "الشارات",
    description: "أضف شارة مميزة تظهر بجانب اسمك في الترتيب",
    icon: Award,
    design: (
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="relative w-40 h-40">
          <Award className="w-16 h-16 absolute top-4 left-6" />
          <Award className="w-10 h-10 absolute top-12 right-8" />
          <Award className="w-8 h-8 absolute bottom-6 left-12" />
          <Award className="w-12 h-12 absolute bottom-4 right-6" />
        </div>
      </div>
    ),
  },
  {
    id: "fonts",
    name: "الخطوط",
    description: "غير الخط الخاص باسمك لشيء مميز",
    icon: Type,
    design: (
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 gap-3">
        <div className="h-3 w-32 bg-current rounded"></div>
        <div className="h-2 w-40 bg-current rounded"></div>
        <div className="h-3 w-28 bg-current rounded"></div>
        <div className="h-2 w-36 bg-current rounded"></div>
        <div className="h-3 w-24 bg-current rounded"></div>
      </div>
    ),
  },
]

export default function StorePage() {
  const [studentPoints, setStudentPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")
    setUserRole(role)

    if (loggedIn && role === "student") {
      fetchStudentData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchStudentData = async () => {
    try {
      const accountNumber = localStorage.getItem("accountNumber")
      const response = await fetch(`/api/students`)
      const data = await response.json()

      const student = data.students?.find((s: any) => s.account_number === Number(accountNumber))

      if (student) {
        setStudentPoints(student.points || 0)
      }
    } catch (error) {
      console.error("[v0] Error fetching student data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/store/${categoryId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl text-[#1a2332]">جاري التحميل...</div>
      </div>
    )
  }

  if (userRole !== "student") {
    return (
      <div className="min-h-screen flex flex-col bg-white" dir="rtl">
        <Header />
        <main className="flex-1 py-12 px-4 sm:px-6 flex items-center justify-center">
          <div className="text-center max-w-md">
            <ShoppingBag className="w-16 h-16 text-[#d8a355] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-[#1a2332] mb-2">يظهر للطلاب فقط</h2>
            <p className="text-lg text-gray-600">هذا القسم متاح للطلاب المسجلين فقط</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Header />

      <main className="flex-1 py-6 md:py-12 px-3 md:px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-[#d8a355]" />
              <h1 className="text-3xl md:text-5xl font-bold text-[#1a2332]">المتجر</h1>
            </div>
            <p className="text-base md:text-lg text-gray-600">استخدم نقاطك لشراء منتجات مميزة</p>
          </div>

          {/* Points Card */}
          <div className="bg-gradient-to-r from-[#00312e] to-[#023232] rounded-xl md:rounded-2xl p-6 md:p-8 mb-8 md:mb-12 text-white shadow-lg">
            <div className="flex items-center justify-center gap-4 md:gap-6">
              <Star className="w-8 h-8 md:w-12 md:h-12 text-[#d8a355]" />
              <div className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-[#d8a355] mb-1 md:mb-2">{studentPoints}</div>
                <p className="text-sm md:text-lg opacity-90">نقطة متاحة للشراء</p>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
            {CATEGORIES.map((category) => {
              const Icon = category.icon
              const isComingSoon = category.id === "coming_soon"

              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 overflow-hidden border-3 relative ${
                    isComingSoon
                      ? "opacity-60 border-gray-200 bg-gray-50"
                      : "border-[#d8a355] hover:border-[#c99347] hover:shadow-2xl hover:scale-105 shadow-lg hover:-translate-y-1"
                  }`}
                  onClick={() => !isComingSoon && handleCategoryClick(category.id)}
                >
                  {!isComingSoon && (
                    <>
                      {/* Top-left corner - Enhanced with circular accent */}
                      <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#d8a355] rounded-tl-lg"></div>
                        <div className="absolute top-1 left-1 w-3 h-3 bg-[#d8a355] rounded-full animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#d8a355]/20 rounded-tl-2xl"></div>
                      </div>

                      {/* Top-right corner - Enhanced with triangular accent */}
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#d8a355] rounded-tr-lg"></div>
                        <div className="absolute top-2 right-2 w-0 h-0 border-t-[8px] border-t-[#d8a355] border-l-[8px] border-l-transparent"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#d8a355]/20 rounded-tr-2xl"></div>
                      </div>

                      {/* Bottom-left corner - Enhanced with square accent */}
                      <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#d8a355] rounded-bl-lg"></div>
                        <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#d8a355]/60 rotate-45"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#d8a355]/20 rounded-bl-2xl"></div>
                      </div>

                      {/* Bottom-right corner - Enhanced with diamond accent */}
                      <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#d8a355] rounded-br-lg"></div>
                        <div
                          className="absolute bottom-3 right-3 w-3 h-3 bg-[#d8a355] rotate-45 animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#d8a355]/20 rounded-br-2xl"></div>
                      </div>

                      {/* Additional decorative elements on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        {/* Glowing corners */}
                        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#d8a355]/20 to-transparent rounded-full blur-xl"></div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#d8a355]/20 to-transparent rounded-full blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#d8a355]/20 to-transparent rounded-full blur-xl"></div>
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#d8a355]/20 to-transparent rounded-full blur-xl"></div>
                      </div>
                    </>
                  )}

                  {/* Design Element */}
                  <div
                    className={`relative overflow-hidden min-h-48 md:min-h-72 flex flex-col justify-between p-6 md:p-8 ${
                      isComingSoon
                        ? "bg-gray-50 text-gray-400"
                        : category.id === "backgrounds"
                          ? "bg-white text-[#d8a355]"
                          : category.id === "badges"
                            ? "bg-white text-[#d8a355]"
                            : "bg-white text-[#d8a355]"
                    }`}
                  >
                    {/* Background Shapes */}
                    {category.design}

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div
                          className={`p-3 md:p-4 rounded-xl shadow-md transition-all ${
                            isComingSoon ? "bg-gray-200" : "bg-white shadow-lg hover:shadow-xl"
                          }`}
                        >
                          <Icon className={`w-6 h-6 md:w-8 md:h-8 ${isComingSoon ? "text-gray-400" : "text-[#d8a355]"}`} />
                        </div>
                      </div>
                      <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${isComingSoon ? "text-gray-500" : "text-[#1a2332]"}`}>
                        {category.name}
                      </h2>
                      <p className={`text-xs md:text-sm ${isComingSoon ? "text-gray-500" : "text-gray-600"}`}>
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <CardContent className="pt-4 md:pt-6">
                    <Button
                      className={`w-full py-4 md:py-6 text-base md:text-lg font-bold transition-all ${
                        isComingSoon
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-[#d8a355] hover:bg-[#c99347] text-white shadow-lg hover:shadow-xl hover:scale-105 transform"
                      }`}
                      disabled={isComingSoon}
                    >
                      {isComingSoon ? "قريباً" : "تصفح"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Info Section */}
          <div className="bg-[#faf9f6] rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-[#d8a355]/20">
            <h2 className="text-xl md:text-2xl font-bold text-[#1a2332] mb-3 md:mb-4">كيف يعمل المتجر؟</h2>
            <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
              <li className="flex items-start gap-2 md:gap-3">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#d8a355] mt-1 flex-shrink-0" />
                <span>استخدم نقاطك المكتسبة من التحضير والإنجاز لشراء المنتجات</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#d8a355] mt-1 flex-shrink-0" />
                <span>كل فئة لديها منتجات مختلفة ومميزة</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#d8a355] mt-1 flex-shrink-0" />
                <span>نقاط ملفك الشخصي وترتيبك في اللائحة لا تتأثر بالشراء</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
