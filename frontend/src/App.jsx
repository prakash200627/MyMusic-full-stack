import React, { useContext, useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Player from './components/Player'
import Display from './components/Display'
import NowPlayingSidebar from './components/NowPlayingSidebar'
import AuthPages from './components/AuthPages'
import Navbar from './components/Navbar'
import MobileMiniPlayer from './components/MobileMiniPlayer'
import MobileBottomNav from './components/MobileBottomNav'
import MobileFullScreenPlayer from './components/MobileFullScreenPlayer'
import { PlayerContext } from './context/PlayerContext'
import axios from 'axios'

const App = () => {

  const { audioRef, track, songsData, showNowPlaying, modalConfig, toastMessage, isSuspended, isMobilePlayerOpen } = useContext(PlayerContext)
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isSuspended) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#121212] flex items-center justify-center p-6 text-center select-none overflow-hidden font-sans">
        {/* Animated Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Locked Glassmorphic Card */}
        <div className="bg-white/5 dark:bg-[#181818]/60 backdrop-blur-xl border border-red-500/20 dark:border-red-950/40 w-full max-w-md rounded-2xl shadow-2xl p-8 flex flex-col items-center relative z-10 animate-fadeIn">
          
          {/* Warning Shield Icon */}
          <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center shadow-lg mb-6 hover:scale-105 transition-all">
            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-3">
            Account Suspended
          </h2>
          
          <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-sm">
            Your account has been suspended by the administrator. You no longer have access to MyMusic. Please contact the administrator for more information.
          </p>

          {/* Action Sign Out Button */}
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('username');
              localStorage.removeItem('userId');
              localStorage.removeItem('role');
              window.location.reload();
            }}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm shadow-lg border-none"
          >
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden flex flex-col transition-all duration-300 relative'>
      {!token ? (
        <AuthPages onLoginSuccess={(tok) => setToken(tok)} />
      ) : (
        songsData.length !== 0
          ?
          <>
            {!isMobile && <Navbar />}
            <div className='flex-1 flex overflow-hidden'>
              {!isMobile && <Sidebar />}
              <Display />
              {!isMobile && showNowPlaying && <NowPlayingSidebar />}
            </div>
            {isMobile ? (
              <>
                <MobileMiniPlayer />
                <MobileBottomNav />
                {isMobilePlayerOpen && <MobileFullScreenPlayer />}
              </>
            ) : (
              <Player />
            )}
          </>
          : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#121212] text-white">
              <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[10px] font-bold text-gray-400 tracking-widest uppercase animate-pulse">Loading MyMusic...</p>
            </div>
          )
      )}

      <audio ref={audioRef} src={track ? track.file : null} preload='auto'></audio>

      {/* Premium in-app Custom Popup Modal */}
      {modalConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn select-none">
          <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 p-6 rounded-xl shadow-2xl w-[90%] max-w-sm flex flex-col gap-4 text-center text-gray-900 dark:text-white">
            <h3 className="text-lg font-bold">{modalConfig.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{modalConfig.message}</p>
            
            {modalConfig.type === 'prompt' && (
              <input 
                type="text" 
                id="modal-prompt-input"
                defaultValue={modalConfig.defaultValue}
                className="w-full bg-gray-100 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    modalConfig.onConfirm(e.target.value);
                  }
                }}
              />
            )}
            
            <div className="flex gap-3 justify-center mt-2">
              {modalConfig.type !== 'alert' && (
                <button 
                  onClick={modalConfig.onCancel}
                  className="px-5 py-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-800 dark:text-white rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border border-transparent dark:border-zinc-800"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => {
                  if (modalConfig.type === 'prompt') {
                    const val = document.getElementById("modal-prompt-input")?.value;
                    modalConfig.onConfirm(val);
                  } else {
                    modalConfig.onConfirm();
                  }
                }}
                className="px-6 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sleek Spotify-style Auto-Dismissing Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-6 md:left-6 max-md:left-1/2 max-md:-translate-x-1/2 z-[9999] bg-white dark:bg-[#181818] text-gray-900 dark:text-white border border-gray-200 dark:border-[#282828] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-xs font-bold animate-slideUp select-none min-w-[220px] max-md:w-[90%] max-md:max-w-xs max-md:justify-center">
          {toastMessage.toLowerCase().includes('failed') || toastMessage.toLowerCase().includes('error') ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500 flex-shrink-0">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#1db954] flex-shrink-0">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          )}
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default App
