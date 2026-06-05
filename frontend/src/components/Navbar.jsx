import React, { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'
import { ThemeContext } from '../context/ThemeContext'
import { assets } from '../assets/assets'

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    searchTerm, 
    setSearchTerm, 
    isSearchActive, 
    setIsSearchActive
  } = useContext(PlayerContext);

  const { theme, setTheme } = useContext(ThemeContext);
  const [searchFromPath, setSearchFromPath] = useState(null);

  // Clear searchFromPath if the user navigates away to a new page manually
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/search') {
      if (searchFromPath && location.pathname !== searchFromPath) {
        setSearchFromPath(null);
      }
    }
  }, [location.pathname]);

  // Clear searchFromPath if search is completely cleared while on home or search page
  useEffect(() => {
    if ((location.pathname === '/' || location.pathname === '/search') && searchTerm.trim() === '') {
      setSearchFromPath(null);
    }
  }, [location.pathname, searchTerm]);

  const handleHomeClick = () => {
    setIsSearchActive(false);
    setSearchTerm('');
    setSearchFromPath(null);
    navigate('/');
  }

  return (
    <div className='w-full flex justify-between items-center font-semibold select-none bg-white dark:bg-black border-b border-gray-250 dark:border-zinc-900 px-6 py-2.5 gap-4 h-16 flex-shrink-0 z-30 shadow-sm transition-all duration-300'>
      
      {/* Left Side: Brand Logo and Text (Navigates to home and clears search on click) */}
      <div 
        onClick={handleHomeClick}
        className='flex items-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all flex-shrink-0'
        title="Go to Home"
      >
        <img className='w-8 h-8 object-contain rounded-full shadow-sm' src={assets.mymusic_logo} alt="Logo" />
        <span className='font-bold text-base tracking-tight text-gray-900 dark:text-white uppercase'>MyMusic</span>
      </div>

      {/* Center Side: Home Button & Persistently anchored Search Bar */}
      <div className='flex-1 max-w-lg flex items-center gap-3 justify-center'>
        {/* Circular Home Button */}
        <button 
          onClick={handleHomeClick}
          className='w-10 h-10 rounded-full bg-gray-150 dark:bg-[#121212] hover:bg-gray-200 dark:hover:bg-[#282828] text-gray-800 dark:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm border border-gray-200 dark:border-zinc-800/80 flex-shrink-0'
          title="Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        </button>

        {/* Search Input Container */}
        <div className='flex-1 relative flex items-center max-w-md'>
          <span className='absolute left-3.5 text-gray-400 pointer-events-none'>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.2} 
              stroke="currentColor" 
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="What do you want to play?" 
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value;
              setSearchTerm(val);
              if (val.trim() !== '') {
                if (location.pathname !== '/' && location.pathname !== '/search') {
                  setSearchFromPath(location.pathname);
                  navigate('/');
                }
              } else {
                if (searchFromPath) {
                  navigate(searchFromPath);
                  setSearchFromPath(null);
                }
              }
            }}
            className='w-full bg-gray-150 dark:bg-[#121212] text-gray-900 dark:text-white pl-10 pr-10 py-2.5 rounded-full text-sm font-normal focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all shadow-sm'
          />
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                if (searchFromPath) {
                  navigate(searchFromPath);
                  setSearchFromPath(null);
                }
              }} 
              className='absolute right-3.5 text-gray-400 hover:text-black dark:hover:text-white font-bold text-xs bg-transparent border-none outline-none cursor-pointer'
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Side: Actions and Profile */}
      <div className='flex items-center gap-3.5 flex-shrink-0'>

        {/* Theme Switcher Button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className='w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#121212] hover:bg-gray-200 dark:hover:bg-[#282828] text-gray-800 dark:text-yellow-400 border border-gray-200 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm text-sm'
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        {/* User Profile Bubble (Navigates to /profile page) */}
        <div className='flex items-center gap-2.5 flex-shrink-0'>
          {localStorage.getItem('username') && (
            <span className='text-xs text-gray-600 dark:text-gray-300 font-bold select-none'>
              Hi, {localStorage.getItem('username')}
            </span>
          )}
          <div 
            onClick={() => navigate('/profile')}
            className='bg-purple-500 hover:bg-purple-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm text-sm capitalize flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all'
            title="View Profile"
          >
            {localStorage.getItem('username') ? localStorage.getItem('username').charAt(0) : 'U'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar
