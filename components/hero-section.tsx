"use client"

import Image from "next/image"

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-white px-2 sm:px-6 pt-0 pb-2 sm:pb-3"
    >
      <div className="relative z-10 text-center px-0 sm:px-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-start min-h-screen pt-2 sm:pt-10">
        <div className="flex flex-col items-center animate-in fade-in duration-1000 mt-0 mb-0">
          <Image
            src="/images/logo-habib.png.webp"
            alt="مجمع الحبيب لتحفيظ القرآن الكريم"
            width={1800}
            "use client"

            import Image from "next/image"

            export function HeroSection() {
              return (
                <section className="relative min-h-[auto] flex items-start justify-center overflow-hidden bg-gradient-to-b from-white via-[#faf8f5] to-white px-4 sm:px-6 pt-0 pb-2 sm:pb-3">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d8a355] to-transparent opacity-50" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d8a355] to-transparent opacity-50" />

                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, #d8a355 1px, transparent 0)`,
                      backgroundSize: "40px 40px",
                    }}
                  />

                  <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-7xl mx-auto -mt-12 sm:-mt-16">
                    <div className="flex justify-center animate-in fade-in duration-1000">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#00312e]/10 blur-3xl rounded-full" />
                        <Image
                          src="/images/logo-habib.png.webp"
                          alt="مجمع الحبيب لتحفيظ القرآن الكريم"
                          width={800}
                          height={480}
                          className="relative w-96 h-auto sm:w-[500px] sm:h-auto md:w-[600px] md:h-auto lg:w-[700px] lg:h-auto xl:w-[800px] xl:h-auto object-contain drop-shadow-2xl -mb-10 sm:-mb-12"
                          style={{
                            filter:
                              "brightness(0) saturate(100%) invert(13%) sepia(18%) saturate(2847%) hue-rotate(137deg) brightness(95%) contrast(101%)",
                          }}
                          priority
                          sizes="(max-width: 640px) 384px, (max-width: 768px) 500px, (max-width: 1024px) 600px, (max-width: 1280px) 700px, 800px"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 sm:space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 -mt-4">
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
