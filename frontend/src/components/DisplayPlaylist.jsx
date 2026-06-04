import React, { useContext, useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';
import { PlayerContext } from '../context/PlayerContext'
import axios from 'axios'

// Import dnd-kit packages for premium drag-and-drop sorting
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const formatDateAdded = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";

  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Sub-component for individual draggable track rows
const SortableTrackRow = ({
  item,
  index,
  isCurrentSong,
  playStatus,
  playWithId,
  addToQueue,
  handleRemoveSong,
  activeDropdownId,
  setActiveDropdownId,
  isDragDisabled,
  totalSongs,
  playlistId,
  showAddSubmenu,
  setShowAddSubmenu
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item._id, disabled: isDragDisabled });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 'auto',
    backgroundColor: isDragging ? 'rgba(29, 185, 84, 0.15)' : undefined
  };

  const { likedSongs, likeSong, unlikeSong, playlistsData, addSongToPlaylist, showToast } = useContext(PlayerContext);
  const isLiked = likedSongs && likedSongs.some(s => String(s._id) === String(item._id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => playWithId(item._id, playlistId)}
      className='grid grid-cols-4 sm:grid-cols-6 gap-2 p-2.5 items-center rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer group/row transition-all relative select-none'
    >
      {/* Index, Grab Handle & Title */}
      <div className='flex items-center gap-3 overflow-hidden col-span-2'>
        {/* Grab Handle for DnD Kit */}
        {!isDragDisabled ? (
          <span
            {...attributes}
            {...listeners}
            className='text-gray-500 hover:text-white dark:hover:text-black cursor-grab p-1 flex-shrink-0'
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className='w-2 flex-shrink-0' />
        )}
        <span className={`w-8 text-center font-semibold flex-shrink-0 flex items-center justify-center relative ${isCurrentSong ? 'text-[#1db954]' : 'text-[#a7a7a7]'}`}>
          {isCurrentSong ? (
            <>
              <span className="group-hover/row:hidden flex items-center justify-center">
                {playStatus ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-[#1db954] animate-pulse">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                ) : (
                  <span className="text-[#1db954]">{index + 1}</span>
                )}
              </span>
              <span className="hidden group-hover/row:flex items-center justify-center text-[#1db954]">
                {playStatus ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </>
          ) : (
            <>
              <span className="group-hover/row:hidden">{index + 1}</span>
              <span className="hidden group-hover/row:flex items-center justify-center text-gray-900 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </span>
            </>
          )}
        </span>
        <img className='w-10 h-10 object-cover rounded shadow flex-shrink-0' src={item.image} alt={item.title} />
        <div className='truncate'>
          <p className={`font-semibold text-sm truncate transition-colors ${isCurrentSong ? 'text-[#1db954]' : 'text-gray-900 dark:text-white group-hover/row:underline'}`}>
            {item.title || item.name}
          </p>
          <p className={`text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 transition-colors ${isCurrentSong ? 'text-[#1db954]/80' : ''}`}>MyMusic Artist</p>
        </div>
      </div>

      {/* Album Title */}
      <p className={`col-span-1 text-sm text-gray-600 dark:text-gray-300 truncate transition-colors ${isCurrentSong ? 'text-[#1db954]/75' : ''}`}>
        {item.albumId ? (typeof item.albumId === 'object' ? (item.albumId.title || item.albumId.name || 'Unknown Album') : item.albumId) : "Single"}
      </p>

      {/* Date Added */}
      <p className='col-span-1 text-sm text-gray-500 dark:text-gray-400 hidden sm:block'>
        {formatDateAdded(item.createdAt)}
      </p>

      {/* Duration */}
      <p className='col-span-1 text-sm text-gray-500 dark:text-gray-400 text-center hidden sm:block font-mono'>
        {item.duration}
      </p>

      {/* Action Dropdown Column */}
      <div className='col-span-1 flex items-center justify-end gap-2 pr-4 relative' onClick={(e) => e.stopPropagation()}>
        {/* Heart Like Button */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (isLiked) {
              await unlikeSong(item._id);
            } else {
              await likeSong(item._id);
            }
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer bg-transparent border-none outline-none ${isLiked ? 'opacity-100 text-[#1db954]' : 'opacity-40 lg:opacity-0 lg:group-hover/row:opacity-60 lg:hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
        >
          {isLiked ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 text-[#1db954]">
              <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-3.622-1.13A4.313 4.313 0 0 0 .276 4.22a4.347 4.347 0 0 0 .285 3.093 9.4 9.4 0 0 0 2.222 3.076l4.75 4.542a.64.64 0 0 0 .88 0l4.75-4.542a9.4 9.4 0 0 0 2.222-3.076 4.347 4.347 0 0 0 .285-3.093z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-3.622-1.13A4.313 4.313 0 0 0 .276 4.22a4.347 4.347 0 0 0 .285 3.093 9.4 9.4 0 0 0 2.222 3.076l4.75 4.542a.64.64 0 0 0 .88 0l4.75-4.542a9.4 9.4 0 0 0 2.222-3.076 4.347 4.347 0 0 0 .285-3.093z" />
            </svg>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdownId(activeDropdownId === item._id ? null : item._id);
            setShowAddSubmenu(false);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#282828] dark:hover:bg-gray-200 text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-black transition-all cursor-pointer bg-transparent border-none outline-none dropdown-trigger ${activeDropdownId === item._id ? 'opacity-100' : 'opacity-40 lg:opacity-0 lg:group-hover/row:opacity-100'}`}
          title="More options"
        >
          •••
        </button>

        {/* Floating Action Menu */}
        {activeDropdownId === item._id && (() => {
          const isNearBottom = index >= 2 && index >= totalSongs - 2;
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute right-4 z-50 bg-[#181818] dark:bg-white border border-[#282828] dark:border-gray-200 py-1.5 rounded-lg shadow-2xl w-56 font-bold text-xs text-gray-200 dark:text-gray-800 animate-fade-in dropdown-menu ${isNearBottom ? 'bottom-8' : 'top-8'
                }`}
            >
              {/* Add to Playlist Submenu */}
              <div className='relative group/submenu'>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSubmenu(!showAddSubmenu);
                  }}
                  className='w-full text-left px-4 py-2 hover:bg-[#282828] dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center justify-between font-bold text-xs'
                >
                  <span className='flex items-center gap-2.5'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add to playlist
                  </span>
                  <span className='text-[10px] text-gray-400 dark:text-gray-500'>▶</span>
                </button>

                {/* Submenu for playlists */}
                <div className={`absolute right-full top-0 mr-1 bg-[#181818] dark:bg-white border border-[#282828] dark:border-gray-200 py-1.5 rounded-lg shadow-2xl w-48 max-h-48 overflow-y-auto scrollbar-thin ${
                  showAddSubmenu ? 'block' : 'hidden group-hover/submenu:block'
                }`}>
                  {playlistsData.length === 0 ? (
                    <p className='px-4 py-2 text-[11px] text-gray-500 italic'>No playlists created</p>
                  ) : (
                    playlistsData.map((playlist) => (
                      <button
                        key={playlist._id || playlist.id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const success = await addSongToPlaylist(playlist._id || playlist.id, item._id);
                          if (success) {
                            showToast(`Added to playlist "${playlist.name}"`);
                          } else {
                            showToast(`Failed to add song to playlist`);
                          }
                          setActiveDropdownId(null);
                        }}
                        className='w-full text-left px-4 py-1.5 hover:bg-[#282828] dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors cursor-pointer truncate bg-transparent border-none outline-none block text-[11px] font-bold'
                      >
                        {playlist.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Remove from this playlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSong(item._id);
                  setActiveDropdownId(null);
                }}
                className='w-full text-left px-4 py-2 hover:bg-[#282828] dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center gap-2.5 font-bold text-xs'
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {isDragDisabled ? "Remove from Liked Songs" : "Remove from this playlist"}
              </button>



              {/* Add to Queue */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(item);
                  setActiveDropdownId(null);
                }}
                className='w-full text-left px-4 py-2 hover:bg-[#282828] dark:hover:bg-gray-100 hover:text-white dark:hover:text-black transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center gap-2.5 font-bold text-xs'
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 dark:text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h12m-12 5.25h12m3 0h3.5m-1.75-1.75v3.5" />
                </svg>
                Add to queue
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const DisplayPlaylist = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [playlistData, setPlaylistData] = useState(null)
  const [prevId, setPrevId] = useState(id)
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mobileSearchTerm, setMobileSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [showAddSubmenu, setShowAddSubmenu] = useState(false)

  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    url,
    playWithId,
    play,
    pause,
    playStatus,
    track,
    currentContextId,
    addToQueue,
    playlistsData,
    getPlaylistsData,
    removeSongFromPlaylist,
    reorderPlaylist,
    deletePlaylist,
    likeSong,
    unlikeSong,
    likedSongs,
    createPlaylist,
    customPrompt
  } = useContext(PlayerContext)

  // Setup sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // avoids conflict with standard clicks
      },
    })
  );

  const fetchPlaylistDetails = async () => {
    if (id === 'likes') {
      setPlaylistData({
        _id: 'likes',
        name: 'Liked Songs',
        desc: 'Your personal collection of liked tracks',
        songs: likedSongs || []
      });
      setNewTitle('Liked Songs');
      setError(null);
      return;
    }
    try {
      const response = await axios.get(`${url}/api/user/playlist/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.data.success) {
        setPlaylistData(response.data.playlist)
        setNewTitle(response.data.playlist.name)
        setError(null)
      } else {
        setError("Failed to load playlist data")
      }
    } catch (err) {
      console.error("Error fetching playlist details:", err)
      const token = localStorage.getItem('token');
      if (err.response?.status === 401 && token && token !== "null" && token !== "undefined") {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        fetchPlaylistDetails();
        return;
      }
      setError(err.response?.data?.message || "Server error fetching playlist details")
    }
  }

  useEffect(() => {
    if (id !== prevId) {
      setPlaylistData(null);
      setPrevId(id);
    }
    fetchPlaylistDetails();
  }, [id, playlistsData, likedSongs]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.closest('.dropdown-trigger') || e.target.closest('.dropdown-menu')) {
        return;
      }
      setActiveDropdownId(null);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [activeDropdownId]);

  if (error) {
    return (
      <div className='min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center select-none animate-fadeIn px-6 text-center'>
        <div className="text-red-500 text-3xl mb-4">⚠️</div>
        <p className="text-sm font-bold text-gray-300 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs rounded-full uppercase tracking-wider transition-all cursor-pointer border-none"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  if (!playlistData) {
    return (
      <div className='min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center select-none animate-fadeIn'>
        <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-bold text-gray-[#a7a7a7] tracking-widest uppercase animate-pulse">Loading Playlist...</p>
      </div>
    )
  }

  const playlistTracks = (playlistData.songs || []).filter(item => item !== null && item !== undefined)
  const isPlaylistPlaying = playStatus && track && playlistTracks.some(s => String(s._id) === String(track._id)) && String(currentContextId) === String(id)

  const handlePlayToggle = () => {
    if (playlistTracks.length === 0) return;
    const isCurrentTrackInPlaylist = playlistTracks.some(s => String(s._id) === String(track?._id)) && String(currentContextId) === String(id);
    if (isCurrentTrackInPlaylist) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(playlistTracks[0]._id, id);
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;
    try {
      const res = await axios.delete(`${url}/api/user/playlist/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.data.success) {
        getPlaylistsData();
        navigate('/');
      }
    } catch (err) {
      alert("Failed to delete playlist");
    }
  }

  const handleRemoveSong = async (songId) => {
    if (id === 'likes') {
      const success = await unlikeSong(songId);
      if (success) {
        fetchPlaylistDetails();
      } else {
        alert("Failed to remove song from Liked Songs");
      }
      return;
    }
    const success = await removeSongFromPlaylist(id, songId);
    if (success) {
      fetchPlaylistDetails();
    } else {
      alert("Failed to remove song");
    }
  }

  // Handles finishing drag events and updating sequencing
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = playlistTracks.findIndex(s => s._id === active.id);
    const newIndex = playlistTracks.findIndex(s => s._id === over.id);

    const updatedSongs = arrayMove(playlistTracks, oldIndex, newIndex);
    // Optimistic UI updates
    setPlaylistData({ ...playlistData, songs: updatedSongs });

    const songIds = updatedSongs.map(s => s._id);
    const success = await reorderPlaylist(id, songIds);
    if (!success) {
      alert("Failed to sync reordering on server");
      fetchPlaylistDetails();
    }
  }

  const handleRenamePlaylist = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await axios.put(`${url}/api/user/playlist/${id}`, {
        name: newTitle.trim()
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.data.success) {
        fetchPlaylistDetails();
        getPlaylistsData();
        setIsEditingTitle(false);
      }
    } catch (err) {
      console.error("Error renaming playlist:", err);
      alert("Failed to rename playlist");
    }
  }

  const handleCreatePlaylist = async () => {
    const defaultName = `My Playlist #${playlistsData.length + 1}`;
    const name = await customPrompt("Enter playlist name:", defaultName, "Create Playlist");
    if (name === null) return;
    const playlistName = name.trim() || defaultName;
    const newPlaylist = await createPlaylist(playlistName, "A customized user playlist");
    if (newPlaylist) {
      navigate(`/playlist/${newPlaylist._id || newPlaylist.id}`);
    }
  }

  const renderPlaylistCoverMobile = () => {
    if (id === 'likes') {
      return (
        <div className="w-52 h-52 rounded shadow bg-[#006450] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-24 h-24 text-[#1db954]" fill="currentColor">
            <path d="M5 3h14a2 2 0 012 2v16l-9-5-9 5V5a2 2 0 012-2z" />
          </svg>
        </div>
      );
    }
    if (playlistTracks && playlistTracks.length >= 4) {
      return (
        <div className="w-52 h-52 rounded shadow overflow-hidden grid grid-cols-2 grid-rows-2 border border-zinc-800 flex-shrink-0">
          <img className="w-full h-full object-cover" src={playlistTracks[0].image || playlistTracks[0].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[1].image || playlistTracks[1].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[2].image || playlistTracks[2].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[3].image || playlistTracks[3].cover} alt="" />
        </div>
      );
    }
    if (playlistTracks && playlistTracks.length >= 1) {
      return (
        <div className="w-52 h-52 rounded overflow-hidden border border-zinc-800 flex-shrink-0">
          <img className="w-full h-full object-cover" src={playlistTracks[0].image || playlistTracks[0].cover} alt="" />
        </div>
      );
    }
    return (
      <div className="w-52 h-52 bg-zinc-800 rounded flex items-center justify-center border border-zinc-800 shadow flex-shrink-0 overflow-hidden">
        <img className='w-full h-full object-cover' src={assets.mymusic_logo} alt="" />
      </div>
    );
  };

  if (isMobile) {
    // Filter list locally on mobile search
    const mobileFilteredTracks = playlistTracks.filter(item => {
      const title = (item.title || item.name || '').toLowerCase();
      const artist = (item.artist || item.artistName || '').toLowerCase();
      const search = mobileSearchTerm.toLowerCase();
      return title.includes(search) || artist.includes(search);
    });

    return (
      <div className='bg-[#121212] min-h-screen text-white select-none pb-24 relative animate-fadeIn'>
        {/* Gradient Header overlay */}
        <div
          className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b opacity-45 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to bottom, ${id === 'likes' ? '#006450' : '#1db954'}, #121212)` }}
        />

        {/* Mobile Sticky Top bar with Search inside Playlist */}
        <div className="flex items-center justify-between px-3 py-2.5 sticky top-0 bg-[#121212]/90 backdrop-blur-md z-30 border-b border-zinc-800/40 gap-3">
          <button onClick={() => navigate(-1)} className="text-white hover:opacity-80 bg-transparent border-none outline-none cursor-pointer p-0 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </button>

          {/* Search Input Bar (Find in playlist) */}
          <div className="flex-1 relative flex items-center">
            <span className="absolute left-3 text-zinc-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Find in playlist"
              value={mobileSearchTerm}
              onChange={(e) => setMobileSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 text-white pl-9 pr-8 py-1.5 rounded text-xs font-bold focus:outline-none placeholder-zinc-400 border border-zinc-700"
            />
            {mobileSearchTerm && (
              <button
                onClick={() => setMobileSearchTerm('')}
                className="absolute right-2.5 text-zinc-400 hover:text-white font-bold text-xs bg-transparent border-none outline-none cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <div className="w-1" />
        </div>

        {/* Playlist Info container */}
        <div className="px-5 pt-4 pb-2 relative z-10 flex flex-col items-start">
          <div className="mx-auto mb-6">
            {renderPlaylistCoverMobile()}
          </div>

          <div className="w-full flex flex-col text-left">
            <h2 className="text-xl font-black tracking-tight leading-tight mb-2 flex items-center gap-2">
              {playlistData.name}
            </h2>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-5.5 h-5.5 rounded-full bg-purple-500 text-black flex items-center justify-center font-bold text-xs capitalize">
                {username.charAt(0)}
              </div>
              <span className="text-xs font-bold">{username}</span>
            </div>

            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
              <span>🌐</span> Playlist • {playlistTracks.length} songs • 35h 29min
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between px-5 my-3 relative z-10">
          <div className="flex items-center gap-5">
            {/* Delete Playlist Pill Button */}
            {id !== 'likes' && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-full border border-red-500/80 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm border-none"
                title="Delete Playlist"
              >
                Delete Playlist
              </button>
            )}

            {/* 3-dots */}
            <button className="text-gray-400 hover:text-white bg-transparent border-none outline-none cursor-pointer p-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 8a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm0 6a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm0-12a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-5">
            {/* Shuffle Icon */}
            <button className="text-gray-400 hover:text-white bg-transparent border-none outline-none cursor-pointer p-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <path d="M15 15l6 6" /><path d="M4 4l5 5" />
              </svg>
            </button>

            {/* Big Green Play Button */}
            <button
              onClick={handlePlayToggle}
              className="w-12 h-12 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all border-none outline-none"
            >
              {isPlaylistPlaying ? (
                <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="black">
                  <path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path>
                </svg>
              ) : (
                <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="black" className="ml-0.5">
                  <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Action Pills Row: Add, Edit, Sort */}
        <div className="flex gap-2.5 px-5 my-3.5 select-none text-[10px] font-bold">
          <button
            onClick={handleCreatePlaylist}
            className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 border-none cursor-pointer"
          >
            <span>＋</span> Add
          </button>
          <button
            onClick={() => id !== 'likes' && setIsEditingTitle(true)}
            className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 border-none cursor-pointer"
          >
            <span>＝</span> Edit
          </button>
          <button
            className="px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 border-none cursor-pointer"
          >
            <span>↕</span> Sort
          </button>
        </div>

        {/* Draggable/Standard flex-based Track List on mobile */}
        {mobileFilteredTracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            <p>No matching tracks inside this playlist.</p>
          </div>
        ) : (
          <div className="flex flex-col px-4 gap-1.5 relative z-10 mb-20">
            {mobileFilteredTracks.map((item, index) => {
              const isCurrentSong = track && String(track._id) === String(item._id) && String(currentContextId) === String(id);
              const isLiked = likedSongs && likedSongs.some(s => String(s._id) === String(item._id));

              return (
                <div
                  key={item._id}
                  onClick={() => playWithId(item._id, id)}
                  className="flex items-center justify-between p-2.5 rounded hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer group/row"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Track Thumbnail */}
                    <img className="w-10 h-10 object-cover rounded shadow border border-zinc-800" src={item.image} alt="" />
                    <div className="truncate min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isCurrentSong ? 'text-[#1db954]' : 'text-white'}`}>
                        {item.title || item.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {item.artistName || item.artist || "MyMusic Artist"}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons (liked heart and 3-dots) on right */}
                  <div className="flex items-center gap-3 flex-shrink-0 pr-1" onClick={(e) => e.stopPropagation()}>
                    {/* Heart Button */}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (isLiked) {
                          await unlikeSong(item._id);
                        } else {
                          await likeSong(item._id);
                        }
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-transparent border-none outline-none cursor-pointer ${isLiked ? 'text-[#1db954]' : 'text-gray-400'
                        }`}
                    >
                      {isLiked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-[#1db954]">
                          <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-3.622-1.13A4.313 4.313 0 0 0 .276 4.22a4.347 4.347 0 0 0 .285 3.093 9.4 9.4 0 0 0 2.222 3.076l4.75 4.542a.64.64 0 0 0 .88 0l4.75-4.542a9.4 9.4 0 0 0 2.222-3.076 4.347 4.347 0 0 0 .285-3.093z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-3.622-1.13A4.313 4.313 0 0 0 .276 4.22a4.347 4.347 0 0 0 .285 3.093 9.4 9.4 0 0 0 2.222 3.076l4.75 4.542a.64.64 0 0 0 .88 0l4.75-4.542a9.4 9.4 0 0 0 2.222-3.076 4.347 4.347 0 0 0 .285-3.093z" />
                        </svg>
                      )}
                    </button>

                    {/* 3-dots relative container */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === item._id ? null : item._id);
                          setShowAddSubmenu(false);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white bg-transparent border-none outline-none cursor-pointer text-base dropdown-trigger"
                      >
                        •••
                      </button>

                      {activeDropdownId === item._id && (() => {
                        const isNearBottom = index >= 2 && index >= mobileFilteredTracks.length - 2;
                        return (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-4 z-50 bg-[#181818] border border-[#282828] py-1.5 rounded-lg shadow-2xl w-56 font-bold text-xs text-gray-200 animate-fade-in dropdown-menu ${
                              isNearBottom ? 'bottom-8' : 'top-8'
                            }`}
                          >
                            {/* Add to Playlist Submenu */}
                            <div className='relative group/submenu'>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddSubmenu(!showAddSubmenu);
                                }}
                                className='w-full text-left px-4 py-2 hover:bg-[#282828] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center justify-between font-bold text-xs'
                              >
                                <span className='flex items-center gap-2.5'>
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                  Add to playlist
                                </span>
                                <span className='text-[10px] text-gray-400'>▶</span>
                              </button>

                              {/* Submenu for playlists */}
                              <div className={`absolute right-full top-0 mr-1 bg-[#181818] border border-[#282828] py-1.5 rounded-lg shadow-2xl w-48 max-h-48 overflow-y-auto scrollbar-thin ${
                                showAddSubmenu ? 'block' : 'hidden group-hover/submenu:block'
                              }`}>
                                {playlistsData.length === 0 ? (
                                  <p className='px-4 py-2 text-[11px] text-gray-500 italic'>No playlists created</p>
                                ) : (
                                  playlistsData.map((playlist) => (
                                    <button
                                      key={playlist._id || playlist.id}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const success = await addSongToPlaylist(playlist._id || playlist.id, item._id);
                                        if (success) {
                                          showToast(`Added to playlist "${playlist.name}"`);
                                        } else {
                                          showToast(`Failed to add song to playlist`);
                                        }
                                        setActiveDropdownId(null);
                                      }}
                                      className='w-full text-left px-4 py-1.5 hover:bg-[#282828] hover:text-white transition-colors cursor-pointer truncate bg-transparent border-none outline-none block text-[11px] font-bold text-gray-200'
                                    >
                                      {playlist.name}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Remove from this playlist */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSong(item._id);
                                setActiveDropdownId(null);
                              }}
                              className='w-full text-left px-4 py-2 hover:bg-[#282828] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center gap-2.5 font-bold text-xs'
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                              {id === 'likes' ? "Remove from Liked Songs" : "Remove from this playlist"}
                            </button>

                            {/* Add to Queue */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToQueue(item);
                                setActiveDropdownId(null);
                              }}
                              className='w-full text-left px-4 py-2 hover:bg-[#282828] hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none flex items-center gap-2.5 font-bold text-xs'
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h12m-12 5.25h12m3 0h3.5m-1.75-1.75v3.5" />
                              </svg>
                              Add to queue
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='pr-1 animate-fadeIn select-none'>

      {/* Playlist Banner */}
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end select-none'>
        <div className='w-48 h-48 rounded shadow-md border border-gray-300 dark:border-gray-800 relative overflow-hidden flex-shrink-0 bg-zinc-900 flex items-center justify-center'>
          {id === 'likes' ? (
            <div className="w-full h-full bg-[#006450] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-20 h-20 text-[#1db954]" fill="currentColor">
                <path d="M5 3h14a2 2 0 012 2v16l-9-5-9 5V5a2 2 0 012-2z" />
              </svg>
            </div>
          ) : (
            <>
              <img className='w-full h-full object-cover' src={assets.mymusic_logo} alt="Playlist Cover" />
              <div className='absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-center text-white text-xs font-bold'>
                MyMusic Playlist
              </div>
            </>
          )}
        </div>
        <div className='flex flex-col'>
          <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>User Album / Playlist</p>
          {isEditingTitle ? (
            <div className='flex items-center gap-2 mt-2'>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className='bg-gray-200 dark:bg-[#282828] text-gray-900 dark:text-white text-3xl font-bold px-3 py-1.5 rounded outline-none border border-[#1db954] w-full max-w-md'
                autoFocus
              />
              <button onClick={handleRenamePlaylist} className='px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-sm rounded-full cursor-pointer border-none'>Save</button>
              <button onClick={() => setIsEditingTitle(false)} className='px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold text-sm rounded-full cursor-pointer border-none'>Cancel</button>
            </div>
          ) : (
            <h2
              onClick={() => id !== 'likes' && setIsEditingTitle(true)}
              className={`text-5xl font-bold mb-4 md:text-7xl tracking-tight text-gray-900 dark:text-white flex items-center gap-3 transition-colors group ${id !== 'likes' ? 'hover:text-[#1db954] cursor-pointer' : ''
                }`}
              title={id !== 'likes' ? "Click to rename" : ""}
            >
              {playlistData.name}
              {id !== 'likes' && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 opacity-0 group-hover:opacity-60 transition-opacity">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              )}
            </h2>
          )}
          <h4 className='text-gray-500 dark:text-gray-400 text-sm'>{playlistData.desc || (id === 'likes' ? "Your personal collection of liked tracks" : "Custom private music collection")}</h4>
          <p className='mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5'>
            <span className='font-bold text-gray-800 dark:text-white'> MyMusic User </span>
            • <b> {playlistTracks.length} songs </b>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center gap-6 mt-6 pl-2 select-none'>
        {/* Play Button */}
        <button
          onClick={handlePlayToggle}
          className='w-14 h-14 bg-[#1db954] hover:bg-[#1ed760] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200 border-none'
          title={isPlaylistPlaying ? "Pause" : "Play"}
        >
          {isPlaylistPlaying ? (
            <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="black">
              <path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path>
            </svg>
          ) : (
            <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="black" className="ml-0.5">
              <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
            </svg>
          )}
        </button>

        {/* Delete Playlist Button */}
        {id !== 'likes' && (
          <button
            onClick={handleDelete}
            className='px-5 py-2 border border-red-500 hover:bg-red-600/20 text-red-500 hover:text-red-400 text-xs font-bold rounded-full transition-all cursor-pointer bg-transparent'
            title="Delete Playlist"
          >
            Delete Playlist
          </button>
        )}
      </div>

      {/* Drag-and-Drop Tracks List */}
      {playlistTracks.length === 0 ? (
        <div className='text-center py-16 text-gray-500 text-sm select-none border-t border-gray-200 dark:border-[#282828] mt-10'>
          <p>{id === 'likes' ? "You haven't liked any songs yet." : "Your playlist is empty. Let's find some music to add below!"}</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Grid Headers */}
          <div className='grid grid-cols-4 sm:grid-cols-6 mt-10 mb-4 pl-2 text-gray-500 dark:text-[#a7a7a7] text-xs font-semibold uppercase tracking-wider select-none'>
            <p className='col-span-2 flex items-center gap-3'>
              <span className='w-2 flex-shrink-0'></span>
              <span className='w-8 text-center flex-shrink-0 font-bold'>#</span>
              <span>Title</span>
            </p>
            <p className='col-span-1'>Album</p>
            <p className='col-span-1 hidden sm:block'>Date Added</p>
            <p className='col-span-1 text-center hidden sm:block'>Duration</p>
            <p className='col-span-1 text-right pr-10'></p>
          </div>
          <hr className='border-gray-200 dark:border-[#282828] mb-2' />

          {/* Draggable Track List */}
          <SortableContext
            items={playlistTracks.map(s => s._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className='flex flex-col mb-10 select-none'>
              {playlistTracks.map((item, index) => {
                const isCurrentSong = track && String(track._id) === String(item._id) && String(currentContextId) === String(id);

                return (
                  <SortableTrackRow
                    key={item._id}
                    item={item}
                    index={index}
                    isCurrentSong={isCurrentSong}
                    playStatus={playStatus}
                    playWithId={playWithId}
                    addToQueue={addToQueue}
                    handleRemoveSong={handleRemoveSong}
                    activeDropdownId={activeDropdownId}
                    setActiveDropdownId={setActiveDropdownId}
                    isDragDisabled={id === 'likes'}
                    totalSongs={playlistTracks.length}
                    playlistId={id}
                    showAddSubmenu={showAddSubmenu}
                    setShowAddSubmenu={setShowAddSubmenu}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export default DisplayPlaylist
