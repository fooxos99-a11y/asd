"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Lock, Zap, Trophy, BookOpen, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface PathwayLevel {
  id: number
  title: string
  description: string
  week: number
  isLocked: boolean
  isCompleted: boolean
  points: number
  userPoints: number
}

const INITIAL_LEVELS: Omit<PathwayLevel, "isLocked" | "isCompleted" | "userPoints">[] = [
  {
    id: 1,
    title: "المستوى الأول",
    description: "أساسيات المسار التعليمي",
    week: 1,
    points: 100,
  },
  {
    id: 2,
    title: "المستوى الثاني",
    description: "تطور المهارات الأساسية",
    week: 2,
    points: 100,
  },
  {
    id: 3,
    title: "المستوى الثالث",
    description: "البناء على الأساسيات",
    week: 3,
    points: 100,
  },
  {
    id: 4,
    title: "المستوى الرابع",
    description: "تعميق الفهم",
    week: 4,
    points: 100,
  },
  {
    id: 5,
    title: "المستوى الخامس",
    description: "المرحلة المتقدمة",
    week: 5,
    points: 100,
  },
  {
    id: 6,
    title: "المستوى السادس",
    description: "التطبيق العملي",
    week: 6,
    points: 100,
  },
  {
    id: 7,
    title: "المستوى السابع",
    description: "الإتقان والتميز",
    week: 7,
    points: 100,
  },
  {
    id: 8,
    title: "المستوى الثامن",
    description: "التحديات المتقدمة",
    week: 8,
    points: 100,
  },
  {
    id: 9,
    title: "المستوى التاسع",
    description: "قمة الإتقان",
    week: 9,
    points: 100,
  },
  {
    id: 10,
    title: "المستوى العاشر",
    description: "الماستر - الكفاءة العليا",
    week: 10,
    points: 100,
  },
]

