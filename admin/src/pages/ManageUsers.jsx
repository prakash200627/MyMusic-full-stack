import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { url } from '../App'
import { toast } from 'react-toastify'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin-token')}`
    }
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${url}/api/admin/users/list`, getHeaders())
      if (response.data.success) {
        setUsers(response.data.users)
      } else {
        toast.error("Failed to load users list")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error retrieving user records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleActivate = async (id, name) => {
    try {
      const res = await axios.put(`${url}/api/admin/users/${id}/activate`, {}, getHeaders())
      if (res.data.success) {
        toast.success(`Account for "${name}" has been approved and activated!`)
        fetchUsers()
      } else {
        toast.error(res.data.message || "Failed to activate user")
      }
    } catch (err) {
      toast.error("Error activating user account")
    }
  }

  const handleSuspend = async (id, name) => {
    try {
      const res = await axios.put(`${url}/api/admin/users/${id}/suspend`, {}, getHeaders())
      if (res.data.success) {
        toast.warn(`Account for "${name}" has been suspended.`)
        fetchUsers()
      } else {
        toast.error(res.data.message || "Failed to suspend user")
      }
    } catch (err) {
      toast.error("Error suspending user account")
    }
  }



  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"? This will purge all their custom playlists and likes.`)) return
    try {
      const res = await axios.delete(`${url}/api/admin/users/${id}`, getHeaders())
      if (res.data.success) {
        toast.success(`Account for "${name}" has been permanently purged.`)
        fetchUsers()
      } else {
        toast.error(res.data.message || "Failed to purge user")
      }
    } catch (err) {
      toast.error("Error deleting user account")
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 gap-4">
        <div className="w-12 h-12 border-4 border-[#00FF5B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">Fetching listener directories...</p>
      </div>
    )
  }

  return (
    <div className="pr-5 sm:pr-12 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">User Accounts Directory</h2>
          <p className="text-xs text-gray-500 dark:text-[#00FF5B] font-bold uppercase tracking-wide mt-1">Approve pending signups, suspend active users, or ban offenders.</p>
        </div>
        <button 
          onClick={fetchUsers} 
          className="bg-white dark:bg-[#0c1510] text-gray-900 dark:text-white border-2 border-black dark:border-[#00FF5B] font-bold text-xs py-2 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 cursor-pointer rounded-none"
        >
          Refresh List
        </button>
      </div>

      {users.length === 0 ? (
        <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] border-dashed p-12 text-center text-gray-500 dark:text-gray-400 font-semibold">
          No registered user profiles found in the database.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#00FF5B] overflow-x-auto select-none rounded-none transition-colors duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E4FFE9] dark:bg-[#12281a] border-b-2 border-black dark:border-[#00FF5B] text-xs font-black uppercase text-gray-800 dark:text-[#00FF5B] tracking-wider">
                <th className="p-4">#</th>
                <th className="p-4">Username</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {users.map((user, index) => {
                // Status Pills
                const statusColors = {
                  active: 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800/30',
                  pending: 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800/30 animate-pulse',
                  suspended: 'bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800/30'
                }
                const statusStyle = statusColors[user.status] || 'bg-gray-100 text-gray-700'

                return (
                  <tr key={user._id} className="border-b-2 border-gray-100 dark:border-zinc-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-400">{index + 1}</td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{user.username}</td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 border rounded uppercase font-black tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800/30' : 'bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-0.5 border rounded uppercase font-bold ${statusStyle}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      {user.status !== 'active' ? (
                        <button 
                          onClick={() => handleActivate(user._id, user.username)}
                          className="bg-[#00FF5B] hover:bg-[#00e04e] text-black font-extrabold text-[10px] uppercase py-1.5 px-3 border-2 border-black rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                          title="Activate listener session"
                        >
                          Approve / Activate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSuspend(user._id, user.username)}
                          className="bg-orange-400 hover:bg-orange-500 text-black font-extrabold text-[10px] uppercase py-1.5 px-3 border-2 border-black rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                          title="Temporarily lock listener session"
                        >
                          Suspend
                        </button>
                      )}


                      <button 
                        onClick={() => handleDelete(user._id, user.username)}
                        className="bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 hover:text-red-700 font-extrabold text-[10px] uppercase py-1.5 px-3 border-2 border-red-200 hover:border-black dark:border-red-900/30 dark:hover:border-[#00FF5B] rounded-none transition-all cursor-pointer"
                        title="Permanently purge user database record"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ManageUsers
