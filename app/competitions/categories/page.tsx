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
import { ArrowRight, Check } from "lucide-react"

type DBQuestion = {
  id: string
  category_id: string
  question: string
  answer: string
  points: number
  answered?: boolean
  answeredBy?: string | null
}

type DBCategory = {
  id: string
  name: string
  questions: DBQuestion[]
}

type GameQuestion = {
  id: string
  points: number
  question: string
  answer: string
  answered: boolean
  answeredBy: string | null
}

type GameCategory = {
  id: string
  name: string
  questions: GameQuestion[]
}

export default function CategoriesGame() {
  const [step, setStep] = useState<"teams" | "categories" | "game">("teams")
  const [team1Name, setTeam1Name] = useState("")
  const [team2Name, setTeam2Name] = useState("")
  const [team1Score, setTeam1Score] = useState(0)
  const [team2Score, setTeam2Score] = useState(0)
  const [allCategories, setAllCategories] = useState<DBCategory[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [gameCategories, setGameCategories] = useState<GameCategory[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<GameQuestion | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [editingTeam, setEditingTeam] = useState<"team1" | "team2" | null>(null)
  const [editScore, setEditScore] = useState("")
  const [currentTurn, setCurrentTurn] = useState<"team1" | "team2">("team1")
  const [loading, setLoading] = useState(true)
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchUsedQuestions()
  }, [])

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
    }
  }, [timerActive, timeLeft])

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false)
    }
  }, [timerActive, timeLeft])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setAllCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      setAllCategories([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsedQuestions = async () => {
    try {
      const response = await fetch("/api/used-questions?gameType=categories")
      if (!response.ok) {
        setUsedQuestionIds([])
        return
      }
      const data = await response.json()
      setUsedQuestionIds(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching used questions:", error)
      setUsedQuestionIds([])
    }
  }

  const markQuestionAsUsed = async (questionId: string) => {
    try {
      await fetch("/api/used-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: "categories", questionId })
      })
    } catch (error) {
      console.error("Error marking question as used:", error)
    }
  }

  const resetUsedQuestions = async () => {
    try {
      await fetch("/api/used-questions?gameType=categories", {
        method: "DELETE"
      })
      setUsedQuestionIds([])
    } catch (error) {
      console.error("Error resetting used questions:", error)
    }
  }

  const handleTeamsSubmit = () => {
    if (team1Name.trim() && team2Name.trim()) {
      setStep("categories")
    }
  }

  const toggleCategorySelection = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId))
    } else if (selectedCategoryIds.length < 4) {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId])
    }
  }

  const startGame = () => {
    const usedIds = Array.isArray(usedQuestionIds) ? usedQuestionIds : []
    const selected = allCategories
      .filter(cat => selectedCategoryIds.includes(cat.id))
      .map(cat => {
        const availableQuestions = cat.questions.filter(q => !usedIds.includes(q.id))
        
        // تصنيف الأسئلة حسب النقاط
        const q200 = availableQuestions.filter(q => q.points === 200)
        const q400 = availableQuestions.filter(q => q.points === 400)
        const q600 = availableQuestions.filter(q => q.points === 600)
        
        // اختيار اثنين 200، اثنين 400، واحد 600
        const selectedQuestions = [
          ...(q200.slice(0, 2)),
          ...(q400.slice(0, 2)),
          ...(q600.slice(0, 1))
        ].map(q => ({
          ...q,
          answered: false,
          answeredBy: null
        }))
        
        return {
          id: cat.id,
          name: cat.name,
          questions: selectedQuestions
        }
      })
    
    setGameCategories(selected)
    setStep("game")
  }

  const handleQuestionClick = (categoryId: string, question: GameQuestion) => {
    if (!question.answered) {
      setSelectedCategoryId(categoryId)
      setSelectedQuestion(question)
      setShowAnswer(false)
      setTimeLeft(60)
      setTimerActive(true)
    }
  }

  const handleCorrectAnswer = (team: "team1" | "team2" | "none") => {
    if (selectedQuestion && selectedCategoryId !== null) {
      if (team === "team1") {
        setTeam1Score(team1Score + selectedQuestion.points)
      } else if (team === "team2") {
        setTeam2Score(team2Score + selectedQuestion.points)
      }

      // إضافة السؤال للأسئلة المستخدمة
      const newUsedQuestions = [...usedQuestionIds, selectedQuestion.id]
      setUsedQuestionIds(newUsedQuestions)
      markQuestionAsUsed(selectedQuestion.id)

      setGameCategories(prev =>
        prev.map(cat =>
          cat.id === selectedCategoryId
            ? {
                ...cat,
                questions: cat.questions.map(q =>
                  q.id === selectedQuestion.id
                    ? {
                        ...q,
                        answered: true,
                        answeredBy:
                          team === "team1"
                            ? team1Name
                            : team === "team2"
                            ? team2Name
                            : "لا أحد",
                      }
                    : q
                ),
              }
            : cat
        )
      )

      setCurrentTurn(currentTurn === "team1" ? "team2" : "team1")
      setSelectedQuestion(null)
      setSelectedCategoryId(null)
      setShowAnswer(false)
      setTimerActive(false)
    }
  }

  const handleEditScore = (team: "team1" | "team2") => {
    setEditingTeam(team)
    setEditScore(team === "team1" ? team1Score.toString() : team2Score.toString())
  }

  const handleSaveScore = () => {
    const newScore = parseInt(editScore) || 0
    if (editingTeam === "team1") {
      setTeam1Score(newScore)
    } else if (editingTeam === "team2") {
      setTeam2Score(newScore)
    }
    setEditingTeam(null)
    setEditScore("")
  }

  const handleCancelEdit = () => {
    setEditingTeam(null)
    setEditScore("")
  }

  // صفحة إدخال أسماء الفرق
  if (step === "teams") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5] p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border-2 border-[#d8a355]/20">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-8 text-[#1a2332] bg-gradient-to-r from-[#d8a355] to-[#c89547] bg-clip-text text-transparent">
              لعبة الفئات
            </h1>

            <div className="space-y-6">
              <div>
                <Label htmlFor="team1" className="text-lg font-semibold text-[#1a2332]">
                  اسم الفريق الأول
                </Label>
                <Input
                  id="team1"
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder="أدخل اسم الفريق الأول"
                  className="mt-2 text-lg border-2 border-[#d8a355]/30 focus:border-[#d8a355]"
                />
              </div>

              <div>
                <Label htmlFor="team2" className="text-lg font-semibold text-[#1a2332]">
                  اسم الفريق الثاني
                </Label>
                <Input
                  id="team2"
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder="أدخل اسم الفريق الثاني"
                  className="mt-2 text-lg border-2 border-[#d8a355]/30 focus:border-[#d8a355]"
                />
              </div>

              <Button
                onClick={handleTeamsSubmit}
                disabled={!team1Name.trim() || !team2Name.trim()}
                className="w-full bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437] text-white text-xl py-6 shadow-lg"
              >
                التالي
                <ArrowRight className="mr-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // صفحة اختيار الفئات
  if (step === "categories") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#d8a355]/20">
            <h1 className="text-4xl font-bold text-center mb-4 text-[#1a2332] bg-gradient-to-r from-[#d8a355] to-[#c89547] bg-clip-text text-transparent">
              اختر 4 فئات
            </h1>
            <p className="text-center text-[#1a2332]/70 mb-8">
              تم اختيار {selectedCategoryIds.length} من 4 فئات
            </p>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-[#1a2332]">جاري التحميل...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {allCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategorySelection(category.id)}
                      disabled={!selectedCategoryIds.includes(category.id) && selectedCategoryIds.length >= 4}
                      className={`p-6 rounded-lg border-2 transition-all relative ${
                        selectedCategoryIds.includes(category.id)
                          ? "bg-gradient-to-r from-[#d8a355] to-[#c89547] text-white border-[#b88437] shadow-lg"
                          : "bg-white text-[#1a2332] border-gray-200 hover:border-[#d8a355]"
                      } ${!selectedCategoryIds.includes(category.id) && selectedCategoryIds.length >= 4 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <h3 className="text-lg font-bold text-center">
                        {category.name}
                      </h3>
                      <p className={`text-sm text-center mt-2 ${selectedCategoryIds.includes(category.id) ? "text-white/80" : "text-[#1a2332]/60"}`}>
                        {category.questions?.length || 0} أسئلة
                      </p>
                      {selectedCategoryIds.includes(category.id) && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep("teams")}
                    variant="outline"
                    className="flex-1 text-lg py-6 border-2 border-[#d8a355] text-[#d8a355] hover:bg-[#d8a355]/10"
                  >
                    رجوع
                  </Button>
                  <Button
                    onClick={startGame}
                    disabled={selectedCategoryIds.length !== 4}
                    className="flex-1 bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437] text-white text-lg py-6 shadow-lg"
                  >
                    ابدأ اللعبة
                    <ArrowRight className="mr-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // صفحة اللعبة
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5] p-4">
      <div className="max-w-7xl mx-auto">
        {/* مؤشر الدور الحالي */}
        <div className="bg-gradient-to-r from-[#d8a355] to-[#c89547] text-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 mb-3 sm:mb-4 text-center border-2 border-[#b88437]">
          <p className="text-lg sm:text-2xl font-bold">
            دور الفريق: {currentTurn === "team1" ? team1Name : team2Name}
          </p>
        </div>

        {/* لوحة النقاط */}
        <div className="bg-gradient-to-r from-white via-[#faf8f5] to-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-6 mb-3 sm:mb-6 border-2 border-[#d8a355]/30">
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className={`text-center transition-all duration-300 ${
              currentTurn === "team1" ? "ring-2 sm:ring-4 ring-[#d8a355] rounded-xl shadow-xl scale-105" : "opacity-75"
            }`}>
              <div className="bg-gradient-to-br from-[#faf8f5] to-[#f5ead8] p-2 sm:p-4 rounded-xl border-2 border-[#d8a355]/40">
                <h3 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-[#c89547] to-[#d8a355] bg-clip-text text-transparent mb-1 sm:mb-2">
                  {team1Name}
                </h3>
                <button
                  onClick={() => handleEditScore("team1")}
                  className="text-3xl sm:text-5xl font-black text-[#c89547] hover:text-[#d8a355] transition-all transform hover:scale-110 drop-shadow-lg"
                >
                  {team1Score}
                </button>
                <p className="text-xs text-[#1a2332]/60 mt-1 font-medium">نقطة</p>
              </div>
            </div>
            <div className={`text-center transition-all duration-300 ${
              currentTurn === "team2" ? "ring-2 sm:ring-4 ring-[#d8a355] rounded-xl shadow-xl scale-105" : "opacity-75"
            }`}>
              <div className="bg-gradient-to-br from-[#f5ead8] to-[#faf8f5] p-2 sm:p-4 rounded-xl border-2 border-[#c89547]/40">
                <h3 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-[#d8a355] to-[#c89547] bg-clip-text text-transparent mb-1 sm:mb-2">
                  {team2Name}
                </h3>
                <button
                  onClick={() => handleEditScore("team2")}
                  className="text-3xl sm:text-5xl font-black text-[#d8a355] hover:text-[#c89547] transition-all transform hover:scale-110 drop-shadow-lg"
                >
                  {team2Score}
                </button>
                <p className="text-xs text-[#1a2332]/60 mt-1 font-medium">نقطة</p>
              </div>
            </div>
          </div>
        </div>

        {/* لوحة الفئات */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {gameCategories.map((category) => (
            <div key={category.id} className="flex flex-col">
              {/* عنوان الفئة */}
              <div className="bg-gradient-to-r from-[#d8a355] to-[#c89547] text-white p-2 sm:p-3 text-center font-bold text-sm sm:text-base rounded-t-lg shadow-md">
                {category.name}
              </div>

              {/* الأسئلة */}
              <div className="flex flex-col gap-1 sm:gap-2">
                {category.questions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionClick(category.id, question)}
                    disabled={question.answered}
                    className={`p-2 sm:p-4 text-base sm:text-xl font-bold transition-all rounded-lg ${
                      question.answered
                        ? "bg-white/50 text-gray-300 cursor-not-allowed border-2 border-gray-200"
                        : "bg-white text-[#1a2332] hover:bg-[#faf8f5] cursor-pointer shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-[#d8a355]"
                    }`}
                  >
                    {question.answered ? "✓" : question.points}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مودال السؤال */}
      <Dialog
        open={selectedQuestion !== null}
        onOpenChange={() => {
          setSelectedQuestion(null)
          setShowAnswer(false)
          setTimerActive(false)
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-3xl text-center text-[#1a2332] space-y-2">
              <div>دور الفريق: {currentTurn === "team1" ? team1Name : team2Name}</div>
              <div className="text-lg sm:text-2xl text-[#d8a355]">{selectedQuestion?.points} نقطة</div>
              <div className="text-2xl font-bold" style={{ color: '#00312e' }}>
                ⏱️ {timeLeft}s
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
            <div className="bg-gradient-to-r from-[#faf8f5] to-[#f5ead8] rounded-lg p-4 sm:p-6 border-2 border-[#d8a355]/30">
              <p className="text-lg sm:text-2xl text-center font-semibold text-[#1a2332]">
                {selectedQuestion?.question}
              </p>
            </div>

            {showAnswer && (
              <div className="bg-gradient-to-r from-[#f5ead8] to-[#faf8f5] rounded-lg p-4 sm:p-6 border-2 border-[#d8a355]">
                <p className="text-base sm:text-xl text-center font-bold text-[#1a2332]">
                  الإجابة: {selectedQuestion?.answer}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="w-full bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437] text-white text-xl py-6 shadow-lg"
                >
                  إظهار الإجابة
                </Button>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleCorrectAnswer("team1")}
                    className="bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437] text-white text-lg py-6 shadow-lg"
                  >
                    {team1Name}
                  </Button>
                  <Button
                    onClick={() => handleCorrectAnswer("team2")}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg py-6 shadow-lg"
                  >
                    {team2Name}
                  </Button>
                  <Button
                    onClick={() => handleCorrectAnswer("none")}
                    variant="outline"
                    className="text-lg py-6 border-2 border-gray-400 text-gray-600 hover:bg-gray-100"
                  >
                    محد جاوب
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* مودال تعديل النقاط */}
      <Dialog open={editingTeam !== null} onOpenChange={handleCancelEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-[#1a2332]">
              تعديل نقاط {editingTeam === "team1" ? team1Name : team2Name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="editScore" className="text-lg font-semibold text-[#1a2332]">
                النقاط الجديدة
              </Label>
              <Input
                id="editScore"
                type="number"
                value={editScore}
                onChange={(e) => setEditScore(e.target.value)}
                className="mt-2 text-2xl text-center border-2 border-[#d8a355]/30 focus:border-[#d8a355]"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveScore}
                className={`flex-1 text-lg py-6 ${
                  editingTeam === "team1"
                    ? "bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#b88437]"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                } text-white shadow-lg`}
              >
                حفظ
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                className="flex-1 text-lg py-6 border-2 border-gray-300 hover:bg-gray-100"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
