import React, { useContext, useEffect, useRef } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const LyricsViewer = () => {
  const { track, time } = useContext(PlayerContext)
  const activeLineRef = useRef(null)
  const containerRef = useRef(null)

  // Fallback synced lyrics if not loaded in database (Premium seeded experience!)
  const defaultLyrics = [
    { time: 0, text: "🎵 Synced Lyrics Mode Active" },
    { time: 5, text: "Listening to your favorite tunes" },
    { time: 10, text: "Streaming dynamic audio feeds from Cloudinary" },
    { time: 15, text: "Volume is set to 100% default" },
    { time: 20, text: "Direct play-toggles and custom prioritize queue" },
    { time: 26, text: "Real-time search filters are just a keystroke away" },
    { time: 32, text: "Creator Studio handles uploader additions" },
    { time: 38, text: "No admin panel or complex redirects needed" },
    { time: 45, text: "Designed by a Senior Full-Stack Architect" },
    { time: 52, text: "For the ultimate MERN portfolio showcase" },
    { time: 60, text: "🎵 Playback looping and shuffles supported" }
  ]

  const lyrics = track?.lyrics && track.lyrics.length > 0 ? track.lyrics : defaultLyrics

  const currentTotalSeconds = time.current.minutes * 60 + time.current.seconds

  // Identify active lyric index
  const activeIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1]
    return currentTotalSeconds >= line.time && (!nextLine || currentTotalSeconds < nextLine.time)
  })

  // Auto-scroll the active line into center of container
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [activeIndex])

  if (!track) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-gray-400 select-none'>
        <p className='text-2xl font-bold'>No Track Active</p>
        <p className='text-sm mt-2'>Select a song from your library to stream lyrics.</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className='w-full h-full bg-gradient-to-b from-[#6b0f1a] to-[#121212] overflow-y-auto px-6 py-12 scrollbar-none flex flex-col items-center select-none relative'
    >
      <div className='max-w-2xl w-full text-center flex flex-col gap-6 py-20'>
        {lyrics.map((line, index) => {
          const isActive = index === activeIndex
          const isPast = index < activeIndex

          return (
            <p
              key={index}
              ref={isActive ? activeLineRef : null}
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight transition-all duration-300 leading-relaxed ${
                isActive 
                  ? 'text-white scale-105 drop-shadow-md opacity-100' 
                  : isPast 
                    ? 'text-white/40 blur-[0.5px] scale-98' 
                    : 'text-black/50 scale-95'
              }`}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </div>
  )
}

export default LyricsViewer
