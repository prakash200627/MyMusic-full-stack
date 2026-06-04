import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { assets } from '../assets/assets.js'
import { url } from '../App.jsx'
import { toast } from 'react-toastify'

const AddSong = () => {
    const [image, setImage] = useState(false)
    const [song, setSong] = useState(false)
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [albumId, setAlbumId] = useState('none')
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [albums, setAlbums] = useState([])
    const imageInputRef = useRef(null)
    const songInputRef = useRef(null)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('title', name)
            formData.append('desc', desc)
            formData.append('image', image)
            formData.append('audio', song)
            if (albumId && albumId !== 'none') {
                formData.append('albumId', albumId)
            }

            const response = await axios.post(`${url}/api/song/add`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    setUploadProgress(percent)
                }
            })

            if (response?.data?.success) {
                toast.success(response.data.message || 'Song added successfully')
                setName('')
                setDesc('')
                setAlbumId('none')
                setImage(false)
                setSong(false)
                setUploadProgress(0)
                if (imageInputRef.current) imageInputRef.current.value = ''
                if (songInputRef.current) songInputRef.current.value = ''
            } else {
                toast.error(response.data?.message || 'Something went wrong')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error occurred')
        }
        setLoading(false)
    }

    const loadAlbumData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`)
            if (response.data.success) {
                setAlbums(response.data.albums)
            } else {
                toast.error("Unable to load albums data")
            }
        } catch (error) {
            toast.error("Error occurred")
        }
    }

    useEffect(() => {
        loadAlbumData()
    }, [])

    return (
        <div className="pr-5 sm:pr-12 animate-fadeIn max-w-2xl">
            {/* Title */}
            <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Upload New Track</h2>
                <p className="text-xs text-gray-500 dark:text-[#00FF5B] font-bold uppercase tracking-wide mt-1">Add standard audio tracks to your MyMusic catalog database.</p>
            </div>

            {loading ? (
                <div className="bg-white dark:bg-[#0c1510] border-2 border-black dark:border-[#00FF5B] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_#00FF5B] p-12 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00FF5B] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-900 dark:text-white font-bold uppercase text-xs">Uploading track data ({uploadProgress}%)...</p>
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
                    
                    {/* Media Uploaders */}
                    <div className='flex flex-wrap gap-8'>
                        {/* Song File */}
                        <div className='flex flex-col gap-2'>
                            <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">1. Select Song File</label>
                            <input ref={songInputRef} onChange={(e)=>setSong(e.target.files[0])} type="file" id='song' accept='audio/*' hidden required={!song}/>
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
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Audio File</span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Image file */}
                        <div className='flex flex-col gap-2'>
                            <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">2. Select Cover Image</label>
                            <input ref={imageInputRef} onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' accept='image/*' hidden required={!image}/>
                            <label htmlFor="image" className="cursor-pointer group">
                                <div className="border-2 border-black dark:border-[#00FF5B] p-1 bg-[#F3FFF7] dark:bg-zinc-900/60 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_#00FF5B] group-hover:scale-105 active:scale-95 transition-all w-28 h-28 flex flex-col items-center justify-center text-center overflow-hidden">
                                    {image ? (
                                        <img src={URL.createObjectURL(image)} className='w-full h-full object-cover' alt="" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5 p-3">
                                            <span className="text-2xl text-gray-400">🖼️</span>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Cover Art</span>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Song Title */}
                    <div className='flex flex-col gap-1.5 w-full'>
                        <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Track Title</label>
                        <input 
                            onChange={(e)=>setName(e.target.value)} 
                            value={name} 
                            type="text" 
                            className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold rounded-none' 
                            placeholder='e.g., Summer Vibe' 
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className='flex flex-col gap-1.5 w-full'>
                        <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Song Description</label>
                        <input 
                            onChange={(e)=>setDesc(e.target.value)} 
                            value={desc} 
                            type="text" 
                            className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all font-semibold rounded-none' 
                            placeholder='e.g., Energetic summer dynamic pop' 
                            required
                        />
                    </div>

                    {/* Album Selection Dropdown */}
                    <div className='flex flex-col gap-1.5 w-full sm:w-[220px]'>
                        <label className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-0.5">Assign to Album</label>
                        <select 
                            onChange={(e)=>setAlbumId(e.target.value)} 
                            value={albumId} 
                            className='bg-[#F3FFF7] dark:bg-zinc-900/60 border-2 border-black dark:border-[#00FF5B] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:bg-white transition-all font-bold rounded-none cursor-pointer' 
                            required
                        >
                            <option value="none" className="text-gray-900 bg-white">Single (No Album)</option>
                            {albums.map((item)=>(
                                <option key={item._id || item.id} value={item._id || item.id} className="text-gray-900 bg-white">{item.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className='bg-[#00FF5B] hover:bg-[#00e04e] text-black font-extrabold py-3.5 border-2 border-black rounded-none transition-all cursor-pointer text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_#00FF5B] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_#00FF5B] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:active:shadow-[4px_4px_0px_0px_#00FF5B] mt-4 flex items-center justify-center gap-2 uppercase tracking-widest'
                    >
                        📤 Add Track
                    </button>
                </form>
            )}
        </div>
    )
}

export default AddSong