export default function PathwaysPage() {
  const [levels, setLevels] = useState<PathwayLevel[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const role = localStorage.getItem("userRole")
    setUserRole(role)

    if (loggedIn && role === "student") {
      loadPathwayData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadPathwayData = async () => {
    try {
      const currentUserStr = localStorage.getItem("currentUser")
      if (!currentUserStr) {
        router.push("/login")
        return
      }
      const currentUser = JSON.parse(currentUserStr)
      const accountNumber = currentUser.account_number

      const savedLevelsStr = localStorage.getItem("dynamicLevels")
      const levelsToUse = savedLevelsStr ? JSON.parse(savedLevelsStr) : INITIAL_LEVELS

      // Load unlocked levels from localStorage
      const unlockedLevelsStr = localStorage.getItem("unlockedLevels")
      const unlockedLevels = unlockedLevelsStr ? JSON.parse(unlockedLevelsStr) : [1]

      const savedData = localStorage.getItem(`pathwayData_${accountNumber}`)

      if (savedData) {
        const data = JSON.parse(savedData)
        setTotalPoints(data.totalPoints || 0)

        const processedLevels = levelsToUse.map((level: any) => {
          const userLevel = data.levels?.find((l: PathwayLevel) => l.id === level.id)

          return {
            ...level,
            isLocked: !unlockedLevels.includes(level.id),
            isCompleted: userLevel?.isCompleted || false,
            userPoints: userLevel?.userPoints || 0,
          }
        })

        setLevels(processedLevels)
      } else {
        const processedLevels = levelsToUse.map((level: any) => {
          return {
            ...level,
            isLocked: !unlockedLevels.includes(level.id),
            isCompleted: false,
            userPoints: 0,
          }
        })

        setLevels(processedLevels)
        setTotalPoints(0)
      }
    } catch (error) {
      console.error("Error loading pathway data:", error)
      setLevels(
        INITIAL_LEVELS.map((level) => ({
          ...level,
          isLocked: level.id !== 1,
          isCompleted: false,
          userPoints: 0,
        })),
      )
    }
    setIsLoading(false)
  }

  const completedLevels = levels.filter((level) => level.isCompleted).length
  const progressPercentage = levels.length > 0 ? (completedLevels / levels.length) * 100 : 0

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
            <BookOpen className="w-16 h-16 text-[#d8a355] mx-auto mb-4" />
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
        <div className="container mx-auto max-w-6xl">
          {/* Page Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-[#d8a355]" />
              <h1 className="text-3xl md:text-5xl font-bold text-[#1a2332]">المسار</h1>
            </div>
            <p className="text-base md:text-lg text-gray-600">تقدم عبر 10 مستويات تعليمية وحقق الإنجازات</p>
            <div className="mt-3 md:mt-4 max-w-2xl mx-auto">
              <p className="text-xs md:text-sm text-[#1a2332] bg-[#faf9f6] border border-[#d8a355] rounded-lg p-2 md:p-3">
                في حال تم إنجاز المستوى في أسبوع بعد الأسبوع المحدد، سيتم خصم نصف النقاط عند احتسابه
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-gradient-to-r from-[#00312e] to-[#023232] rounded-xl md:rounded-2xl p-6 md:p-8 mb-8 md:mb-12 text-white shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Progress Bar - now first */}
              <div className="flex flex-col justify-center md:col-span-2">
                <p className="text-xs md:text-sm opacity-75 mb-2 text-right">التقدم العام</p>
                <Progress value={progressPercentage} className="h-2 md:h-3 [&>div]:origin-right" />
                <p className="text-xs md:text-sm opacity-75 mt-2 text-right">{Math.round(progressPercentage)}% مكتمل</p>
              </div>

              {/* Total Points - now second */}
              <div className="flex flex-col items-center justify-center">
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-[#d8a355] mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-[#d8a355]">{totalPoints}</div>
                <p className="text-base md:text-lg opacity-90">إجمالي النقاط</p>
              </div>
            </div>
          </div>

          {/* Levels Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {levels.map((level) => (
              <div
                key={level.id}
                className={`relative rounded-xl overflow-hidden transition-all duration-300 shadow-sm border border-[#d8a355]/30 bg-white ${
                  level.isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : level.isCompleted
                      ? "ring-2 ring-[#d8a355]"
                      : "hover:shadow-lg"
                }`}
                style={{ minHeight: '210px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px' }}
              >
                {/* Level Card Background */}
                <div
                  className={`flex flex-col justify-between h-full`}
                  style={{ flex: 1 }}
                >
                  {/* Header */}
                  <div>
                    {level.isCompleted && (
                      <div className="flex items-center justify-center mb-2 md:mb-3">
                        <div className="bg-[#d8a355] rounded-full p-1.5 md:p-2">
                          <Check className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                      </div>
                    )}

                    {level.isLocked && (
                      <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
                        <Lock className="w-4 h-4 md:w-6 md:h-6 text-gray-500" />
                      </div>
                    )}

                    <div
                      className={`text-3xl md:text-5xl font-bold mb-1 md:mb-2 ${level.isCompleted ? "text-[#d8a355]" : "text-[#d8a355]"}`}
                    >
                      {level.id}
                    </div>

                    {!level.isLocked && (
                      <h3
                        className={`text-sm md:text-lg font-bold mb-1 ${level.isCompleted ? "text-[#1a2332]" : "text-[#1a2332]"}`}
                      >
                        {level.title}
                      </h3>
                    )}

                    {level.isLocked && <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1">الأسبوع {level.week}</p>}

                    {!level.isLocked && (
                      <p className={`text-xs md:text-sm ${level.isCompleted ? "text-gray-600" : "text-gray-600"}`}>
                        {level.description}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-[#d8a355]/20">
                    {level.isCompleted ? (
                      <div className="flex items-center gap-1 md:gap-2 text-[#d8a355] font-bold text-xs md:text-base justify-center">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                        <span>مكتمل</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 md:gap-3">
                        <div className="flex items-center gap-1 md:gap-2 justify-center">
                          <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#d8a355]" />
                          <span className="text-sm md:text-base font-semibold text-[#1a2332]">{level.points} نقطة</span>
                        </div>

                        {!level.isLocked && (
                          <Button
                            onClick={() => router.push(`/pathways/level/${level.id}`)}
                            className="w-full bg-[#d8a355] hover:bg-[#c99245] text-[#00312e] font-bold h-10 md:h-12 text-sm md:text-base rounded-lg"
                            style={{ marginTop: '4px' }}
                          >
                            ابدأ
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
