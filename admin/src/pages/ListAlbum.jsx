import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { url } from '../App'
import { toast } from 'react-toastify'

const ListAlbum = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchAlbums = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${url}/api/album/list`)
      if (response.data.success) {
        setData(response.data.albums)
      }
    } catch (error) {
      toast.error('Error fetching albums list')
    } finally {
      setLoading(false)
    }
  }
  
  const removeAlbum = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete album "${title}"? This will not delete the songs inside but will remove the album organization.`)) return
    try {
      setDeletingId(id)
      const response = await axios.delete(`${url}/api/album/${id}`)
      if (response.data && response.data.success) {
        toast.success(response.data.message || `Album "${title}" removed`)
        await fetchAlbums()
      } else {
        toast.error(response.data?.message || 'Failed to remove album')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred while deleting album')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 gap-4">
        <div className="w-12 h-12 border-4 border-[#00FF5B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">Loading albums catalog...</p>
      </div>
    )
  }

  return (
    <div className="pr-5 sm:pr-12 animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Albums Catalog</h2>
          <p className="text-xs text-gray-500 dark:text-[#00FF5B] font-bold uppercase tracking-wide mt-1">Review all release albums, manage track lists, or delete entries.</p>
        </div>
        <button 
          onClick={fetchAlbums} 
          className="bg-white dark:bg-[#0c1510] text-gray-900 dark:text-white border-2 border-black dark:border-[#00FF5B] font-bold text-xs py-2 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 cursor-pointer rounded-none"
        >
          Refresh Catalog
        </button>
      </div>

      {data.length === 0 ? (
        <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] border-dashed p-12 text-center text-gray-500 dark:text-gray-400 font-bold">
          No albums found. Click "Add Album" to create your first album container!
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#00FF5B] overflow-x-auto select-none rounded-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#E4FFE9] dark:bg-[#12281a] border-b-2 border-black dark:border-[#00FF5B] text-xs font-black uppercase text-gray-800 dark:text-[#00FF5B] tracking-wider">
                <th className="p-4">Cover</th>
                <th className="p-4">Album Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Tracks Count</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {data.map((item) => (
                <tr key={item._id} className="border-b-2 border-gray-100 dark:border-zinc-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4">
                    <img className="w-12 h-12 object-cover border border-black dark:border-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" src={item.image} alt="" />
                  </td>
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{item.title}</td>
                  <td className="p-4 font-medium text-gray-600 dark:text-gray-400">{item.desc}</td>
                  <td className="p-4">
                    <span className="text-xs bg-gray-100 dark:bg-zinc-900 px-2.5 py-1 border border-black dark:border-zinc-800 font-mono font-bold">
                      {item.songs ? item.songs.length : 0} Tracks
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-center gap-3">
                    <Link 
                      to={`/edit-album/${item._id}`} 
                      className="bg-yellow-300 hover:bg-yellow-400 text-black font-extrabold text-[10px] uppercase py-1.5 px-3 border-2 border-black rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center gap-1"
                      title="Manage Album Songs & Details"
                    >
                      <span>✏️</span> Manage Tracks
                    </Link>
                    <button 
                      onClick={() => removeAlbum(item._id, item.title)} 
                      disabled={deletingId === item._id} 
                      className="bg-red-400 hover:bg-red-500 text-white font-extrabold text-[10px] uppercase py-1.5 px-3 border-2 border-black rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer disabled:opacity-50"
                      title="Delete album"
                    >
                      {deletingId === item._id ? 'Purging...' : '❌ Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ListAlbum
