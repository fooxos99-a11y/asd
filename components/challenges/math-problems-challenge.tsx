"use client"

import { useState, useEffect } from "react"
import { Clock, Calculator, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface MathProblemsChallengeProps {
  onSuccess: () => void
  onFailure: (message: string) => void
  timeLimit?: number
}

interface Problem {
  question: string
  answer: number
  options: number[]
}

export function MathProblemsChallenge({ onSuccess, onFailure, timeLimit = 60 }: MathProblemsChallengeProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [timerActive, setTimerActive] = useState(true)
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [problems, setProblems] = useState<Problem[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  useEffect(() => {
    generateProblems()
  }, [])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false)
        onFailure("انتهى الوقت قبل حل جميع المسائل")
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          onFailure("انتهى الوقت قبل حل جميع المسائل")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerActive, timeLeft])

  const generateProblems = () => {
    const newProblems: Problem[] = []
    const operations = ["+", "-", "×", "÷"]

    for (let i = 0; i < 5; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)]
      let num1, num2, answer, question

      switch (operation) {
        case "+":
          num1 = Math.floor(Math.random() * 50) + 1
          num2 = Math.floor(Math.random() * 50) + 1
          answer = num1 + num2
          question = `${num1} + ${num2} = ؟`
          break
        case "-":
          num1 = Math.floor(Math.random() * 50) + 20
          num2 = Math.floor(Math.random() * (num1 - 1)) + 1
          answer = num1 - num2
          question = `${num1} - ${num2} = ؟`
          break
        case "×":
          num1 = Math.floor(Math.random() * 12) + 1
          num2 = Math.floor(Math.random() * 12) + 1
          answer = num1 * num2
          question = `${num1} × ${num2} = ؟`
          break
        case "÷":
          num2 = Math.floor(Math.random() * 10) + 2
          answer = Math.floor(Math.random() * 10) + 1
          num1 = num2 * answer
          question = `${num1} ÷ ${num2} = ؟`
          break
        default:
          answer = 0
          question = ""
      }

      // Generate 3 wrong options
      const wrongOptions = []
      while (wrongOptions.length < 3) {
        const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10
        if (wrongAnswer !== answer && !wrongOptions.includes(wrongAnswer) && wrongAnswer > 0) {
          wrongOptions.push(wrongAnswer)
        }
      }

      const options = [answer, ...wrongOptions].sort(() => Math.random() - 0.5)

      newProblems.push({ question, answer, options })
    }

    setProblems(newProblems)
  }

  const handleAnswerSelect = (answer: number) => {
    if (!timerActive) return

    setSelectedAnswer(answer)

    // Check if answer is correct
    if (answer === problems[currentProblemIndex].answer) {
      // Correct answer
      setTimeout(() => {
        if (currentProblemIndex < problems.length - 1) {
          // Move to next problem
          setCurrentProblemIndex(currentProblemIndex + 1)
          setSelectedAnswer(null)
        } else {
          // All problems solved!
          setTimerActive(false)
          onSuccess()
        }
      }, 500)
    } else {
      // Wrong answer - fail immediately
      setTimerActive(false)
      onFailure("إجابة خاطئة! حاول مرة أخرى")
    }
  }

  if (problems.length === 0) {
    return <div className="flex items-center justify-center h-full">جاري التحميل...</div>
  }

  const currentProblem = problems[currentProblemIndex]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#faf8f5] via-[#f5ead8] to-[#faf8f5]">
      <div className="absolute top-6 right-6">
        <div className="flex items-center gap-3 bg-gradient-to-r from-[#d8a355] to-[#c89547] backdrop-blur px-6 py-3 rounded-2xl shadow-xl">
          <Clock className="w-6 h-6 text-white" />
          <span className={`text-3xl font-bold ${timeLeft <= 10 ? "text-red-100 animate-pulse" : "text-white"}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <Calculator className="w-10 h-10 text-[#d8a355]" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#d8a355] to-[#c89547] bg-clip-text text-transparent">
            حل المسائل
          </h2>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          {problems.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index < currentProblemIndex
                  ? "bg-green-500"
                  : index === currentProblemIndex
                    ? "bg-[#d8a355] scale-125"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-xl text-[#1a2332]/80 font-medium">
          المسألة {currentProblemIndex + 1} من {problems.length}
        </p>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border-8 border-[#d8a355] bg-gradient-to-br from-white to-[#faf8f5]">
        <CardContent className="p-12">
          <div className="text-center mb-12">
            <div className="text-6xl font-bold text-[#1a2332] mb-4 font-mono">{currentProblem.question}</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {currentProblem.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null || !timerActive}
                className={`h-24 text-3xl font-bold transition-all ${
                  selectedAnswer === option
                    ? option === currentProblem.answer
                      ? "bg-green-500 hover:bg-green-600 text-white scale-105"
                      : "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gradient-to-r from-[#d8a355] to-[#c89547] hover:from-[#c89547] hover:to-[#d8a355] text-white hover:scale-105"
                }`}
              >
                {selectedAnswer === option && option === currentProblem.answer && (
                  <CheckCircle2 className="w-8 h-8 ml-2" />
                )}
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
