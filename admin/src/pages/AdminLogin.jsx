import React, { useState } from 'react'
import axios from 'axios'
import { url } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post(`${url}/api/auth/login`, { username, password })
      if (response.data.success) {
        const { token, user } = response.data
        if (user.role !== 'admin') {
          toast.error("Access Denied: Administrator role is required.")
          return
        }
        localStorage.setItem('admin-token', token)
        localStorage.setItem('admin-name', user.username)
        toast.success("Welcome back, Admin!")
        onLoginSuccess(token)
      } else {
        toast.error(response.data.message || "Failed to log in")
      }
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || "Invalid username or password. Please try again."
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F3FFF7] dark:bg-[#070e0a] p-4 select-none transition-colors duration-300">
      
      {/* Decorative BG element */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FF5B]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Admin Login Card */}
      <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_#00FF5B] w-full max-w-sm flex flex-col items-center relative z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <img src={assets.mymusic_logo} alt="Logo" className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#00FF5B]" />
          <h1 className="text-3xl font-black uppercase text-gray-900 dark:text-white tracking-tight">
            MyMusic
          </h1>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-[#00FF5B] font-black uppercase tracking-widest mb-8">Admin Control Panel</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Admin Username</label>
            <input 
              type="text" 
              placeholder=""
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#F3FFF7] dark:bg-zinc-900/65 border-2 border-black dark:border-[#00FF5B] rounded-none px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Admin Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#F3FFF7] dark:bg-zinc-900/65 border-2 border-black dark:border-[#00FF5B] rounded-none px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF5B] hover:bg-[#00e04e] text-black font-extrabold py-3 border-2 border-black rounded-none transition-all cursor-pointer text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_#00FF5B] mt-3 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Access Studio"
            )}
          </button>
        </form>

      </div>
    </div>
  )
}

export default AdminLogin
