"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowRight, Trophy, Sparkles, Eye, EyeOff } from "lucide-react"
import { Puzzle } from "lucide-react"

interface GuessImage {
  id: number
  image_url: string
  answer: string
  hint: string | null
  difficulty: string
}

export default function GuessImageGame() {
  const router = useRouter()
  const [team1Name, setTeam1Name] = useState("")
  const [team2Name, setTeam2Name] = useState("")
  const [team1Score, setTeam1Score] = useState(0)
  const [team2Score, setTeam2Score] = useState(0)
  const [currentTurn, setCurrentTurn] = useState<"team1" | "team2">("team1")
  const [images, setImages] = useState<GuessImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [revealedCells, setRevealedCells] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [guessDialogOpen, setGuessDialogOpen] = useState(false)
  const [guessInput, setGuessInput] = useState("")
  const [showHint, setShowHint] = useState(false)
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
          // Filter only active images and shuffle
          const activeImages = data.filter((img: GuessImage) => img.difficulty)
          const shuffled = activeImages.sort(() => Math.random() - 0.5)
          setImages(shuffled.slice(0, 5)) // Take 5 random images
        }
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleTimeUp()
    }
  }, [timerActive, timeLeft])

  const startGame = () => {
    if (team1Name.trim() && team2Name.trim()) {
      router.push(`/competitions/guess-image/game?team1=${encodeURIComponent(team1Name)}&team2=${encodeURIComponent(team2Name)}`)
    }
  }

  const handleCellClick = (cellNumber: number) => {
    if (!timerActive || revealedCells.has(cellNumber)) return
    
    const newRevealed = new Set(revealedCells)
    newRevealed.add(cellNumber)
    setRevealedCells(newRevealed)
  }

  const handleTimeUp = () => {
    setTimerActive(false)
    // Switch turn
    setCurrentTurn(currentTurn === "team1" ? "team2" : "team1")
    setTimeLeft(30)
    setTimerActive(true)
  }

  const handleGuess = () => {
    setGuessDialogOpen(true)
    setTimerActive(false)
  }

  const submitGuess = () => {
    const currentImage = images[currentImageIndex]
    const isCorrect = guessInput.trim().toLowerCase() === currentImage.answer.toLowerCase()

    if (isCorrect) {
      // Award point to current team
      const winner = currentTurn === "team1" ? team1Name : team2Name
      setRoundWinner(winner)
      
      if (currentTurn === "team1") {
        const newScore = team1Score + 1
        setTeam1Score(newScore)
        if (newScore === 5) {
          setGameWinner(team1Name)
        }
      } else {
        const newScore = team2Score + 1
        setTeam2Score(newScore)
        if (newScore === 5) {
          setGameWinner(team2Name)
        }
      }

      // Show round winner dialog
      setGuessDialogOpen(false)
      setTimerActive(false)
      
      // Move to next round after 2 seconds
      setTimeout(() => {
        nextRound()
      }, 2000)
    } else {
      // Wrong answer - give point to other team and move to next round
      const loser = currentTurn === "team1" ? team1Name : team2Name
      const winner = currentTurn === "team1" ? team2Name : team1Name
      setRoundWinner(winner)
      
      if (currentTurn === "team1") {
        const newScore = team2Score + 1
        setTeam2Score(newScore)
        if (newScore === 5) {
          setGameWinner(team2Name)
        }
      } else {
        const newScore = team1Score + 1
        setTeam1Score(newScore)
        if (newScore === 5) {
          setGameWinner(team1Name)
        }
      }

      setGuessDialogOpen(false)
      setGuessInput("")
      setTimerActive(false)
      
      // Move to next round after 2 seconds
      setTimeout(() => {
        nextRound()
      }, 2000)
    }
  }

  const nextRound = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
      setRevealedCells(new Set())
      setTimeLeft(30)
      setShowHint(false)
      setRoundWinner(null)
      setGuessInput("")
      setTimerActive(true)
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setTeam1Name("")
    setTeam2Name("")
    setTeam1Score(0)
    setTeam2Score(0)
    setCurrentTurn("team1")
    setCurrentImageIndex(0)
    setRevealedCells(new Set())
    setTimeLeft(30)
    setTimerActive(false)
    setGuessDialogOpen(false)
    setGuessInput("")
    setShowHint(false)
    setRoundWinner(null)
    setGameWinner(null)
    // Reshuffle images
    const shuffled = images.sort(() => Math.random() - 0.5)
    setImages(shuffled)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-xl">جاري التحميل...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center">لا توجد صور متاحة</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">يرجى إضافة صور من لوحة التحكم</p>
              <Button onClick={() => router.push("/competitions")}>
                العودة للمسابقات
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-3 text-3xl bg-gradient-to-r from-[#d8a355] to-[#c89547] bg-clip-text text-transparent">
                <span>خمن الصورة</span>
                <span className="inline-flex items-center justify-center rounded-full" style={{background:'#d8a355',width:48,height:48}}>
                  <Puzzle size={28} color="#fff" strokeWidth={2.5} />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-[#faf8f5] to-[#f5ead8] p-6 rounded-lg border-2 border-[#d8a355]/20">
                <h3 className="font-bold text-lg mb-3 text-center text-[#1a2332]">📋 قواعد اللعبة</h3>
                <ul className="space-y-2 text-sm">
                  <li>• الصورة مقسمة إلى 25 خانة (5×5)</li>
                  <li>• كل فريق يختار خانة في دوره لكشفها</li>
                  <li>• لديك 30 ثانية لكل دور</li>
                    <li>• التخمين الصحيح = نقطة للفريق</li>
                    <li>• التخمين الخاطئ = نقطة للفريق الآخر</li>
                  <li>• اللعبة من 5 جولات - أول فريق يحصل على 5 نقاط يفوز</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="team1" className="block mb-1 text-right">اسم الفريق الأول</Label>
                  <Input
                    id="team1"
                    placeholder="أدخل اسم الفريق الأول"
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="team2" className="block mb-1 text-right">اسم الفريق الثاني</Label>
                  <Input
                    id="team2"
                    placeholder="أدخل اسم الفريق الثاني"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>

              <Button
                onClick={startGame}
                disabled={!team1Name.trim() || !team2Name.trim()}
                className="w-full bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437]"
                size="lg"
              >
                ابدأ اللعبة
                <ArrowRight className="w-5 h-5 mr-2" />
              </Button>
            </CardContent>
          </Card>
      </main>
      <Footer />
    </div>
  )
}
