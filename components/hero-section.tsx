"use client"

import Image from "next/image"

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-white px-2 sm:px-6 pt-0 pb-2 sm:pb-3"
    >
      <div className="relative z-10 text-center px-1 sm:px-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-start min-h-screen pt-8 sm:pt-12">
        <div className="flex flex-col items-center animate-in fade-in duration-1000 mt-2 mb-2">
          <Image
            src="/images/logo-habib.png.webp"
            alt="مجمع الحبيب لتحفيظ القرآن الكريم"
            width={1400}
            height={1000}
            className="w-[80vw] max-w-[320px] xs:max-w-[400px] sm:max-w-[520px] md:max-w-[650px] lg:max-w-[800px] h-auto object-contain drop-shadow-2xl"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(2847%) hue-rotate(137deg) brightness(95%) contrast(101%)",
            }}
            priority
            sizes="(max-width: 400px) 80vw, (max-width: 640px) 80vw, (max-width: 768px) 520px, (max-width: 1024px) 650px, (max-width: 1280px) 800px, 1400px"
          />
          <div className="mt-4 space-y-2 sm:space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <h1 className="text-[2.1rem] xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-[#00312e] px-1 xs:px-2">
              مجمع حلقات الحبيّب
            </h1>
            <p className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal leading-tight text-[#00312e] px-1 xs:px-2">
              لتحفيظ القرآن الكريم
            </p>
            <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2 sm:pt-4">
              <div className="h-px w-8 xs:w-10 sm:w-12 md:w-16 bg-gradient-to-r from-transparent to-[#d8a355]" />
              <div className="w-2 h-2 rounded-full bg-[#d8a355]" />
              <div className="h-px w-8 xs:w-10 sm:w-12 md:w-16 bg-gradient-to-l from-transparent to-[#d8a355]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
