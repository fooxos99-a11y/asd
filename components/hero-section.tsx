"use client"

import Image from "next/image"

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white px-2 sm:px-6 pt-0 pb-2 sm:pb-3"
    >
      <div className="relative z-10 text-center px-2 sm:px-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
        <div className="flex justify-center items-center animate-in fade-in duration-1000 min-h-[60vh]">
          <Image
            src="/images/logo-habib.png.webp"
            alt="مجمع الحبيب لتحفيظ القرآن الكريم"
            width={900}
            height={600}
            className="w-[90vw] max-w-[500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto object-contain drop-shadow-2xl"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(2847%) hue-rotate(137deg) brightness(95%) contrast(101%)",
            }}
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 600px, (max-width: 1024px) 700px, (max-width: 1280px) 800px, 900px"
          />
        </div>

        <div className="space-y-1 sm:space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-[#00312e] px-2">
            مجمع حلقات الحبيّب
          </h1>

          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal leading-tight text-[#00312e] px-2">
            لتحفيظ القرآن الكريم
          </p>

          <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-5">
            <div className="h-px w-10 sm:w-12 md:w-16 bg-gradient-to-r from-transparent to-[#d8a355]" />
            <div className="w-2 h-2 rounded-full bg-[#d8a355]" />
            <div className="h-px w-10 sm:w-12 md:w-16 bg-gradient-to-l from-transparent to-[#d8a355]" />
          </div>
        </div>
      </div>
    </section>
  )
}
