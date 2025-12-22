"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Trophy, Eye, RotateCcw } from "lucide-react"

interface GuessImage {
  id: number
  image_url: string
  answer: string
  hint: string | null
  difficulty: string
}

function GuessImageGamePlayClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const team1Name = searchParams.get("team1") || "الفريق الأول"
  const team2Name = searchParams.get("team2") || "الفريق الثاني"

  const [team1Score, setTeam1Score] = useState(0)
  const [team2Score, setTeam2Score] = useState(0)
  const [currentTurn, setCurrentTurn] = useState<"team1" | "team2">("team1")
  const [images, setImages] = useState<GuessImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [revealedCells, setRevealedCells] = useState<Set<number>>(new Set())
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false)
  const [roundWinner, setRoundWinner] = useState<string | null>(null)
  const [gameWinner, setGameWinner] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch images from database
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/guess-images")
          if (response.ok) {
            const data = await response.json()
            const activeImages = data.filter((img: GuessImage) => img.difficulty)
            const shuffled = activeImages.sort(() => Math.random() - 0.5)
            setImages(shuffled.slice(0, 5))
          }
        } catch (error) {
          console.error("Error fetching images:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchImages()
    }, [])

    // ...existing code (copy all code from the original component here, except export default)
    // ...see below for the rest of the code...
  }

  const resetGame = () => {
    router.push("/competitions/guess-image")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]">
        // ...existing code...
        // ...existing code for GuessImageGamePlayClient (copy all the logic from the original GuessImageGamePlay component here, but rename the function to GuessImageGamePlayClient)...
        <p className="text-xl">جاري التحميل...</p>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <p className="mb-4">لا توجد صور متاحة</p>
            <Button onClick={() => router.push("/competitions")}>
              العودة للمسابقات
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-black mb-2 text-[#d8a355]">
            خمن الصورة
          </h1>
          <p className="text-[#1a2332]/60 text-base sm:text-lg font-medium">
            اكشف الخانات واكتشف الصورة قبل الفريق الآخر!
          </p>
        </div>

        {/* Main Game Layout: Scores Left/Right, Game Center */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-6 items-start">
          {/* Team 1 - Left Side */}
          <Card className={`${currentTurn === "team1" ? "ring-4 ring-[#d8a355] shadow-lg" : ""}`}>
            <CardContent className="p-4 text-center">
              {currentTurn === "team1" && (
                <p className="text-sm font-bold text-[#d8a355] mb-2">دور فريق:</p>
              )}
              <p className="font-bold text-lg text-[#1a2332]">{team1Name}</p>
              <p className="text-4xl font-bold text-[#d8a355] my-4">{team1Score}</p>
              <p className="text-sm text-[#1a2332]/60">الجولة {currentImageIndex + 1}/5</p>
            </CardContent>
          </Card>

          {/* Game Area - Center */}
          <Card>
          <CardContent className="p-2">
            <div className="aspect-square relative bg-transparent rounded-lg overflow-hidden mb-2">
              {/* Hidden full image */}
              <div className="absolute inset-0">
                <img
                  src={images[currentImageIndex]?.image_url}
                  alt="صورة مخفية"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Grid overlay */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-0">
                {Array.from({ length: 25 }, (_, i) => i + 1).map((cellNumber) => (
                  <button
                    key={cellNumber}
                    onClick={() => handleCellClick(cellNumber)}
                    disabled={revealedCells.has(cellNumber)}
                    className={`
                      relative flex items-center justify-center font-bold text-lg
                      transition-all duration-300 border border-white
                      ${
                        revealedCells.has(cellNumber)
                          ? "bg-transparent cursor-default"
                          : "bg-[#d8a355] hover:bg-[#c89547] text-white cursor-pointer hover:scale-95"
                      }
                    `}
                  >
                    {!revealedCells.has(cellNumber) && cellNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center">
              <Button
                onClick={() => setAnswerDialogOpen(true)}
                className="w-full max-w-md bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437]"
                size="lg"
              >
                <Eye className="w-5 h-5 ml-2" />
                أظهر الإجابة
              </Button>
            </div>
          </CardContent>
        </Card>

          {/* Team 2 - Right Side */}
          <Card className={`${currentTurn === "team2" ? "ring-4 ring-[#d8a355] shadow-lg" : ""}`}>
            <CardContent className="p-4 text-center">
              {currentTurn === "team2" && (
                <p className="text-sm font-bold text-[#d8a355] mb-2">دور فريق:</p>
              )}
              <p className="font-bold text-lg text-[#1a2332]">{team2Name}</p>
              <p className="text-4xl font-bold text-[#d8a355] my-4">{team2Score}</p>
              <p className="text-sm text-[#1a2332]/60">الجولة {currentImageIndex + 1}/5</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Answer Selection Dialog */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">💡 الإجابة الصحيحة</DialogTitle>
            <DialogDescription className="text-center text-xl font-bold text-[#d8a355] mt-4">
              {images[currentImageIndex]?.answer}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center font-bold text-lg">
              هل أجاب الفريق: <span className="text-[#d8a355]">{currentTurn === "team1" ? team1Name : team2Name}</span> بشكل صحيح؟
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  // Current team answered correctly
                  if (currentTurn === "team1") {
                    const newScore = team1Score + 1
                    setTeam1Score(newScore)
                    if (newScore === 5) {
                      setGameWinner(team1Name)
                    }
                    setRoundWinner(team1Name)
                  } else {
                    const newScore = team2Score + 1
                    setTeam2Score(newScore)
                    if (newScore === 5) {
                      setGameWinner(team2Name)
                    }
                    setRoundWinner(team2Name)
                  }
                  setAnswerDialogOpen(false)
                  setTimeout(() => {
                    nextRound()
                  }, 2000)
                }}
                className="flex-1 bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437]"
                size="lg"
              >
                نعم
              </Button>
              <Button
                onClick={() => {
                  // Other team gets the point
                  if (currentTurn === "team1") {
                    const newScore = team2Score + 1
                    setTeam2Score(newScore)
                    if (newScore === 5) {
                      setGameWinner(team2Name)
                    }
                    setRoundWinner(team2Name)
                  } else {
                    const newScore = team1Score + 1
                    setTeam1Score(newScore)
                    if (newScore === 5) {
                      setGameWinner(team1Name)
                    }
                    setRoundWinner(team1Name)
                  }
                  setAnswerDialogOpen(false)
                  setTimeout(() => {
                    nextRound()
                  }, 2000)
                }}
                className="flex-1 bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437]"
                size="lg"
              >
                لا
              </Button>
            </div>
            <Button
              onClick={() => setAnswerDialogOpen(false)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Round Winner Dialog */}
      <Dialog open={!!roundWinner && !gameWinner} onOpenChange={() => setRoundWinner(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 أحسنت!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-xl font-bold">{roundWinner} حصل على نقطة!</p>
            <p className="text-sm text-muted-foreground">جاري الانتقال للجولة التالية...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game Winner Dialog */}
      <Dialog open={!!gameWinner} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              🏆 مبروك الفوز!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-6">
            <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
            <p className="text-2xl font-bold bg-gradient-to-r from-[#d8a355] to-[#c89547] bg-clip-text text-transparent">
              {gameWinner}
            </p>
            <p className="text-xl">الفائز باللعبة!</p>
            <div className="text-lg space-y-2">
              <p>{team1Name}: {team1Score} نقاط</p>
              <p>{team2Name}: {team2Score} نقاط</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={resetGame} className="flex-1" size="lg">
                <RotateCcw className="ml-2" />
                لعب مرة أخرى
              </Button>
              <Button
                onClick={() => router.push("/competitions")}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                العودة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

}

export default function GuessImageGamePlay() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]"><p className="text-xl">جاري التحميل...</p></div>}>
      <GuessImageGamePlayClient />
    </Suspense>
  )
}
