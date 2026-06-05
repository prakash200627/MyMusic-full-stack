import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext';

const Player = () => {
  const navigate = useNavigate();

  const {
    track, seekBar, seekBg, playStatus, play, pause, time, previous, next, seekSong,
    volume, changeVolume, isMuted, toggleMute, isShuffle, setIsShuffle, repeatMode, toggleRepeatMode,
    showNowPlaying, setShowNowPlaying, activeRightSidebarTab, setActiveRightSidebarTab
  } = useContext(PlayerContext);

  const greenFilter = { filter: 'invert(47%) sepia(86%) saturate(1989%) hue-rotate(114deg) brightness(96%) contrast(101%)' };

  const handlePlaysIconClick = () => {
    if (showNowPlaying && activeRightSidebarTab === 'nowPlaying') {
      setShowNowPlaying(false);
    } else {
      setShowNowPlaying(true);
      setActiveRightSidebarTab('nowPlaying');
    }
  }

  const handleQueueIconClick = () => {
    if (showNowPlaying && activeRightSidebarTab === 'queue') {
      setShowNowPlaying(false);
    } else {
      setShowNowPlaying(true);
      setActiveRightSidebarTab('queue');
    }
  }

  return track ?  (
    <div className='h-[10%] bg-white dark:bg-black text-gray-900 dark:text-white border-t border-gray-200 dark:border-[#282828] flex items-center px-4 justify-between select-none relative z-50 transition-all duration-300'>
      
      {/* Left Panel: Track Artwork */}
      <div className='w-80 flex items-center flex-shrink-0'>
        <div className='hidden lg:flex items-center gap-4 w-full'>
          <img className='w-12 h-12 object-cover rounded shadow-sm border border-gray-300 dark:border-gray-800' src={track.image} alt="" />
          <div className='overflow-hidden'>
            <p className='max-w-[150px] truncate font-semibold text-sm hover:underline cursor-pointer'>{track.title || track.name}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5'>{track.artistName || "MyMusic Artist"}</p>
          </div>
        </div>
      </div>

      {/* Center Controls: Streaming Ticker */}
      <div className='flex-1 flex flex-col items-center gap-1.5 min-w-0 px-4'>
        <div className='flex gap-5 items-center'>
          {/* Shuffle SVG Icon */}
          <svg 
            onClick={() => setIsShuffle(!isShuffle)} 
            className={`w-4 h-4 cursor-pointer transition-all hover:scale-110 active:scale-95 ${
              isShuffle 
                ? 'text-[#1db954] opacity-100 font-bold' 
                : 'text-gray-500 dark:text-gray-400 opacity-70 hover:opacity-100'
            }`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            title={isShuffle ? "Shuffle is ON" : "Shuffle is OFF"}
          >
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <path d="M15 15l6 6" />
            <path d="M4 4l5 5" />
          </svg>

          {/* Previous SVG Icon */}
          <svg 
            onClick={previous} 
            className="w-4 h-4 cursor-pointer text-gray-800 dark:text-gray-200 hover:text-[#1db954] dark:hover:text-[#1db954] opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-95" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            title="Previous"
          >
            <polygon points="19,20 9,12 19,4" />
            <rect x="5" y="4" width="2" height="16" />
          </svg>

          {/* Play/Pause SVG Icon */}
          {playStatus ? (
            <svg 
              onClick={pause} 
              className="w-5 h-5 cursor-pointer text-gray-950 dark:text-white hover:text-[#1db954] dark:hover:text-[#1db954] hover:scale-115 active:scale-90 transition-all" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              title="Pause"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg 
              onClick={play} 
              className="w-5 h-5 cursor-pointer text-gray-950 dark:text-white hover:text-[#1db954] dark:hover:text-[#1db954] hover:scale-115 active:scale-90 transition-all" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              title="Play"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}

          {/* Next SVG Icon */}
          <svg 
            onClick={next} 
            className="w-4 h-4 cursor-pointer text-gray-800 dark:text-gray-200 hover:text-[#1db954] dark:hover:text-[#1db954] opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-95" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            title="Next"
          >
            <polygon points="5,4 15,12 5,20" />
            <rect x="17" y="4" width="2" height="16" />
          </svg>

          {/* Loop/Repeat Cycle Mode Button */}
          <div className="relative flex flex-col items-center justify-center">
            {repeatMode === 'off' && (
              <svg 
                onClick={toggleRepeatMode} 
                className="w-4 h-4 cursor-pointer text-gray-550 dark:text-gray-400 opacity-70 hover:opacity-100 transition-all hover:scale-110 active:scale-95" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                title="Repeat is OFF"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            )}
            
            {repeatMode === 'context' && (
              <>
                <svg 
                  onClick={toggleRepeatMode} 
                  className="w-4 h-4 cursor-pointer text-[#1db954] transition-all hover:scale-110 active:scale-95" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  title="Repeat Playlist / Album"
                >
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span className="w-1 h-1 bg-[#1db954] rounded-full absolute -bottom-1.5 animate-pulse"></span>
              </>
            )}
            
            {repeatMode === 'track' && (
              <>
                <svg 
                  onClick={toggleRepeatMode} 
                  className="w-4 h-4 cursor-pointer text-[#1db954] transition-all hover:scale-110 active:scale-95" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  title="Repeat Current Song"
                >
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  <text x="12" y="14.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none" textAnchor="middle">1</text>
                </svg>
                <span className="w-1 h-1 bg-[#1db954] rounded-full absolute -bottom-1.5 animate-pulse"></span>
              </>
            )}
          </div>
        </div>
        
        {/* Seek timeline */}
        <div className='flex items-center gap-3 w-full justify-center text-xs text-gray-500 dark:text-gray-400 font-mono'>
          <p>{time.current.minutes}:{time.current.seconds.toString().padStart(2, '0')}</p>
          <div ref={seekBg} onClick={seekSong} className='w-[35vw] min-w-[150px] max-w-[400px] bg-gray-300 dark:bg-[#4f4f4f] h-1 rounded-full cursor-pointer hover:h-1.5 transition-all relative group'>
            <hr ref={seekBar} className='h-full border-none w-0 bg-[#1db954] rounded-full' />
          </div>
          <p>{time.totalTime.minutes}:{time.totalTime.seconds.toString().padStart(2, '0')}</p>
        </div>
      </div>

      {/* Right Panel: Sidebars and Volume Options */}
      <div className='w-80 flex items-center justify-end relative flex-shrink-0'>
        <div className='hidden lg:flex items-center gap-4 opacity-90 relative flex-shrink-0'>
        
        {/* Premium Info Panel Toggle */}
        <button 
          onClick={handlePlaysIconClick} 
          className={`flex items-center gap-1 text-xs font-bold transition-all cursor-pointer bg-transparent border-none ${
            showNowPlaying && activeRightSidebarTab === 'nowPlaying' 
              ? 'text-[#1db954] opacity-100 scale-105' 
              : 'text-gray-650 hover:text-black dark:text-gray-400 dark:hover:text-white opacity-85 hover:opacity-100'
          }`}
          title="Toggle Song Info Panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <span>Info</span>
        </button>

        {/* Queue Toggle SVG Icon */}
        <svg 
          onClick={handleQueueIconClick}
          className={`w-4 h-4 cursor-pointer transition-all hover:scale-110 active:scale-95 ${
            showNowPlaying && activeRightSidebarTab === 'queue' 
              ? 'text-[#1db954] opacity-100 font-bold' 
              : 'text-gray-550 dark:text-gray-400 hover:text-black dark:hover:text-white opacity-70 hover:opacity-100'
          }`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          title="Queue View"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        
        {/* Mute Toggle & Volume Bar */}
        <div className='flex items-center gap-2'>
          {isMuted ? (
            <svg 
              onClick={toggleMute} 
              className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-600 transition-all hover:scale-110 active:scale-95" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              title="Unmute"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg 
              onClick={toggleMute} 
              className="w-4 h-4 cursor-pointer text-gray-750 dark:text-gray-300 hover:text-black dark:hover:text-white transition-all hover:scale-110 active:scale-95" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              title="Mute"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume} 
            onChange={(e) => changeVolume(e.target.value)} 
            className='w-20 accent-green-500 h-1 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer outline-none hover:accent-green-400' 
          />
        </div>
        </div>
      </div>

    </div>
  ) : null
}

export default Player
