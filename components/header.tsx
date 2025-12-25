"use client"

import Image from "next/image"

export function HeroSection() {
  return (
    <section
      className="relative min-h-[auto] flex items-start justify-center overflow-hidden bg-gradient-to-b from-white via-[#faf8f5] to-white px-4 sm:px-6 pt-0 pb-2 sm:pb-3"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d8a355] to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d8a355] to-transparent opacity-50" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #d8a355 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        className="relative z-10 text-center px-0 sm:px-6 w-full max-w-7xl mx-auto flex flex-col items-center min-h-[95vh] sm:min-h-[80vh]"
        style={{ minHeight: 'calc(100vh - 10px)', justifyContent: 'flex-start' }}
      >
        <div className="flex flex-col items-center h-full w-full animate-in fade-in duration-1000 pt-0 mt-0">
          <div className="relative flex flex-col items-center w-full mt-2 sm:mt-[-5rem] mb-0">
            <div className="absolute inset-0 bg-[#00312e]/10 blur-3xl rounded-full" />
            <Image
              src="/images/logo-habib.png.webp"
              alt="مجمع الحبيب لتحفيظ القرآن الكريم"
              width={1400}
              height={1400}
              className="relative w-[210vw] h-auto max-w-[500px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] object-contain drop-shadow-2xl mb-0 mt-0 sm:mb-1"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(2847%) hue-rotate(137deg) brightness(95%) contrast(101%)",
              }}
              priority
              sizes="(max-width: 640px) 210vw, (max-width: 1024px) 1800px, 600px"
            />
          </div>
          <div className="space-y-0 sm:space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 mt-[-1.5rem] sm:mt-[-5rem] md:mt-[-3.5rem] lg:mt-[-4.5rem] xl:mt-[-5rem] w-full flex flex-col items-center justify-center">
            <h1 className="text-6xl sm:text-7xl md:text-4xl lg:text-5xl xl:text-5xl font-bold leading-tight text-[#00312e] px-1 mt-[-2.5rem] sm:mt-0">
              مجمع حلقات الحبيّب
            </h1>
            <p className="text-4xl sm:text-6xl md:text-3xl lg:text-4xl xl:text-4xl font-normal leading-tight text-[#00312e] px-1">
              لتحفيظ القرآن الكريم
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-8 pt-6 sm:pt-8">
              <div className="h-px w-12 sm:w-20 md:w-24 lg:w-32 xl:w-40 bg-gradient-to-r from-transparent to-[#d8a355]" />
              <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#d8a355]" />
              <div className="h-px w-12 sm:w-20 md:w-24 lg:w-32 xl:w-40 bg-gradient-to-l from-transparent to-[#d8a355]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
