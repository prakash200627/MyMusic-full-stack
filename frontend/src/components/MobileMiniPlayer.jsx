import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'

const MobileMiniPlayer = () => {
  const navigate = useNavigate();
  const progressBarRef = React.useRef(null);
  const {
    track,
    playStatus,
    play,
    pause,
    audioRef,
    previous,
    next,
    isShuffle,
    setIsShuffle,
    repeatMode,
    toggleRepeatMode,
    time,
    setIsMobilePlayerOpen
  } = useContext(PlayerContext);

  if (!track) return null;

  // Calculate duration and percent
  const duration = audioRef.current ? audioRef.current.duration : 0;
  const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Touch and mouse seek drag handler
  const handleProgressSeek = (e) => {
    if (!audioRef.current || duration === 0 || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newTime = (offsetX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
  };

  return (
    <div className="w-[94%] mx-auto mb-2 bg-[#0c2b3e] dark:bg-[#071924] text-white rounded-lg shadow-xl relative z-40 overflow-hidden flex flex-col p-3 transition-all duration-300">
      
      {/* Main Single Row Container */}
      <div className="flex items-center justify-between select-none gap-3">
        {/* Track info on left */}
        <div 
          onClick={() => setIsMobilePlayerOpen(true)}
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
        >
          <img 
            className="w-9 h-9 object-cover rounded shadow flex-shrink-0" 
            src={track.image} 
            alt={track.title || track.name} 
          />
          <div className="truncate min-w-0 flex-1 pr-1">
            <p className="text-[11px] font-bold truncate leading-tight">{track.title || track.name}</p>
            <p className="text-[9px] text-gray-300 truncate mt-0.5">{track.artistName || track.artist || "MyMusic Artist"}</p>
          </div>
        </div>

        {/* Right side playback deck in single row */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Shuffle */}
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className="bg-transparent border-none outline-none cursor-pointer p-0"
            title="Shuffle"
          >
            <svg 
              viewBox="0 0 24 24" 
              className={`w-3.5 h-3.5 transition-colors ${isShuffle ? 'text-[#1db954]' : 'text-gray-300 hover:text-white'}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <path d="M15 15l6 6" /><path d="M4 4l5 5" />
            </svg>
          </button>

          {/* Previous */}
          <button 
            onClick={previous}
            className="bg-transparent border-none outline-none cursor-pointer p-0"
            title="Previous"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-300 hover:text-white" fill="currentColor">
              <polygon points="19,20 9,12 19,4" />
              <rect x="5" y="4" width="2" height="16" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button 
            onClick={playStatus ? pause : play}
            className="w-8 h-8 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-full flex items-center justify-center cursor-pointer shadow hover:scale-105 active:scale-95 transition-all border-none outline-none"
          >
            {playStatus ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button 
            onClick={next}
            className="bg-transparent border-none outline-none cursor-pointer p-0"
            title="Next"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-300 hover:text-white" fill="currentColor">
              <polygon points="5,4 15,12 5,20" />
              <rect x="17" y="4" width="2" height="16" />
            </svg>
          </button>

          {/* Repeat */}
          <div className="relative flex flex-col items-center justify-center">
            {repeatMode === 'off' && (
              <svg 
                onClick={toggleRepeatMode} 
                className="w-3.5 h-3.5 cursor-pointer text-gray-300 hover:text-white transition-all" 
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
                  className="w-3.5 h-3.5 cursor-pointer text-[#1db954] transition-all" 
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
                <span className="w-0.75 h-0.75 bg-[#1db954] rounded-full absolute -bottom-1"></span>
              </>
            )}
            
            {repeatMode === 'track' && (
              <>
                <svg 
                  onClick={toggleRepeatMode} 
                  className="w-3.5 h-3.5 cursor-pointer text-[#1db954] transition-all" 
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
                <span className="w-0.75 h-0.75 bg-[#1db954] rounded-full absolute -bottom-1"></span>
              </>
            )}
          </div>

          {/* Queue */}
          <button 
            onClick={() => navigate('/queue')}
            className="bg-transparent border-none outline-none cursor-pointer p-0"
            title="Queue"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-300 hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Full-width Draggable Progress Seek Bar at very bottom */}
      <div 
        ref={progressBarRef}
        onMouseDown={(e) => {
          handleProgressSeek(e);
          const moveHandler = (moveEvent) => handleProgressSeek(moveEvent);
          const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
          };
          document.addEventListener('mousemove', moveHandler);
          document.addEventListener('mouseup', upHandler);
        }}
        onTouchStart={(e) => {
          handleProgressSeek(e);
          const moveHandler = (moveEvent) => handleProgressSeek(moveEvent);
          const endHandler = () => {
            document.removeEventListener('touchmove', moveHandler);
            document.removeEventListener('touchend', endHandler);
          };
          document.addEventListener('touchmove', moveHandler);
          document.addEventListener('touchend', endHandler);
        }}
        className="w-full bg-[#204961] h-1.5 cursor-pointer relative mt-3 rounded-full overflow-visible"
      >
        <div 
          className="bg-white h-full rounded-full pointer-events-none"
          style={{ width: `${percent}%` }}
        />
        {/* Seek thumb (drag handle) */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow border border-gray-400 pointer-events-none"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      </div>
    </div>
  );
}

export default MobileMiniPlayer;
