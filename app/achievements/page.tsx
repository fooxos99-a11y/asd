"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Award, Trophy, Medal } from 'lucide-react'
import { useEffect, useState } from "react"

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch("/api/achievements")
        const data = await response.json()
        setAchievements(data.achievements || [])
      } catch (error) {
        console.error("[v0] Error fetching achievements:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "trophy":
        return Trophy
      case "award":
        return Award
      case "medal":
        return Medal
      default:
        return Trophy
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-[#1a2332]">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f5f1e8] to-white">
      <Header />

      <main className="flex-1 py-8 md:py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-[#D4AF37] to-[#C9A961] rounded-full mb-4 md:mb-6">
              <Trophy className="w-7 h-7 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-[#1a2332] mb-2 md:mb-4 text-balance px-2">إنجازات الطلاب المتميزة</h1>
            <p className="text-base md:text-xl text-[#1a2332]/70 px-2">نفخر بإنجازات طلابنا في حلقات القرآن الكريم</p>
          </div>

          {achievements.length === 0 ? (
            <div className="text-center py-16 text-xl text-[#1a2332]/60">لا توجد إنجازات حالياً</div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {achievements.map((achievement) => {
                const IconComponent = getIconComponent(achievement.icon_type)
                return (
                  <div
                    key={achievement.id}
                    className="group relative bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/40"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-64 h-48 md:h-auto flex-shrink-0 bg-gradient-to-br from-[#D4AF37]/10 to-[#C9A961]/10 relative overflow-hidden">
                        {achievement.image_url ? (
                          <img
                            src={achievement.image_url || "/placeholder.svg"}
                            alt={achievement.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-[#D4AF37] to-[#C9A961] rounded-full">
                              <IconComponent className="w-8 h-8 md:w-12 md:h-12 text-white" />
                            </div>
                          </div>
                        )}
                        {/* Top gradient bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 md:h-2 bg-gradient-to-r from-[#D4AF37] to-[#C9A961]" />
                      </div>

                      <div className="flex-1 p-4 md:p-6">
                        {/* Category badge */}
                        <div className="inline-block bg-[#D4AF37]/10 px-2 md:px-3 py-1 rounded-full mb-2 md:mb-3">
                          <span className="text-xs md:text-sm font-semibold text-[#D4AF37]">{achievement.category}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-lg md:text-2xl font-bold text-[#1a2332] mb-1 md:mb-2 text-balance">{achievement.title}</h2>

                        {/* Student name */}
                        <p className="text-base md:text-lg font-semibold text-[#D4AF37] mb-2 md:mb-3">{achievement.student_name}</p>

                        {/* Description */}
                        <p className="text-sm md:text-base text-[#1a2332]/70 leading-relaxed mb-2 md:mb-4">{achievement.description}</p>

                        {/* Date */}
                        <p className="text-xs md:text-sm text-[#1a2332]/60">{achievement.date}</p>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tl from-[#D4AF37]/5 to-transparent rounded-tl-full" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
