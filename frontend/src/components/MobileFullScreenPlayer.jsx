import React, { useContext, useRef, useState, useEffect } from 'react'
import { PlayerContext } from '../context/PlayerContext'
import { useNavigate } from 'react-router-dom'

const MobileFullScreenPlayer = () => {
  const navigate = useNavigate();
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
    setIsMobilePlayerOpen,
    likedSongs,
    likeSong,
    unlikeSong,
    playlistsData,
    albumsData,
    currentContextId,
    showToast,
    getUpcomingQueue,
    playWithId
  } = useContext(PlayerContext);

  const progressBarRef = useRef(null);

  if (!track) return null;

  // Retrieve Context Type & Name for the top header
  let contextType = "PLAYING FROM ALBUM";
  let contextName = "MyMusic Album";

  if (currentContextId === 'likes') {
    contextType = "PLAYING FROM PLAYLIST";
    contextName = "Liked Songs";
  } else if (currentContextId === 'mix') {
    contextType = "PLAYING FROM MIX";
    contextName = "MyMusic Mix";
  } else if (currentContextId) {
    const playlist = playlistsData.find(p => String(p._id || p.id) === String(currentContextId));
    if (playlist) {
      contextType = "PLAYING FROM PLAYLIST";
      contextName = playlist.name;
    } else {
      const album = albumsData.find(a => String(a._id || a.id) === String(currentContextId));
      if (album) {
        contextType = "PLAYING FROM ALBUM";
        contextName = album.name;
      } else if (track.albumId && typeof track.albumId === 'object') {
        contextName = track.albumId.title || track.albumId.name || contextName;
      }
    }
  } else if (track.albumId) {
    if (typeof track.albumId === 'object') {
      contextName = track.albumId.title || track.albumId.name || contextName;
    } else {
      contextName = track.albumId;
    }
  }

  // Calculate current elapsed percentage
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

  const isLiked = likedSongs && likedSongs.some(s => String(s._id) === String(track._id));
  const username = localStorage.getItem('username') || 'Prakash';

  // Format second timers
  const formatTime = (mins, secs) => {
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Copy song file url to share
  const handleShareSong = async () => {
    try {
      if (navigator.clipboard && track.file) {
        await navigator.clipboard.writeText(track.file);
        showToast("Song stream link copied to clipboard! 🔗");
      } else {
        showToast("Unable to copy stream URL");
      }
    } catch (err) {
      showToast("Sharing failed");
    }
  };



  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0c2b3e]/90 to-[#071924]/95 backdrop-blur-xl w-screen h-screen flex flex-col justify-between p-6 pb-12 text-white select-none overflow-hidden animate-slideUp">
      
      {/* Top Header Section */}
      <div className="relative z-10 flex items-center justify-between px-2 pt-2 flex-shrink-0">
        <button 
          onClick={() => setIsMobilePlayerOpen(false)}
          className="bg-transparent border-none outline-none text-gray-300 hover:text-white cursor-pointer p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.8" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <button 
          onClick={() => {
            navigate('/queue');
            setIsMobilePlayerOpen(false);
          }}
          className="bg-transparent border-none outline-none text-gray-300 hover:text-white cursor-pointer p-1"
          title="Queue"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>

      {/* Album Artwork Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-2 min-h-0">
        <div className="w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
          <img className="w-full h-full object-cover animate-pulse-slow" src={track.image} alt={track.title || track.name} />
        </div>
      </div>

      {/* Lower deck content: Meta + Scrubber + Controls + Extra */}
      <div className="relative z-10 px-6 mt-4 flex-shrink-0 flex flex-col">
        
        {/* Track Title and Like Toggle */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black tracking-tight truncate leading-tight">{track.title || track.name}</h2>
            <p className="text-sm text-gray-400 truncate mt-1 font-semibold">{track.artistName || track.artist || "MyMusic Artist"}</p>
          </div>

          <button 
            onClick={async () => {
              if (isLiked) {
                await unlikeSong(track._id);
              } else {
                await likeSong(track._id);
              }
            }}
            className="bg-transparent border-none outline-none cursor-pointer p-1"
          >
            {isLiked ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1db954] filter drop-shadow-[0_0_4px_rgba(29,185,84,0.4)]" fill="currentColor">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.748-5.25Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            )}
          </button>
        </div>

        {/* Draggable Progress Bar Section */}
        <div className="flex flex-col mb-4">
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
            className="w-full bg-zinc-800 h-1 rounded-full cursor-pointer relative py-1 overflow-visible"
          >
            <div className="absolute inset-y-1 left-0 bg-white h-1 rounded-full pointer-events-none" style={{ width: `${percent}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg pointer-events-none" style={{ left: `calc(${percent}% - 7px)` }} />
          </div>

          {/* Timers Row */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-2 font-mono">
            <span>{formatTime(time.current.minutes, time.current.seconds)}</span>
            <span>{formatTime(time.totalTime.minutes, time.totalTime.seconds)}</span>
          </div>
        </div>

        {/* Circular Control Actions Deck */}
        <div className="flex items-center justify-between px-2 mb-6">
          {/* Shuffle Button */}
          <button 
            onClick={() => setIsShuffle(!isShuffle)}
            className="bg-transparent border-none outline-none cursor-pointer p-2"
          >
            <svg 
              viewBox="0 0 24 24" 
              className={`w-5 h-5 transition-colors ${isShuffle ? 'text-[#1db954] filter drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]' : 'text-gray-400 hover:text-white'}`} 
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

          {/* Previous Button */}
          <button 
            onClick={previous}
            className="bg-transparent border-none outline-none cursor-pointer p-2 text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
              <polygon points="19,20 9,12 19,4" />
              <rect x="5" y="4" width="2" height="16" />
            </svg>
          </button>

          {/* Big Play/Pause Button */}
          <button 
            onClick={playStatus ? pause : play}
            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all border-none outline-none"
          >
            {playStatus ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button 
            onClick={next}
            className="bg-transparent border-none outline-none cursor-pointer p-2 text-white hover:scale-105 active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
              <polygon points="5,4 15,12 5,20" />
              <rect x="17" y="4" width="2" height="16" />
            </svg>
          </button>

          {/* Repeat Button */}
          <div className="relative flex flex-col items-center justify-center p-2">
            {repeatMode === 'off' && (
              <svg 
                onClick={toggleRepeatMode} 
                className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white transition-all" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
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
                  className="w-5 h-5 cursor-pointer text-[#1db954] transition-all" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
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
                  className="w-5 h-5 cursor-pointer text-[#1db954] transition-all" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
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
    </div>
  </div>
  );
};

export default MobileFullScreenPlayer;
