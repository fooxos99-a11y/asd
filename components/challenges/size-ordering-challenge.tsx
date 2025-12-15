"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock } from "lucide-react"

interface Box {
  id: number
  size: number
  clicked: boolean
  order: number
  shape: string
}

interface SizeOrderingChallengeProps {
  onSuccess: () => void
  onFailure: (message: string) => void
  timeLimit?: number
}

export function SizeOrderingChallenge({ onSuccess, onFailure, timeLimit = 60 }: SizeOrderingChallengeProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [timerActive, setTimerActive] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const maxRounds = 3

  const generateRandomShapes = () => {
    const shapes = ["square", "circle", "triangle", "diamond", "star", "hexagon"]
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
    return Array(6).fill(randomShape)
  }

  const shapes = generateRandomShapes()
  const [boxes, setBoxes] = useState<Box[]>(
    [
      { id: 1, size: 200, clicked: false, order: 1, shape: shapes[0] },
      { id: 2, size: 180, clicked: false, order: 2, shape: shapes[1] },
      { id: 3, size: 160, clicked: false, order: 3, shape: shapes[2] },
      { id: 4, size: 140, clicked: false, order: 4, shape: shapes[3] },
      { id: 5, size: 120, clicked: false, order: 5, shape: shapes[4] },
      { id: 6, size: 100, clicked: false, order: 6, shape: shapes[5] },
    ].sort(() => Math.random() - 0.5),
  )

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false)
        onFailure("انتهى الوقت قبل إكمال التحدي")
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          onFailure("انتهى الوقت قبل إكمال التحدي")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerActive, timeLeft])

  const startNewRound = () => {
    const newShapes = generateRandomShapes()
    const newBoxes = [
      { id: 1, size: 200, clicked: false, order: 1, shape: newShapes[0] },
      { id: 2, size: 180, clicked: false, order: 2, shape: newShapes[1] },
      { id: 3, size: 160, clicked: false, order: 3, shape: newShapes[2] },
      { id: 4, size: 140, clicked: false, order: 4, shape: newShapes[3] },
      { id: 5, size: 120, clicked: false, order: 5, shape: newShapes[4] },
      { id: 6, size: 100, clicked: false, order: 6, shape: newShapes[5] },
    ].sort(() => Math.random() - 0.5)

    setBoxes(newBoxes)
    setCurrentStep(0)
    setGameOver(false)
  }

  const handleBoxClick = (boxId: number) => {
    if (gameOver || !timerActive) return

    const clickedBox = boxes.find((b) => b.id === boxId)
    if (!clickedBox || clickedBox.clicked) return

    const correctBox = boxes.filter((b) => !b.clicked).sort((a, b) => b.size - a.size)[0]

    if (clickedBox.id !== correctBox.id) {
      setTimerActive(false)
      setGameOver(true)
      onFailure("ضغطت على الشكل الخطأ!")
      return
    }

    const newBoxes = boxes.map((b) => (b.id === boxId ? { ...b, clicked: true } : b))
    setBoxes(newBoxes)
    setCurrentStep(currentStep + 1)

    if (currentStep + 1 === boxes.length) {
      if (currentRound === maxRounds) {
        setTimerActive(false)
        onSuccess()
      } else {
        setCurrentRound(currentRound + 1)
        setTimeout(() => {
          startNewRound()
        }, 1500)
      }
    }
  }

  const renderShape = (box: Box) => {
    const size = box.size
    const baseClass = `transition-all duration-300 shadow-lg flex items-center justify-center font-bold text-white ${
      box.clicked
        ? "bg-green-500 opacity-50 cursor-not-allowed"
        : gameOver
          ? "bg-red-500 opacity-50 cursor-not-allowed"
          : "bg-gradient-to-br from-[#D4AF37] to-[#C9A961] hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95"
    }`

    const shapeStyles: Record<string, string> = {
      square: "rounded-2xl",
      circle: "rounded-full",
      triangle: "rounded-2xl",
      diamond: "rounded-2xl",
      star: "rounded-2xl",
      hexagon: "rounded-2xl",
    }

    const clipPaths: Record<string, string> = {
      square: "none",
      circle: "none",
      triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
      diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    }

    return (
      <button
        key={box.id}
        onClick={() => handleBoxClick(box.id)}
        disabled={box.clicked || gameOver || !timerActive}
        className={`${baseClass} ${shapeStyles[box.shape]}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          clipPath: clipPaths[box.shape],
        }}
      >
        {box.clicked && <CheckCircle className="w-12 h-12" />}
      </button>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4 flex gap-4">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full">
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          <span className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-[#1a2332]"}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full">
          <span className="text-xl font-bold text-[#1a2332]">
            الجولة {currentRound}/{maxRounds}
          </span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#1a2332] mb-2">اضغط على الأشكال من الأكبر إلى الأصغر!</h2>
        {currentStep === boxes.length && currentRound < maxRounds && (
          <p className="text-2xl text-green-600 font-bold animate-pulse">أحسنت! استعد للجولة التالية...</p>
        )}
      </div>

      <div className="relative w-full max-w-4xl h-[600px] bg-white/50 rounded-3xl border-4 border-[#D4AF37]/30 shadow-2xl flex items-center justify-center">
        <div className="grid grid-cols-3 gap-6 p-8">{boxes.map((box) => renderShape(box))}</div>
      </div>
    </div>
  )
}
