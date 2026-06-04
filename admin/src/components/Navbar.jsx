import React from 'react'
import {assets} from '../assets/assets'

const Navbar = ({ theme, toggleTheme }) => {
  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-name');
    window.location.reload();
  }

  return (
    <div className='flex items-center justify-between border-b-2 border-black dark:border-[#00FF5B] py-4 px-5 sm:px-12 bg-white dark:bg-[#0c1510] text-sm font-semibold select-none transition-colors duration-300'>
      <p className='uppercase tracking-widest text-gray-900 dark:text-white font-black text-xs sm:text-sm'>Admin control studio</p>
      
      <div className='flex items-center gap-3 sm:gap-4'>
        {/* Dynamic Sun/Moon Toggle Theme Button */}
        <button 
          onClick={toggleTheme}
          className='w-8 h-8 rounded-full border-2 border-black dark:border-[#00FF5B] flex items-center justify-center bg-white dark:bg-[#0c1510] text-gray-900 dark:text-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#00FF5B] hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 cursor-pointer text-sm transition-all'
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        <span className='text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider hidden md:inline'>Hi, {localStorage.getItem('admin-name') || 'Administrator'}</span>
        <button 
          onClick={handleLogout}
          className='bg-transparent dark:text-white border-2 border-black dark:border-[#00FF5B] font-extrabold text-[10px] sm:text-xs py-1.5 px-3 sm:px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_#00FF5B] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[2px_2px_0px_0px_#00FF5B] cursor-pointer rounded-none uppercase'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
