"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface ColorDifferenceChallengeProps {
  onSuccess: () => void
  onFailure: (message: string) => void
  timeLimit?: number
}

export function ColorDifferenceChallenge({ onSuccess, onFailure, timeLimit = 60 }: ColorDifferenceChallengeProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [timerActive, setTimerActive] = useState(true)
  const [gridSize] = useState(4) // 4x4 grid = 16 shapes
  const [differentIndex, setDifferentIndex] = useState(0)
  const [baseColor, setBaseColor] = useState("")
  const [differentColor, setDifferentColor] = useState("")
  const [shapes, setShapes] = useState<string[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [totalRounds] = useState(3)

  useEffect(() => {
    generateChallenge()
  }, [])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        setTimerActive(false)
        onFailure("انتهى الوقت قبل إكمال الجولات الثلاث")
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          onFailure("انتهى الوقت قبل إكمال الجولات الثلاث")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerActive, timeLeft])

  const generateChallenge = () => {
    // Generate random base color
    const hue = Math.floor(Math.random() * 360)
    const saturation = 60 + Math.floor(Math.random() * 20) // 60-80%
    const lightness = 50 + Math.floor(Math.random() * 10) // 50-60%

    const base = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    // Different color with slight variation (5-10% lighter or darker)
    const lightnessVariation = Math.random() > 0.5 ? 8 : -8
    const different = `hsl(${hue}, ${saturation}%, ${lightness + lightnessVariation}%)`

    setBaseColor(base)
    setDifferentColor(different)

    // Random position for different shape
    const randomIndex = Math.floor(Math.random() * (gridSize * gridSize))
    setDifferentIndex(randomIndex)

    // Generate random shape types
    const shapeTypes = ["square", "circle", "triangle", "diamond", "star", "hexagon"]
    const selectedShape = shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
    setShapes(Array(gridSize * gridSize).fill(selectedShape))
  }

  const handleShapeClick = (index: number) => {
    if (!timerActive) return

    if (index === differentIndex) {
      if (currentRound < totalRounds) {
        // Move to next round
        setCurrentRound(currentRound + 1)
        generateChallenge()
      } else {
        // All rounds completed!
        setTimerActive(false)
        onSuccess()
      }
    } else {
      setTimerActive(false)
      onFailure("ضغطت على الشكل الخطأ!")
    }
  }

  const renderShape = (index: number) => {
    const isCorrect = index === differentIndex
    const color = isCorrect ? differentColor : baseColor
    const shape = shapes[index]

    const clipPaths: Record<string, string> = {
      square: "none",
      circle: "none",
      triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
      diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
    }

    const shapeClass = shape === "circle" ? "rounded-full" : "rounded-lg"

    return (
      <button
        key={index}
        onClick={() => handleShapeClick(index)}
        disabled={!timerActive}
        className={`w-full aspect-square transition-all duration-200 ${shapeClass} ${
          timerActive ? "hover:scale-105 cursor-pointer active:scale-95" : "cursor-not-allowed"
        }`}
        style={{
          backgroundColor: color,
          clipPath: clipPaths[shape],
        }}
      />
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full">
          <Clock className="w-5 h-5 text-[#D4AF37]" />
          <span className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-[#1a2332]"}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#1a2332] mb-2">اعثر على الشكل المختلف!</h2>
        <p className="text-xl text-[#1a2332]/70">ابحث عن الشكل الذي يختلف قليلاً في اللون</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalRounds }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all ${
                index < currentRound - 1
                  ? "bg-green-500"
                  : index === currentRound - 1
                    ? "bg-[#d8a355] scale-125"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-lg text-[#1a2332]/60 mt-2">
          الجولة {currentRound} من {totalRounds}
        </p>
      </div>

      <div
        className="grid gap-4 w-full max-w-2xl bg-white/50 p-8 rounded-3xl border-4 border-[#D4AF37]/30 shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => renderShape(index))}
      </div>
    </div>
  )
}
