import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const MobileBottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || (!location.pathname.startsWith('/search') && !location.pathname.startsWith('/library') && !location.pathname.startsWith('/album') && !location.pathname.startsWith('/playlist') && !location.pathname.startsWith('/profile'));
    }
    return location.pathname.startsWith(path);
  }

  return (
    <div className='w-full flex-shrink-0 bg-white dark:bg-[#121212] border-t border-gray-200 dark:border-zinc-900 select-none pb-safe z-50 transition-all duration-300'>
      <div className='flex items-center justify-around h-16 px-6 relative'>
        
        {/* Home Option */}
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 bg-transparent border-none outline-none ${
            isActive('/') ? 'text-black dark:text-white scale-105 font-bold' : 'text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20a1 1 0 0 0 1 1h5v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5h5a1 1 0 0 0 1-1V7.577l-7.5-4.33z" />
          </svg>
          <span className="text-[10px]">Home</span>
        </button>

        {/* Search Option */}
        <button 
          onClick={() => navigate('/search')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 bg-transparent border-none outline-none ${
            isActive('/search') ? 'text-black dark:text-white scale-105 font-bold' : 'text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[10px]">Search</span>
        </button>

        {/* Your Library Option */}
        <button 
          onClick={() => navigate('/library')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 bg-transparent border-none outline-none ${
            isActive('/library') ? 'text-black dark:text-white scale-105 font-bold' : 'text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100'
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M9 3v18" stroke="currentColor" strokeWidth="2.5" />
            <path d="M14 8l3 3-3 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px]">Your Library</span>
        </button>
      </div>
    </div>
  )
}

export default MobileBottomNav
