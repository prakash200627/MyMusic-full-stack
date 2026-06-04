import React from 'react'
import {assets} from '../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='bg-[#E4FFE9] dark:bg-[#070e0a] border-r-2 border-black dark:border-[#00FF5B] min-h-screen pl-[4vw] pr-4 sm:pr-8 py-5 select-none transition-colors duration-300 flex-shrink-0'>
      
      {/* Brand Header */}
      <div className='mt-5 mb-10 hidden sm:block select-none'>
        <div className='flex items-center gap-2 border-2 border-black bg-black px-3 py-1.5 shadow-[3px_3px_0px_0px_#00FF5B] rounded-none w-fit'>
          <img src={assets.mymusic_logo} alt="Logo" className='w-6 h-6 object-contain rounded-full bg-white p-0.5' />
          <h1 className='text-md font-black uppercase text-white tracking-tight'>
            MyMusic
          </h1>
        </div>
        <p className='text-[9px] font-black text-gray-500 dark:text-[#00FF5B] uppercase tracking-widest mt-2 pl-0.5'>Admin Console</p>
      </div>

      <div className='mt-5 mr-4 sm:hidden block select-none mb-10'>
        <img src={assets.mymusic_logo} alt="Logo" className='w-8 h-8 object-contain rounded-full bg-white p-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#00FF5B]' />
      </div>

      <div className='flex flex-col gap-4.5 mt-2'>
        <NavLink 
          to="/add-song" 
          className={({ isActive }) => `flex items-center gap-2.5 text-gray-900 dark:text-white border-2 border-black dark:border-[#00FF5B] p-2 pr-[max(6vw, 10px)] text-xs font-black uppercase tracking-wider transition-all hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] ${
            isActive ? 'bg-[#00FF5B] text-black dark:text-black font-extrabold' : 'bg-white dark:bg-[#0c1510]'
          }`}
        >
            <img src={assets.add_song} alt="" className='w-4 dark:invert' />
            <p className='hidden sm:block'>Add Song</p>
        </NavLink>

        <NavLink 
          to="/list-song" 
          className={({ isActive }) => `flex items-center gap-2.5 text-gray-900 dark:text-white border-2 border-black dark:border-[#00FF5B] p-2 pr-[max(6vw, 10px)] text-xs font-black uppercase tracking-wider transition-all hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] ${
            isActive ? 'bg-[#00FF5B] text-black dark:text-black font-extrabold' : 'bg-white dark:bg-[#0c1510]'
          }`}
        >
            <img src={assets.song_icon} alt="" className='w-4 dark:invert' />
            <p className='hidden sm:block'>List Song</p>
        </NavLink>

        <NavLink 
          to="/add-album" 
          className={({ isActive }) => `flex items-center gap-2.5 text-gray-900 dark:text-white border-2 border-black dark:border-[#00FF5B] p-2 pr-[max(6vw, 10px)] text-xs font-black uppercase tracking-wider transition-all hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] ${
            isActive ? 'bg-[#00FF5B] text-black dark:text-black font-extrabold' : 'bg-white dark:bg-[#0c1510]'
          }`}
        >
            <img src={assets.add_album} alt="" className='w-4 dark:invert' />
            <p className='hidden sm:block'>Add Album</p>
        </NavLink>

        <NavLink 
          to="/list-album" 
          className={({ isActive }) => `flex items-center gap-2.5 text-gray-900 dark:text-white border-2 border-black dark:border-[#00FF5B] p-2 pr-[max(6vw, 10px)] text-xs font-black uppercase tracking-wider transition-all hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] ${
            isActive ? 'bg-[#00FF5B] text-black dark:text-black font-extrabold' : 'bg-white dark:bg-[#0c1510]'
          }`}
        >
            <img src={assets.album_icon} alt="" className='w-4 dark:invert' />
            <p className='hidden sm:block'>List Album</p>
        </NavLink>

        <NavLink 
          to="/manage-users" 
          className={({ isActive }) => `flex items-center gap-2.5 text-gray-900 dark:text-white border-2 border-black dark:border-[#00FF5B] p-2 pr-[max(6vw, 10px)] text-xs font-black uppercase tracking-wider transition-all hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] ${
            isActive ? 'bg-[#00FF5B] text-black dark:text-black font-extrabold' : 'bg-white dark:bg-[#0c1510]'
          }`}
        >
            <span className='text-xs w-4 text-center'>👥</span>
            <p className='hidden sm:block'>Manage Users</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
