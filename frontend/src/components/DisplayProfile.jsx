import React from 'react'
import { useNavigate } from 'react-router-dom'

const DisplayProfile = () => {
  const navigate = useNavigate()

  const username = localStorage.getItem('username') || 'User'
  const role = localStorage.getItem('role') || 'listener'
  const email = `${username.toLowerCase()}@mymusic.local`

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    window.location.reload()
  }

  return (
    <div className='w-full select-none pb-12 animate-fadeIn flex flex-col items-center justify-center min-h-[75vh]'>
      
      {/* Profile Card Container */}
      <div className='w-full max-w-md bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-900 rounded-3xl p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden'>
        
        {/* Cover Glow Background */}
        <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600'></div>

        {/* Back Arrow Button to Home Page */}
        <button 
          onClick={() => navigate('/')}
          className='absolute left-5 top-5 w-8 h-8 rounded-full bg-gray-200/50 hover:bg-gray-300/60 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-gray-800 dark:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border border-transparent shadow-sm z-20'
          title="Back to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>

        {/* Profile Avatar Header */}
        <div className='flex flex-col items-center gap-3.5 mt-2'>
          <div className='w-20 h-20 rounded-full bg-purple-500 hover:bg-purple-400 text-black border-4 border-white dark:border-zinc-950 shadow-lg flex items-center justify-center font-black text-3xl uppercase capitalize select-none transition-all'>
            {username[0]}
          </div>
          <div className='text-center'>
            <h1 className='text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-0.5'>{username}</h1>
            <p className='text-xs text-gray-400 dark:text-zinc-500 font-bold tracking-widest uppercase'>{role} account</p>
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-zinc-800 my-1'></div>

        {/* Account Details Information */}
        <div className='flex flex-col gap-3.5 text-sm'>
          
          <div className='flex justify-between items-center py-0.5 border-b border-gray-150/40 dark:border-zinc-800/50 pb-2'>
            <span className='text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest'>Username</span>
            <span className='text-gray-900 dark:text-gray-200 font-bold'>{username}</span>
          </div>

          <div className='flex justify-between items-center py-0.5 border-b border-gray-150/40 dark:border-zinc-800/50 pb-2'>
            <span className='text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest'>Email Address</span>
            <span className='text-gray-900 dark:text-gray-200 font-semibold font-mono text-xs'>{email}</span>
          </div>

          <div className='flex justify-between items-center py-0.5 border-b border-gray-150/40 dark:border-zinc-800/50 pb-2'>
            <span className='text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest'>Account Type</span>
            <span className='text-gray-900 dark:text-gray-200 font-bold capitalize'>{role}</span>
          </div>

          <div className='flex justify-between items-center py-0.5 border-b border-gray-150/40 dark:border-zinc-800/50 pb-2'>
            <span className='text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest'>Status</span>
            <span className='bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1'>
              <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse'></span>
              Active
            </span>
          </div>
          
          <div className='flex justify-between items-center py-0.5 border-b border-gray-150/40 dark:border-zinc-800/50 pb-2'>
            <span className='text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest'>Member Since</span>
            <span className='text-gray-900 dark:text-gray-200 font-semibold'>June 2026</span>
          </div>

        </div>

        <div className='border-t border-gray-200 dark:border-zinc-800 my-1'></div>

        {/* Subscription / Audio Specs section */}
        <div className='bg-gray-200/40 dark:bg-[#121212] border border-gray-200 dark:border-zinc-850 p-4 rounded-2xl flex flex-col gap-3'>
          <h3 className='text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5'>Premium Features & Specs</h3>
          <div className='grid grid-cols-2 gap-3 text-xs'>
            <div className='flex flex-col gap-0.5'>
              <span className='text-[9px] font-bold text-gray-400 uppercase tracking-wider'>Audio Quality</span>
              <span className='font-bold text-gray-800 dark:text-gray-200'>High (320kbps)</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-[9px] font-bold text-gray-400 uppercase tracking-wider'>Format</span>
              <span className='font-bold text-gray-800 dark:text-gray-200'>AAC Stereo</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-[9px] font-bold text-gray-400 uppercase tracking-wider'>Ad Experience</span>
              <span className='font-bold text-gray-800 dark:text-gray-200'>Ad-Free Playback</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-[9px] font-bold text-gray-400 uppercase tracking-wider'>Library Space</span>
              <span className='font-bold text-gray-800 dark:text-gray-200'>Unlimited Saves</span>
            </div>
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-zinc-800 my-1'></div>

        {/* Action Buttons */}
        <div className='flex flex-col gap-3 mt-1'>
          <button 
            onClick={handleLogout}
            className='w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold py-3 rounded-full cursor-pointer transition-all active:scale-95 text-xs shadow-md border-none flex items-center justify-center gap-2'
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Logout from Account
          </button>
        </div>

      </div>

    </div>
  )
}

export default DisplayProfile
