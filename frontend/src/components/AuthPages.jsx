import React, { useState, useContext } from 'react'
import axios from 'axios'
import { PlayerContext } from '../context/PlayerContext'

const AuthPages = ({ onLoginSuccess }) => {
  const { url, customAlert } = useContext(PlayerContext)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  
  // Input fields
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const response = await axios.post(`${url}/api/auth/login`, { username, password })
        if (response.data.success) {
          const { token, user } = response.data
          localStorage.setItem('token', token)
          localStorage.setItem('userId', user.id)
          localStorage.setItem('username', user.username)
          localStorage.setItem('role', user.role)
          window.location.reload()
        } else {
          await customAlert(response.data.message || "Failed to log in", "Error")
        }
      } else {
        const response = await axios.post(`${url}/api/auth/signup`, { username, password })
        if (response.data.success) {
          await customAlert(response.data.message, "Success")
          setIsLogin(true)
          setUsername('')
          setPassword('')
        } else {
          await customAlert(response.data.message || "Failed to sign up", "Error")
        }
      }
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || "An error occurred. Please try again."
      await customAlert(errorMsg, "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-black p-4 select-none animate-fadeIn transition-colors duration-300">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#1db954]/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Glassmorphism Card */}
      <div className="bg-white/80 dark:bg-[#121212]/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800/80 w-full max-w-md rounded-2xl shadow-2xl p-8 flex flex-col items-center relative z-10 transition-all duration-300">
        
        {/* Logo/Icon */}
        <div className="w-14 h-14 bg-[#1db954] text-black rounded-full flex items-center justify-center shadow-lg mb-4 hover:scale-105 active:scale-95 transition-all">
          <svg className="w-8 h-8 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7.5h2V12.5z" />
          </svg>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white mb-2">
          {isLogin ? "Log in to MyMusic" : "Create standard account"}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 font-semibold text-center">
          {isLogin ? "Welcome back! Enter your login details below." : "Registration requires administrator approval before listening."}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Username</label>
            <input 
              type="text" 
              placeholder=""
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-100 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-[#1db954] transition-all font-medium"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-100 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-[#1db954] transition-all font-medium"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black font-extrabold py-3.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm shadow-lg mt-3 flex items-center justify-center gap-2 border-none"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              isLogin ? "Sign In" : "Register Now"
            )}
          </button>
        </form>

        {/* Toggle Switcher */}
        <div className="mt-8 text-xs text-gray-500 font-semibold">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin)
              setPassword('')
              setUsername('')
            }}
            className="text-[#1db954] hover:underline font-bold bg-transparent border-none cursor-pointer"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default AuthPages
