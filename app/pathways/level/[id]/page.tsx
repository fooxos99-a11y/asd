"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowRight, CheckCircle, XCircle, FileText, Video, LinkIcon, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"

interface Quiz {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

interface LevelContent {
  id: number
  content_type: string
  content_title: string
  content_description: string
  content_url: string
  content_file_name: string
}

const QUIZZES: Record<number, Quiz[]> = {
  1: [
    {
      id: 1,
      question: "ما هي الخطوة الأولى في المسار التعليمي؟",
      options: ["فهم الأساسيات", "التطبيق العملي", "الاختبار النهائي", "المراجعة"],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: "كم عدد مستويات المسار التعليمي؟",
      options: ["5 مستويات", "8 مستويات", "10 مستويات", "7 مستويات"],
      correctAnswer: 2,
    },
    {
      id: 3,
      question: "كم نقطة تحصل على الإجابة الصحيحة الواحدة؟",
      options: ["10 نقاط", "15 نقطة", "20 نقطة", "25 نقطة"],
      correctAnswer: 2,
    },
    {
      id: 4,
      question: "متى يتم فتح المستوى الثالث؟",
      options: ["في الأسبوع الأول", "في الأسبوع الثاني", "في الأسبوع الثالث", "في الأسبوع الرابع"],
      correctAnswer: 1,
    },
    {
      id: 5,
      question: "ما هي مكافأة إكمال المستوى الواحد؟",
      options: ["50 نقطة", "75 نقطة", "100 نقطة", "150 نقطة"],
      correctAnswer: 2,
    },
  ],
  2: [
    {
      id: 1,
      question: "كيف يمكن تحسين المهارات الأساسية؟",
      options: ["بالممارسة المستمرة", "بقراءة الكتب", "بمشاهدة الفيديوهات", "بكل ما سبق"],
      correctAnswer: 3,
    },
    {
      id: 2,
      question: "ما أهمية التقييم الذاتي؟",
      options: ["لتضييع الوقت", "لمعرفة نقاط القوة والضعف", "للحصول على المزيد من النقاط", "لا يوجد أهمية"],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "كم المدة المناسبة للدراسة اليومية؟",
      options: ["ساعة واحدة", "ساعتين", "ثلاث ساعات", "يختلف حسب قدرات الفرد"],
      correctAnswer: 3,
    },
    {
      id: 4,
      question: "ما دور المعلم في التعليم الحديث؟",
      options: ["نقل المعلومات فقط", "الإشراف والتوجيه", "تقييم الطلاب", "كل ما سبق"],
      correctAnswer: 3,
    },
    {
      id: 5,
      question: "كيف تتعامل مع الأخطاء في التعلم؟",
      options: ["بتجاهلها", "بفهمها والتعلم منها", "باليأس", "بعدم المحاولة مجددًا"],
      correctAnswer: 1,
    },
  ],
}

export default function LevelPage() {
  const params = useParams()
  const router = useRouter()
  const levelId = Number.parseInt(params.id as string) || 1

  const [showContent, setShowContent] = useState(true)
  const [contents, setContents] = useState<LevelContent[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(true)

  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLevelCompleted, setIsLevelCompleted] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    const quizzesStr = localStorage.getItem("levelQuizzes")
    const allQuizzes = quizzesStr ? JSON.parse(quizzesStr) : {}
    const levelQuizzes = allQuizzes[levelId] || QUIZZES[levelId] || QUIZZES[1]

    setQuizzes(levelQuizzes)
    setQuizAnswers(new Array(levelQuizzes.length).fill(-1))

    const currentUserStr = localStorage.getItem("currentUser")
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr)
      const accountNumber = currentUser.account_number
      const existingData = JSON.parse(localStorage.getItem(`pathwayData_${accountNumber}`) || "{}")
      const completedLevel = existingData.levels?.find((l: any) => l.id === levelId && l.isCompleted)
      if (completedLevel) {
        setIsLevelCompleted(true)
      }
    }

    const loadLevelContent = () => {
      const contentsStr = localStorage.getItem("levelContents")
      const allContents = contentsStr ? JSON.parse(contentsStr) : {}
      const levelContent = allContents[levelId] || []
      setContents(levelContent)
      setIsLoadingContent(false)

      if (levelContent.length === 0) {
        setShowContent(false)
      }
    }

    loadLevelContent()
  }, [levelId])

  const fetchLevelContent = async () => {}

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers]
    newAnswers[questionIndex] = answerIndex
    setQuizAnswers(newAnswers)
  }

  const calculateScore = () => {
    let correctCount = 0
    quizzes.forEach((quiz, index) => {
      if (quizAnswers[index] === quiz.correctAnswer) {
        correctCount++
      }
    })
    return correctCount
  }

  const handleSubmit = async () => {
    if (isLevelCompleted) {
      alert("لقد أكملت هذا المستوى بالفعل. لا يمكنك إعادة الاختبار.")
      return
    }

    if (quizAnswers.includes(-1)) {
      setShowValidation(true)
      setTimeout(() => setShowValidation(false), 3000)
      return
    }

    setIsSubmitting(true)
    try {
      const currentUserStr = localStorage.getItem("currentUser")
      if (!currentUserStr) {
        alert("يرجى تسجيل الدخول أولاً")
        router.push("/login")
        return
      }
      const currentUser = JSON.parse(currentUserStr)
      const accountNumber = currentUser.account_number

      const correctCount = calculateScore()
      const pointsPerQuestion = Math.round(100 / quizzes.length)
      let earnedPoints = correctCount * pointsPerQuestion
      earnedPoints = Math.ceil(earnedPoints) // Round up fractional points using Math.ceil to ensure 20.5 becomes 21

      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, points")
        .eq("account_number", accountNumber)
        .single()

      if (studentData && !studentError) {
        const currentPoints = studentData?.points || 0
        const newTotalPoints = currentPoints + earnedPoints

        const { error: updateError } = await supabase
          .from("students")
          .update({ points: newTotalPoints })
          .eq("id", studentData.id)

        if (updateError) {
          console.error("[v0] Error updating points:", updateError)
          throw new Error("Failed to update points in database")
        }

        console.log("[v0] Points updated successfully:", {
          oldPoints: currentPoints,
          newPoints: newTotalPoints,
          earned: earnedPoints,
        })
      }

      const existingData = JSON.parse(localStorage.getItem(`pathwayData_${accountNumber}`) || "{}")
      const existingLevels = existingData.levels || []

      const levelIndex = existingLevels.findIndex((l: any) => l.id === levelId)
      if (levelIndex >= 0) {
        existingLevels[levelIndex] = {
          id: levelId,
          isCompleted: true,
          userPoints: earnedPoints,
        }
      } else {
        existingLevels.push({
          id: levelId,
          isCompleted: true,
          userPoints: earnedPoints,
        })
      }

      const newTotalPoints = (existingData.totalPoints || 0) + earnedPoints
      const newCurrentLevel = Math.max(existingData.currentLevel || 1, levelId + 1)

      const updatedData = {
        ...existingData,
        totalPoints: newTotalPoints,
        currentLevel: newCurrentLevel,
        levels: existingLevels,
      }

      localStorage.setItem(`pathwayData_${accountNumber}`, JSON.stringify(updatedData))
      setIsLevelCompleted(true)
      setShowResults(true)
    } catch (error) {
      console.error("[v0] Error submitting quiz:", error)
      alert("حدث خطأ في إرسال الإجابات")
    } finally {
      setIsSubmitting(false)
    }
  }

  const correctCount = calculateScore()
  const totalQuestions = quizzes.length
  const scorePercentage = (correctCount / totalQuestions) * 100

  const getContentIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-6 h-6" />
      case "video":
        return <Video className="w-6 h-6" />
      case "link":
        return <LinkIcon className="w-6 h-6" />
      default:
        return <FileText className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => router.push("/pathways")}
              variant="outline"
              className="flex items-center gap-2 border-[#d8a355] text-[#d8a355] hover:bg-[#d8a355]/10"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة</span>
            </Button>
            <h1 className="text-3xl font-bold text-[#1a2332]">المستوى {levelId}</h1>
          </div>

          {showValidation && (
            <Card className="mb-6 bg-[#faf9f6] border-2 border-[#d8a355] shadow-lg animate-in fade-in slide-in-from-top-2">
              <CardContent className="py-4">
                <p className="text-center text-[#1a2332] font-semibold">الرجاء الإجابة على جميع الأسئلة</p>
              </CardContent>
            </Card>
          )}

          {isLevelCompleted && !showResults && (
            <Card className="mb-6 bg-[#faf9f6] border-2 border-[#d8a355] shadow-lg">
              <CardContent className="py-4">
                <p className="text-center text-[#d8a355] font-bold text-lg">
                  لقد أكملت هذا المستوى بالفعل. لا يمكنك إعادة الاختبار.
                </p>
              </CardContent>
            </Card>
          )}

          {showContent && !showResults ? (
            <div className="space-y-6">
              {/* Content Instructions */}
              <Card className="bg-blue-50 border-blue-300">
                <CardHeader>
                  <CardTitle className="text-blue-900">المحتوى التعليمي</CardTitle>
                  <CardDescription className="text-blue-700">
                    راجع المواد التعليمية التالية قبل بدء الاختبار
                  </CardDescription>
                </CardHeader>
              </Card>

              {isLoadingContent ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">جاري تحميل المحتوى...</p>
                  </CardContent>
                </Card>
              ) : contents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500 mb-4">لا يوجد محتوى تعليمي لهذا المستوى</p>
                    <Button
                      onClick={() => setShowContent(false)}
                      className="bg-[#d8a355] hover:bg-[#c99245] text-[#00312e] font-bold"
                    >
                      الانتقال للاختبار
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Content Items */}
                  {contents.map((content, index) => (
                    <Card key={content.id} className="border-[#d8a355]">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#d8a355]/10 rounded-lg text-[#d8a355]">
                            {getContentIcon(content.content_type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#1a2332] mb-2">{content.content_title}</h3>
                            {content.content_description && (
                              <p className="text-gray-600 mb-4">{content.content_description}</p>
                            )}
                            {content.content_url && (
                              <a
                                href={content.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#d8a355] hover:underline font-medium"
                              >
                                {content.content_type === "video" ? (
                                  <>
                                    <PlayCircle className="w-5 h-5" />
                                    مشاهدة الفيديو
                                  </>
                                ) : content.content_type === "pdf" ? (
                                  <>
                                    <FileText className="w-5 h-5" />
                                    فتح PDF
                                  </>
                                ) : (
                                  <>
                                    <LinkIcon className="w-5 h-5" />
                                    فتح الرابط
                                  </>
                                )}
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Start Quiz Button */}
                  <Button
                    onClick={() => setShowContent(false)}
                    className="w-full bg-[#d8a355] hover:bg-[#c99245] text-[#00312e] font-bold h-12 text-base"
                  >
                    بدء الاختبار
                  </Button>
                </>
              )}
            </div>
          ) : !showResults ? (
            <div className="space-y-6">
              {/* Quiz Instructions */}
              <Card className="bg-[#faf9f6] border-2 border-[#d8a355]">
                <CardHeader>
                  <CardTitle className="text-[#1a2332]">اختبار المستوى</CardTitle>
                  <CardDescription className="text-gray-700">
                    أجب على 5 أسئلة لإكمال هذا المستوى. كل إجابة صحيحة تساوي 20 نقطة
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Questions */}
              {quizzes.map((quiz, questionIndex) => (
                <Card key={quiz.id} className="border-[#d8a355]">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#1a2332]">
                      السؤال {questionIndex + 1}: {quiz.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={quizAnswers[questionIndex] >= 0 ? quizAnswers[questionIndex].toString() : ""}
                      onValueChange={(value) => handleAnswer(questionIndex, Number.parseInt(value))}
                    >
                      <div className="space-y-3">
                        {quiz.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem
                              value={optionIndex.toString()}
                              id={`q${questionIndex}-o${optionIndex}`}
                              className="border-[#d8a355] text-[#d8a355]"
                            />
                            <Label
                              htmlFor={`q${questionIndex}-o${optionIndex}`}
                              className="cursor-pointer flex-1 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLevelCompleted}
                className="w-full bg-[#d8a355] hover:bg-[#c99245] text-[#00312e] font-bold h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "جاري الإرسال..." : isLevelCompleted ? "تم إكمال المستوى" : "إرسال الإجابات"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Card */}
              <Card className="border-4 border-[#d8a355] bg-[#faf9f6]">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-[#d8a355]" />
                  </div>

                  <CardTitle className="text-3xl mb-2 text-[#1a2332]">تم إكمال الاختبار</CardTitle>

                  <CardDescription className="text-gray-700">
                    لقد أجبت على {correctCount} من {totalQuestions} أسئلة بشكل صحيح
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="bg-white rounded-lg p-6 mb-6 border-2 border-[#d8a355]">
                    <p className="text-sm text-gray-600 mb-2">النقاط المكتسبة</p>
                    <div className="text-5xl font-bold text-[#d8a355]">
                      {correctCount * Math.round(100 / quizzes.length)}
                      <span className="text-xl"> نقطة</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {correctCount} إجابة صحيحة × {Math.round(100 / quizzes.length)} نقطة
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Answer Review */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#1a2332] mb-4">مراجعة الإجابات</h2>
                {quizzes.map((quiz, questionIndex) => {
                  const isCorrect = quizAnswers[questionIndex] === quiz.correctAnswer
                  return (
                    <Card
                      key={quiz.id}
                      className={`border-2 ${isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base text-[#1a2332]">{quiz.question}</CardTitle>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">
                          <span className="font-bold">إجابتك:</span>{" "}
                          <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                            {quiz.options[quizAnswers[questionIndex]]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm">
                            <span className="font-bold text-green-700">الإجابة الصحيحة:</span>{" "}
                            <span className="text-green-700">{quiz.options[quiz.correctAnswer]}</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <Button
                  onClick={() => router.push("/pathways")}
                  className="flex-1 bg-[#d8a355] hover:bg-[#c99245] text-[#00312e] font-bold h-12 text-base"
                >
                  العودة إلى المسار
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
