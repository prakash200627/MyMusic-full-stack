import React, { useContext, useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useParams, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';
import { PlayerContext } from '../context/PlayerContext'
import axios from 'axios'

const DisplayAlbum = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [albumData, setAlbumData] = useState(null)
  const [activeDropdownId, setActiveDropdownId] = useState(null)
  const [showAddSubmenu, setShowAddSubmenu] = useState(false)

  const {
    playWithId,
    albumsData,
    songsData,
    play,
    pause,
    playStatus,
    track,
    currentContextId,
    getSongsData,
    getAlbumsData,
    addToQueue,
    customConfirm,
    showToast,
    savedAlbumsData,
    saveAlbum,
    unsaveAlbum,
    playlistsData,
    addSongToPlaylist,
    likedSongs,
    likeSong,
    unlikeSong
  } = useContext(PlayerContext)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSaved = savedAlbumsData && albumData && savedAlbumsData.some(item => String(item._id) === String(albumData._id));

  useEffect(() => {
    getSongsData();
    getAlbumsData();
  }, [id]);

  useEffect(() => {
    if (id === 'mix') {
      setAlbumData({
        _id: 'mix',
        name: 'Main Album',
        desc: 'A premium compiled playlist featuring all songs in all albums.',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        bgColor: '#1db954'
      });
      return;
    }
    if (!albumsData || albumsData.length === 0) return;
    const found = albumsData.find((item) => item._id === id);
    setAlbumData(found || null);
  }, [albumsData, id])

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

  if (albumsData && albumsData.length > 0 && !albumData) {
    return (
      <div className='mt-20 text-center text-gray-900 dark:text-white'>Album not found</div>
    )
  }

  const albumTracks = id === 'mix'
    ? (songsData || [])
    : (songsData || []).filter((item) => {
      const songAlbumId = item.albumId && (item.albumId._id || item.albumId);
      return String(songAlbumId) === String(albumData?._id) ||
        String(item.album).toLowerCase() === String(albumData?.name).toLowerCase();
    });
  const isAlbumPlaying = playStatus && track && albumTracks.some(s => String(s._id) === String(track._id)) && String(currentContextId) === String(id);

  const handleAlbumPlayToggle = () => {
    if (albumTracks.length === 0) return;
    const isCurrentTrackInAlbum = albumTracks.some(s => String(s._id) === String(track?._id)) && String(currentContextId) === String(id);
    if (isCurrentTrackInAlbum) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(albumTracks[0]._id, id);
    }
  }

  if (isMobile) {
    return albumData ? (
      <div className='bg-[#121212] min-h-screen text-white select-none pb-24 relative animate-fadeIn'>
        {/* Gradient Header overlay */}
        <div 
          className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b opacity-45 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(to bottom, ${albumData.bgColor || '#1db954'}, #121212)` }}
        />
        
        {/* Mobile Sticky Top bar */}
        <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-[#121212]/90 backdrop-blur-md z-30 border-b border-zinc-800/40">
          <button onClick={() => navigate(-1)} className="text-white hover:opacity-80 bg-transparent border-none outline-none cursor-pointer p-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </button>
          <span className="font-extrabold text-sm truncate max-w-[70%]">{albumData.name}</span>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Album Artwork & Details container */}
        <div className="px-5 pt-4 pb-2 relative z-10 flex flex-col items-start">
          {/* Cover image */}
          <div className="w-52 h-52 shadow-2xl mb-6 flex-shrink-0 relative">
            <img className='w-full h-full object-cover rounded shadow-md border border-zinc-800' src={albumData.image} alt={albumData.name} />
          </div>

          {/* Title, Artist, EP Details */}
          <div className="w-full flex flex-col text-left">
            <h2 className="text-xl font-black tracking-tight leading-tight mb-2.5">{albumData.name}</h2>
            
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5.5 h-5.5 rounded-full bg-[#1db954] text-black flex items-center justify-center font-bold text-xs capitalize">
                {albumData.name.charAt(0)}
              </div>
              <span className="text-xs font-bold">{albumTracks[0]?.artistName || albumTracks[0]?.artist || "MyMusic Artist"}</span>
            </div>

            <p className="text-[10px] font-bold text-gray-400">Album • {albumTracks.length} songs • 2026</p>
          </div>
        </div>

        {/* Album Action buttons row */}
        <div className="flex items-center justify-between px-5 my-3 relative z-10">
          <div className="flex items-center gap-5">
            {/* Save to Library Pill Button */}
            <button 
              onClick={async () => {
                if (isSaved) {
                  await unsaveAlbum(albumData._id);
                } else {
                  await saveAlbum(albumData._id);
                }
              }}
              className={`px-3 py-1.5 rounded-full border text-[10px] font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${isSaved
                ? 'border-[#1db954] bg-[#1db954]/10 text-[#1db954]'
                : 'border-zinc-700 bg-transparent text-gray-300 hover:text-white'
              }`}
              title={isSaved ? "Remove from Library" : "Save to Library"}
            >
              {isSaved ? "✓ Saved" : "+ Save to Library"}
            </button>

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
              onClick={handleAlbumPlayToggle}
              className="w-12 h-12 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all border-none outline-none"
            >
              {isAlbumPlaying ? (
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

        {/* Tracks list on mobile */}
        <div className="flex flex-col px-4 gap-1.5 relative z-10 mb-20">
          {albumTracks.map((item, index) => {
            const isCurrentSong = track && String(track._id) === String(item._id) && String(currentContextId) === String(id);
            const isLiked = likedSongs && likedSongs.some(s => String(s._id) === String(item._id));

            return (
              <div 
                key={item._id || index}
                onClick={() => playWithId(item._id, id)}
                className="flex items-center justify-between p-2.5 rounded hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer group/row"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Track Thumbnail */}
                  <img className="w-10 h-10 object-cover rounded shadow border border-zinc-800" src={item.image} alt="" />
                  <div className="truncate min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isCurrentSong ? 'text-[#1db954]' : 'text-white'}`}>
                      {item.name}
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all bg-transparent border-none outline-none cursor-pointer ${
                      isLiked ? 'text-[#1db954]' : 'text-gray-400'
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
                      const isNearBottom = index >= 2 && index >= albumTracks.length - 2;
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
      </div>
    ) : null;
  }

  return albumData ? (
    <div className='pr-1 animate-fadeIn select-none'>

      {/* Album Info */}
      <div className='mt-10 flex gap-8 flex-col md:flex-row md:items-end select-none'>
        <img className='w-48 rounded shadow-md border border-gray-300 dark:border-gray-800' src={albumData.image} alt="" />
        <div className='flex flex-col'>
          <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>Playlist</p>
          <h2 className='text-5xl font-bold mb-4 md:text-7xl tracking-tight text-gray-900 dark:text-white'>{albumData.name}</h2>
          <h4 className='text-gray-500 dark:text-gray-400 text-sm'>{albumData.desc}</h4>
          <p className='mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5'>
            <b className='text-gray-800 dark:text-white'> MyMusic </b>
            • 1,323,154 likes
            • <b className='text-gray-850 dark:text-white'> {albumTracks.length} songs, </b>
            about 2 hr 30 min
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center gap-6 mt-6 pl-2 select-none'>
        {/* Play Button */}
        <button
          onClick={handleAlbumPlayToggle}
          className='w-14 h-14 bg-[#1db954] hover:bg-[#1ed760] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200'
          title={isAlbumPlaying ? "Pause" : "Play"}
        >
          {isAlbumPlaying ? (
            <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="black">
              <path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path>
            </svg>
          ) : (
            <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="black" className="ml-0.5">
              <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
            </svg>
          )}
        </button>

        {/* Save to Library Toggle Button */}
        <button
          onClick={async () => {
            if (isSaved) {
              await unsaveAlbum(albumData._id);
            } else {
              await saveAlbum(albumData._id);
            }
          }}
          className={`px-5 py-2.5 rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${isSaved
            ? 'border-[#1db954] bg-[#1db954]/10 text-[#1db954] hover:bg-[#1db954]/20'
            : 'border-gray-300 dark:border-zinc-700 bg-transparent text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white'
            }`}
          title={isSaved ? "Remove from Library" : "Save to Library"}
        >
          {isSaved ? "✓ Saved" : "+ Save to Library"}
        </button>
      </div>

      {/* Grid Headers */}
      <div className='grid grid-cols-4 sm:grid-cols-5 mt-10 mb-4 pl-2 text-[#a7a7a7] text-xs font-semibold uppercase tracking-wider select-none'>
        <p className='col-span-2 flex items-center gap-4'><span className='w-8 text-center flex-shrink-0 font-bold'>#</span>Title</p>
        <p className='col-span-1'>Album</p>
        <p className='col-span-1 text-center hidden sm:block'>Duration</p>
        <p className='col-span-1 text-right pr-10'></p>
      </div>
      <hr className='border-gray-300 dark:border-[#282828] mb-2' />

      {/* Track List */}
      <div className='flex flex-col mb-10 select-none'>
        {albumTracks.map((item, index) => {
          const isCurrentSong = track && String(track._id) === String(item._id) && String(currentContextId) === String(id);
          const isLiked = likedSongs && likedSongs.some(s => String(s._id) === String(item._id));

          return (
            <div
              onClick={() => playWithId(item._id, id)}
              key={item._id || index}
              className='grid grid-cols-4 sm:grid-cols-5 gap-2 p-2.5 items-center rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer group/row transition-all relative'
            >
              {/* Index & Title */}
              <div className='flex items-center gap-4 overflow-hidden col-span-2'>
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
                <img className='w-10 h-10 object-cover rounded shadow' src={item.image} alt={item.title} />
                <div className='truncate'>
                  <p className={`font-semibold text-sm truncate transition-colors ${isCurrentSong ? 'text-[#1db954]' : 'text-gray-900 dark:text-white group-hover/row:underline'}`}>
                    {item.name}
                  </p>
                  <p className={`text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 transition-colors ${isCurrentSong ? 'text-[#1db954]/80' : ''}`}>MyMusic Artist</p>
                </div>
              </div>

              {/* Album Title */}
              <p className={`col-span-1 text-sm text-gray-600 dark:text-gray-300 truncate transition-colors ${isCurrentSong ? 'text-[#1db954]/75' : ''}`}>{id === 'mix' ? (item.albumId ? (typeof item.albumId === 'object' ? (item.albumId.title || item.albumId.name || 'Unknown Album') : item.albumId) : "Single") : albumData.name}</p>

              {/* Duration */}
              <p className='col-span-1 text-sm text-gray-500 dark:text-gray-400 text-center hidden sm:block font-mono'>{item.duration}</p>

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
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer bg-transparent border-none outline-none ${
                    isLiked ? 'opacity-100 text-[#1db954]' : 'opacity-40 lg:opacity-0 lg:group-hover/row:opacity-60 lg:hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#ffffff15] dark:hover:bg-gray-200/60 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-black transition-all cursor-pointer bg-transparent border-none dropdown-trigger ${activeDropdownId === item._id ? 'opacity-100' : 'opacity-40 lg:opacity-0 lg:group-hover/row:opacity-100'}`}
                  title="More options"
                >
                  •••
                </button>

                {/* Floating Action Menu */}
                {activeDropdownId === item._id && (() => {
                  const isNearBottom = index >= 2 && index >= albumTracks.length - 2;
                  return (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute right-4 z-50 bg-[#181818] dark:bg-white border border-[#282828] dark:border-gray-200 py-1.5 rounded-lg shadow-2xl w-56 font-bold text-xs text-gray-200 dark:text-gray-800 animate-fade-in dropdown-menu ${
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
          )
        })}
      </div>
    </div>
  ) : (
    <div className='min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center select-none animate-fadeIn'>
      <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[10px] font-bold text-gray-[#a7a7a7] tracking-widest uppercase animate-pulse">Loading Album...</p>
    </div>
  )
}

export default DisplayAlbum
