import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { assets } from '../assets/assets.js'
import { url } from '../App.jsx'
import { toast } from 'react-toastify'

const EditSong = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [image, setImage] = useState(false)
    const [song, setSong] = useState(false)
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [albumId, setAlbumId] = useState('none')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [albums, setAlbums] = useState([])

    const [currentImageUrl, setCurrentImageUrl] = useState('')
    const [currentSongUrl, setCurrentSongUrl] = useState('')

    const imageInputRef = useRef(null)
    const songInputRef = useRef(null)

    const fetchSongDetails = async () => {
        try {
            const response = await axios.get(`${url}/api/song/list`)
            if (response.data.success) {
                const found = response.data.songs.find(s => s._id === id)
                if (found) {
                    setName(found.title)
                    setDesc(found.desc)
                    setAlbumId(found.albumId ? (found.albumId._id || found.albumId) : 'none')
                    setCurrentImageUrl(found.image)
                    setCurrentSongUrl(found.file)
                } else {
                    toast.error("Song not found")
                    navigate('/list-song')
                }
            }
        } catch (error) {
            toast.error("Error loading song details")
        } finally {
            setLoading(false)
        }
    }

    const loadAlbumData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`)
            if (response.data.success) {
                setAlbums(response.data.albums)
            }
        } catch (error) {
            console.error("Error loading albums", error)
        }
    }

    useEffect(() => {
        loadAlbumData()
        fetchSongDetails()
    }, [id])

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('title', name)
            formData.append('desc', desc)
            formData.append('albumId', albumId)
            
            if (image) formData.append('image', image)
            if (song) formData.append('audio', song)

            const response = await axios.put(`${url}/api/song/${id}`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    setUploadProgress(percent)
                }
            })

            if (response?.data?.success) {
                toast.success(response.data.message || 'Song updated successfully')
                navigate('/list-song')
            } else {
                toast.error(response.data?.message || 'Something went wrong')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error occurred')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center pt-24 gap-4">
                <div className="w-12 h-12 border-4 border-[#00FF5B] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">Retrieving track metadata...</p>
            </div>
        )
    }

    return (
        <div className="pr-5 sm:pr-12 animate-fadeIn max-w-2xl">
            {/* Title */}
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Modify Track Details</h2>
                <p className="text-xs text-gray-500 dark:text-[#00FF5B] font-bold uppercase tracking-wide mt-1">Edit track metadata, replace album cover, or re-upload audio files.</p>
            </div>

            {saving ? (
                <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#00FF5B] p-12 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00FF5B] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-900 dark:text-white font-bold uppercase text-xs">Saving track modifications ({uploadProgress}%)...</p>
                    {uploadProgress > 0 && (
                        <div className='w-full max-w-xs mt-2'>
                            <div className='h-3 bg-gray-150 dark:bg-zinc-800 border-2 border-black dark:border-[#00FF5B]'>
                                <div style={{width: `${uploadProgress}%`}} className='h-full bg-[#00FF5B] transition-all duration-100'></div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={onSubmitHandler} className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#00FF5B] p-6 sm:p-8 flex flex-col gap-6 select-none">
                    
                    {/* Media upload slots */}
                    <div className='flex flex-wrap gap-8'>
                        {/* Audio track replace */}
                        <div className='flex flex-col gap-2'>
                            <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Replace Audio (Optional)</label>
                            <input ref={songInputRef} onChange={(e) => setSong(e.target.files[0])} type="file" id='song' accept='audio/*' hidden />
                            <label htmlFor="song" className="cursor-pointer group">
                                <div className="border-2 border-black dark:border-[#00FF5B] p-4 bg-[#F3FFF7] dark:bg-zinc-900/60 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] group-hover:scale-105 active:scale-95 transition-all w-28 h-28 flex flex-col items-center justify-center text-center gap-1.5">
                                    {song ? (
                                        <>
                                            <span className="text-2xl">🎵</span>
                                            <span className="text-[9px] font-bold text-green-600 dark:text-[#00FF5B] uppercase tracking-wider truncate max-w-[90px]">{song.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-2xl text-gray-400">📤</span>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Change Audio</span>
                                        </>
                                    )}
                                </div>
                            </label>
                            {currentSongUrl && !song && (
                                <p className='text-[10px] text-green-700 dark:text-[#00FF5B] bg-green-50 dark:bg-green-950/20 px-2 py-0.5 border border-green-200 dark:border-green-800/30 truncate max-w-[150px] font-mono'>
                                    File loaded ✓
                                </p>
                            )}
                        </div>

                        {/* Cover image replace */}
                        <div className='flex flex-col gap-2'>
                            <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Replace Cover (Optional)</label>
                            <input ref={imageInputRef} onChange={(e) => setImage(e.target.files[0])} type="file" id='image' accept='image/*' hidden />
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
                    </div>

                    {/* Track Title */}
                    <div className='flex flex-col gap-1.5 w-full'>
                        <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Track Title</label>
                        <input 
                            onChange={(e) => setName(e.target.value)} 
                            value={name} 
                            type="text" 
                            className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold rounded-none' 
                            required 
                        />
                    </div>
                    
                    {/* Description */}
                    <div className='flex flex-col gap-1.5 w-full'>
                        <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Song Description</label>
                        <input 
                            onChange={(e) => setDesc(e.target.value)} 
                            value={desc} 
                            type="text" 
                            className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold rounded-none' 
                            required 
                        />
                    </div>

                    {/* Album select */}
                    <div className='flex flex-col gap-1.5 w-full sm:w-[220px]'>
                        <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Assign to Album</label>
                        <select 
                            onChange={(e) => setAlbumId(e.target.value)} 
                            value={albumId} 
                            className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white transition-all font-bold rounded-none cursor-pointer' 
                            required
                        >
                            <option value="none" className="text-gray-900 bg-white">Single (No Album)</option>
                            {albums.map((item) => (
                                <option key={item._id || item.id} value={item._id || item.id} className="text-gray-900 bg-white">{item.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action buttons */}
                    <div className='flex flex-wrap gap-4 mt-4'>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className='bg-[#00FF5B] hover:bg-[#00e04e] text-black font-extrabold py-3.5 px-8 border-2 border-black rounded-none transition-all cursor-pointer text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_#00FF5B] uppercase tracking-widest disabled:opacity-50'
                        >
                            💾 Save Modifications
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/list-song')} 
                            className='bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-900 dark:text-white font-extrabold py-3.5 px-8 border-2 border-black dark:border-[#00FF5B] rounded-none transition-all cursor-pointer text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_#00FF5B] uppercase tracking-widest'
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default EditSong
