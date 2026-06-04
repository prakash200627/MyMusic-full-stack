import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { url } from '../App.jsx'

const EditAlbum = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [image, setImage] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentImageUrl, setCurrentImageUrl] = useState('')

  // Songs management states
  const [allSongs, setAllSongs] = useState([])
  const [selectedSongIds, setSelectedSongIds] = useState([])

  const fetchAlbumDetails = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`)
      if (response.data.success) {
        const found = response.data.albums.find(a => a._id === id)
        if (found) {
          setName(found.title)
          setDesc(found.desc)
          setCurrentImageUrl(found.image)
        } else {
          toast.error("Album not found")
          navigate('/list-album')
        }
      }
    } catch (error) {
      toast.error("Error loading album details")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSongs = async () => {
    try {
      const response = await axios.get(`${url}/api/song/list`)
      if (response.data.success) {
        setAllSongs(response.data.songs)
      }
    } catch (err) {
      console.error("Error loading songs catalog:", err)
    }
  }

  useEffect(() => {
    fetchAlbumDetails()
    fetchAllSongs()
  }, [id])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', name)
      formData.append('desc', desc)
      
      if (image) formData.append('image', image)

      const response = await axios.put(`${url}/api/album/${id}`, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      })

      if (response.data && response.data.success) {
        toast.success(response.data.message || "Album Updated successfully")
        navigate('/list-album')
      } else {
        toast.error(response.data?.message || "Something went wrong")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error Occurred")
    } finally {
      setSaving(false)
    }
  }

  const addMultipleSongsToAlbum = async (songIds) => {
    if (songIds.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(songIds.map(async (songId) => {
        const formData = new FormData();
        formData.append('albumId', id);
        return axios.put(`${url}/api/song/${songId}`, formData);
      }));
      toast.success(`${songIds.length} tracks added to this album successfully!`);
      await fetchAllSongs();
      setSelectedSongIds([]); // reset selection
    } catch (error) {
      toast.error("Error updating song associations");
    } finally {
      setSaving(false);
    }
  }

  const removeSongFromAlbum = async (songId) => {
    try {
      const formData = new FormData();
      formData.append('albumId', 'none');

      const response = await axios.put(`${url}/api/song/${songId}`, formData);
      if (response.data.success) {
        toast.success("Song removed from this album");
        await fetchAllSongs();
      } else {
        toast.error("Failed to remove song");
      }
    } catch (error) {
      toast.error("Error updating song association");
    }
  }

  const deleteSongPermanently = async (songId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete song "${title}"?`)) return;
    try {
      const response = await axios.delete(`${url}/api/song/${songId}`);
      if (response.data.success) {
        toast.success("Song deleted permanently");
        await fetchAllSongs();
      } else {
        toast.error("Failed to delete song");
      }
    } catch (error) {
      toast.error("Error deleting song");
    }
  }

  const toggleSongSelection = (songId) => {
    setSelectedSongIds(prev => 
      prev.includes(songId) ? prev.filter(item => item !== songId) : [...prev, songId]
    );
  }

  // Partition songs list using relational ObjectIds or raw album title matching for backward compatibility
  const albumSongs = allSongs.filter(s => 
    (s.albumId && (s.albumId._id || s.albumId) === id) ||
    (s.album && name && s.album.toLowerCase() === name.toLowerCase())
  );
  const unassignedSongs = allSongs.filter(s => 
    (!s.albumId || (s.albumId._id || s.albumId) !== id) &&
    (!s.album || !name || s.album.toLowerCase() !== name.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 gap-4">
        <div className="w-12 h-12 border-4 border-[#00FF5B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">Retrieving album metadata...</p>
      </div>
    )
  }

  return (
    <div className="pr-5 sm:pr-12 animate-fadeIn flex flex-col md:flex-row gap-8 pb-12 select-none">
      
      {/* Left Form Panel */}
      <div className="flex-1 max-w-xl">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Modify Album Details</h2>
          <p className="text-xs text-gray-500 dark:text-[#00FF5B] font-bold uppercase tracking-wide mt-1">Edit album title, change uploader cover graphics, or update description.</p>
        </div>

        {saving ? (
          <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#00FF5B] p-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#00FF5B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-900 dark:text-white font-bold uppercase text-xs">Saving album modifications ({uploadProgress}%)...</p>
            {uploadProgress > 0 && (
              <div className='w-full max-w-xs mt-2'>
                <div className='h-3 bg-gray-150 dark:bg-zinc-800 border-2 border-black dark:border-[#00FF5B]'>
                  <div style={{width: `${uploadProgress}%`}} className='h-full bg-[#00FF5B] transition-all duration-100'></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmitHandler} className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#00FF5B] p-6 sm:p-8 flex flex-col gap-6 w-full">
            
            {/* Image replace */}
            <div className='flex flex-col gap-2'>
              <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Replace Cover (Optional)</label>
              <input onChange={(e) => setImage(e.target.files[0])} name="image" type="file" id='image' accept='image/*' hidden/>
              <label htmlFor="image" className="cursor-pointer group">
                <div className="border-2 border-black dark:border-[#00FF5B] p-1 bg-[#F3FFF7] dark:bg-zinc-900/60 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] group-hover:scale-105 active:scale-95 transition-all w-28 h-28 flex flex-col items-center justify-center text-center overflow-hidden">
                  {image ? (
                    <img src={URL.createObjectURL(image)} className='w-full h-full object-cover' alt="" />
                  ) : (
                    <img src={currentImageUrl || assets.upload_area} className='w-full h-full object-cover' alt="" />
                  )}
                </div>
              </label>
            </div>

            {/* Album Title */}
            <div className='flex flex-col gap-1.5 w-full'>
              <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Album Title Name</label>
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                type="text" 
                className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold rounded-none' 
                required
              />
            </div>

            {/* Album Description */}
            <div className='flex flex-col gap-1.5 w-full'>
              <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Album Description</label>
              <input 
                onChange={(e) => setDesc(e.target.value)} 
                value={desc} 
                type="text" 
                className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold rounded-none' 
                required
              />
            </div>

            {/* Action buttons */}
            <div className='flex flex-wrap gap-4 mt-4'>
              <button 
                type="submit" 
                disabled={saving} 
                className='bg-[#00FF5B] hover:bg-[#00e04e] text-black font-extrabold py-3.5 px-8 border-2 border-black rounded-none transition-all cursor-pointer text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_#00FF5B] uppercase tracking-widest disabled:opacity-50'
              >
                💾 Save Album Changes
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/list-album')} 
                className='bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-900 dark:text-white font-extrabold py-3.5 px-8 border-2 border-black dark:border-[#00FF5B] rounded-none transition-all cursor-pointer text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_#00FF5B] uppercase tracking-widest'
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right Song Relationship Manager Panel */}
      <div className="flex-1 max-w-xl flex flex-col gap-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase">Manage Album Tracks</h3>
          <p className="text-xs text-gray-500 dark:text-[#00FF5B] font-bold uppercase tracking-wide mt-1">Directly associate uploader singles, edit tracks sequence, or dissociate music files.</p>
        </div>

        {/* Songs inside this album */}
        <div className='flex flex-col gap-3'>
          <p className='text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5'>Current Album Tracks ({albumSongs.length})</p>
          {albumSongs.length === 0 ? (
            <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] border-dashed p-6 text-center text-gray-400 font-bold text-xs select-none">
              No songs are currently assigned to this album. Select tracks from the catalog checklist below!
            </div>
          ) : (
            <div className='bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] flex flex-col overflow-hidden'>
              {albumSongs.map((item, index) => (
                <div key={item._id} className='flex items-center justify-between p-3 border-b-2 border-gray-100 dark:border-zinc-800 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors'>
                  <div className='flex items-center gap-3 overflow-hidden'>
                    <span className='text-xs text-gray-400 font-mono font-bold w-8 text-center flex-shrink-0'>{index + 1}</span>
                    <img className='w-10 h-10 object-cover border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' src={item.image} alt="" />
                    <div className='truncate pl-1'>
                      <p className='text-sm font-bold text-gray-900 dark:text-white truncate'>{item.title}</p>
                      <p className='text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider'>{item.duration}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <button 
                      type="button" 
                      onClick={() => removeSongFromAlbum(item._id)} 
                      className='bg-transparent hover:bg-orange-50 text-orange-600 dark:text-orange-400 font-extrabold text-[9px] uppercase py-1 px-2.5 border-2 border-orange-200 hover:border-black rounded-none transition-all cursor-pointer'
                      title="Remove song from this album"
                    >
                      Dissociate
                    </button>
                    <button 
                      type="button" 
                      onClick={() => deleteSongPermanently(item._id, item.title)} 
                      className='bg-red-100 hover:bg-red-200 text-red-600 font-extrabold text-[9px] uppercase py-1 px-2.5 border-2 border-red-200 hover:border-black rounded-none transition-all cursor-pointer'
                      title="Delete song permanently"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add existing songs (Multi-Select Checklist Layout) */}
        {unassignedSongs.length > 0 && (
          <div className='flex flex-col gap-3 bg-[#E4FFE9] dark:bg-[#12281a]/40 p-4 border-2 border-black dark:border-[#00FF5B] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] select-none'>
            <div>
              <p className='text-xs font-black text-green-900 dark:text-[#00FF5B] uppercase tracking-wider pl-0.5'>Add Catalog Tracks to Album (Multi-Select)</p>
              <p className='text-[10px] text-green-700/80 dark:text-green-500/70 font-semibold pl-0.5 mt-0.5'>Select songs to assign to this album simultaneously.</p>
            </div>
            
            <div className='flex flex-col gap-1 max-h-[220px] overflow-y-auto bg-white dark:bg-[#070e0a] border-2 border-black dark:border-[#00FF5B] p-2'>
              {unassignedSongs.map((item) => {
                const isChecked = selectedSongIds.includes(item._id);
                return (
                  <label 
                    key={item._id} 
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-all border border-transparent ${
                      isChecked ? 'bg-[#F3FFF7] dark:bg-green-950/20 border-black dark:border-[#00FF5B] font-bold text-green-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => toggleSongSelection(item._id)}
                      className='w-4 h-4 cursor-pointer accent-[#00FF5B] rounded border-black'
                    />
                    <img className='w-8 h-8 object-cover border border-black' src={item.image} alt="" />
                    <div className='truncate flex-1 min-w-0 pl-1'>
                      <p className='truncate text-sm font-semibold text-gray-900 dark:text-white'>{item.title}</p>
                      <p className='text-[9px] text-gray-400 font-bold uppercase tracking-wider'>Album: {item.album || 'Single'}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className='flex items-center justify-between mt-1 pt-2 border-t border-black/10 dark:border-[#00FF5B]/20'>
              <p className='text-xs text-green-800 dark:text-[#00FF5B] font-black uppercase tracking-wider pl-0.5'>{selectedSongIds.length} Selected</p>
              <button 
                type="button" 
                onClick={() => addMultipleSongsToAlbum(selectedSongIds)} 
                disabled={selectedSongIds.length === 0}
                className='bg-black hover:bg-zinc-800 text-white dark:bg-[#00FF5B] dark:hover:bg-[#00e04e] dark:text-black font-extrabold text-[10px] uppercase py-2 px-5 border-2 border-black dark:border-black rounded-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer disabled:opacity-50'
              >
                Add Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditAlbum
