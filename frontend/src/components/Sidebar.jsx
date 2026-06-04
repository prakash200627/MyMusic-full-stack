import React, { useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'
import { assets } from '../assets/assets'
import axios from 'axios'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const { 
    setIsSearchActive, 
    setSearchTerm, 
    albumsData,
    savedAlbumsData, 
    playlistsData,
    createPlaylist,
    track, 
    playStatus, 
    play, 
    pause, 
    playWithId, 
    currentContextId,
    songsData, 
    getAlbumsData,
    customAlert,
    customConfirm,
    customPrompt,
    sidebarWidth,
    setSidebarWidth,
    activeCategory,
    likedSongs
  } = useContext(PlayerContext)

  // Local sidebar filter: 'all' | 'playlists' | 'albums'
  const [sidebarFilter, setSidebarFilter] = useState('all')

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

  const handleHomeClick = () => {
    setIsSearchActive(false);
    setSearchTerm('');
    navigate('/');
  }

  const handleSidebarPlayToggle = (e, albumItem) => {
    e.stopPropagation();
    // Filter songs belonging to this album by relational ID or title
    const albumTracks = albumItem._id === 'mix'
      ? (songsData || [])
      : (songsData || []).filter(s => {
        const songAlbumId = s.albumId && (s.albumId._id || s.albumId);
        return String(songAlbumId) === String(albumItem._id) ||
               String(s.album).toLowerCase() === String(albumItem.name || albumItem.title).toLowerCase();
      });
    if (albumTracks.length === 0) return;
    
    const isCurrentTrackInAlbum = albumTracks.some(s => String(s._id) === String(track?._id)) && String(currentContextId) === String(albumItem._id);
    if (isCurrentTrackInAlbum) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(albumTracks[0]._id, albumItem._id);
    }
  }

  const handlePlaylistPlayToggle = (e, playlistItem) => {
    e.stopPropagation();
    let playlistTracks = [];
    let contextId = null;

    if (playlistItem === 'likes') {
      playlistTracks = likedSongs || [];
      contextId = 'likes';
    } else {
      playlistTracks = (playlistItem.songs || []).filter(s => s !== null && s !== undefined);
      contextId = playlistItem._id || playlistItem.id;
    }

    if (playlistTracks.length === 0) return;

    const isCurrentTrackInPlaylist = playlistTracks.some(s => String(s._id) === String(track?._id)) && String(currentContextId) === String(contextId);
    if (isCurrentTrackInPlaylist) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(playlistTracks[0]._id, contextId);
    }
  }

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    let newWidth = e.clientX;
    if (newWidth < 120) {
      newWidth = 72;
    } else {
      newWidth = Math.max(200, Math.min(450, newWidth));
    }
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 0) return;
    const clientX = e.touches[0].clientX;
    let newWidth = clientX;
    if (newWidth < 120) {
      newWidth = 72;
    } else {
      newWidth = Math.max(200, Math.min(450, newWidth));
    }
    setSidebarWidth(newWidth);
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const isCollapsed = sidebarWidth <= 120;

  const toggleCollapse = () => {
    if (isCollapsed) {
      const lastWidth = Number(localStorage.getItem("lastExpandedSidebarWidth")) || 300;
      setSidebarWidth(lastWidth);
    } else {
      localStorage.setItem("lastExpandedSidebarWidth", sidebarWidth);
      setSidebarWidth(72);
    }
  };

  const renderPlaylistCover = (playlistTracks, sizeClass = "w-10 h-10") => {
    if (playlistTracks && playlistTracks.length >= 4) {
      return (
        <div className={`relative ${sizeClass} flex-shrink-0 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 border border-gray-300 dark:border-zinc-800/80 shadow-sm`}>
          <img className="w-full h-full object-cover" src={playlistTracks[0].image || playlistTracks[0].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[1].image || playlistTracks[1].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[2].image || playlistTracks[2].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[3].image || playlistTracks[3].cover} alt="" />
        </div>
      );
    }
    if (playlistTracks && playlistTracks.length >= 1) {
      return (
        <div className={`relative ${sizeClass} flex-shrink-0 rounded-lg overflow-hidden border border-gray-300 dark:border-zinc-800/80 shadow-sm`}>
          <img className="w-full h-full object-cover" src={playlistTracks[0].image || playlistTracks[0].cover} alt="" />
        </div>
      );
    }
    return (
      <div className={`relative ${sizeClass} flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-800 dark:to-zinc-950 rounded-lg flex items-center justify-center border border-gray-300 dark:border-zinc-800/80 shadow-sm overflow-hidden`}>
        <img className='w-full h-full object-cover' src={assets.mymusic_logo} alt="" />
      </div>
    );
  };

  // Filter lists based on sidebar selector
  const showPlaylists = sidebarFilter === 'all' || sidebarFilter === 'playlists';
  const showAlbums = sidebarFilter === 'all' || sidebarFilter === 'albums';

  return (
    <div 
      className='h-full p-2 hidden md:flex flex-col gap-2 flex-shrink-0 text-gray-900 dark:text-white select-none relative group/sidebar'
      style={{ width: `${sidebarWidth}px` }}
    >
      
      {/* Resizer Handle */}
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className='absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#1db954]/50 active:bg-[#1db954] z-30 transition-colors'
      />

      {/* Library Container occupies full height */}
      <div className='bg-gray-100 dark:bg-[#121212] h-full rounded-xl flex flex-col overflow-hidden border border-gray-200/80 dark:border-transparent shadow-sm pb-4'>
        {isCollapsed ? (
          /* Collapsed View */
          <div className="flex flex-col items-center py-4 gap-4 h-full">
            {/* Library Toggle Icon with tooltip */}
            <button 
              onClick={toggleCollapse}
              className="p-2 hover:bg-gray-200 dark:hover:bg-[#242424] text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border-none bg-transparent"
              title="Expand Your Library"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M10 8l4 4-4 4" />
              </svg>
            </button>
            
            {/* Circular "+" Create Playlist Shortcut Button */}
            <button 
              onClick={handleCreatePlaylist}
              className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#242424] hover:bg-gray-300 dark:hover:bg-[#2e2e2e] text-gray-900 dark:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border-none shadow-sm"
              title="Create Playlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>

            {/* Divider */}
            <hr className="w-8 border-gray-300 dark:border-zinc-800" />

            {/* Scrollable list of items */}
            <div 
              className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col items-center gap-4 px-2 pb-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Liked Songs Cover */}
              <div 
                onClick={() => navigate('/playlist/likes')}
                className={`w-12 h-12 rounded-lg bg-[#006450] flex items-center justify-center shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all flex-shrink-0 ${
                  location.pathname === '/playlist/likes' ? 'ring-2 ring-blue-500 dark:ring-sky-400' : ''
                }`}
                title={`Liked Songs (${likedSongs ? likedSongs.length : 0} songs)`}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1db954]" fill="currentColor">
                  <path d="M5 3h14a2 2 0 012 2v16l-9-5-9 5V5a2 2 0 012-2z" />
                </svg>
              </div>

              {/* Playlists Covers */}
              {playlistsData.map((item) => {
                const isSelected = location.pathname === `/playlist/${item._id || item.id}`;
                return (
                  <div 
                    onClick={() => navigate(`/playlist/${item._id || item.id}`)}
                    key={item._id || item.id}
                    className={`cursor-pointer hover:scale-105 active:scale-95 transition-all flex-shrink-0 ${
                      isSelected ? 'ring-2 ring-blue-500 dark:ring-sky-400 rounded-lg' : ''
                    }`}
                    title={item.name}
                  >
                    {renderPlaylistCover(item.songs, "w-12 h-12")}
                  </div>
                );
              })}

              {/* Saved Albums Covers */}
              {savedAlbumsData.map((item) => {
                const isSelected = location.pathname === `/album/${item._id || item.id}`;
                return (
                  <div 
                    onClick={() => navigate(`/album/${item._id || item.id}`)}
                    key={item._id || item.id}
                    className={`w-12 h-12 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-800 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all flex-shrink-0 ${
                      isSelected ? 'ring-2 ring-blue-500 dark:ring-sky-400' : ''
                    }`}
                    title={item.name}
                  >
                    <img className='w-full h-full object-cover' src={item.image} alt="" />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Expanded View */
          <>
            {/* Your Library Header with Create Playlist Shortcut */}
            <div className='p-4 pb-2 flex items-center justify-between select-none'>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors" onClick={toggleCollapse} title="Collapse Your Library">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18M14 8l-4 4 4 4" />
                </svg>
                <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">Your Library</span>
              </div>
              
              {/* Pill "+" Create Playlist Shortcut Button */}
              <button 
                onClick={handleCreatePlaylist}
                className='px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-[#242424] dark:hover:bg-[#2e2e2e] text-gray-900 dark:text-white rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 border-none font-bold text-xs shadow-sm'
                title="Create Playlist"
              >
                <span className="text-base leading-none font-light">+</span>
                <span>Create</span>
              </button>
            </div>

            {/* Library Filter Pills (Spotify-style) */}
            <div className='flex gap-2 px-4 mb-4 select-none text-xs font-bold'>
              <button 
                onClick={() => setSidebarFilter(sidebarFilter === 'playlists' ? 'all' : 'playlists')}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-all border border-transparent ${
                  sidebarFilter === 'playlists' 
                    ? 'bg-gray-800 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                    : 'bg-gray-200 dark:bg-[#242424] text-gray-850 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2e2e2e] hover:scale-105 active:scale-95 border-transparent dark:border-[#383838]/40'
                }`}
              >
                Playlists
              </button>
              <button 
                onClick={() => setSidebarFilter(sidebarFilter === 'albums' ? 'all' : 'albums')}
                className={`px-3 py-1.5 rounded-full cursor-pointer transition-all border border-transparent ${
                  sidebarFilter === 'albums' 
                    ? 'bg-gray-800 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                    : 'bg-gray-200 dark:bg-[#242424] text-gray-850 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2e2e2e] hover:scale-105 active:scale-95 border-transparent dark:border-[#383838]/40'
                }`}
              >
                Albums
              </button>
            </div>

            {/* Dynamic Lists Scroll Area */}
            <div className='flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-800/80 flex flex-col gap-6'>
              
              {/* User Playlists Section */}
              {showPlaylists && (
                <div>
                  <div className='flex items-center justify-between pl-2 mb-2 select-none'>
                    <p className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Playlists</p>
                  </div>
                  <div className='flex flex-col gap-1'>
                    {/* Liked Songs Playlist Item */}
                    <div 
                      onClick={() => navigate('/playlist/likes')} 
                      className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#282828] cursor-pointer transition-colors group relative ${
                        location.pathname === '/playlist/likes' ? 'bg-gray-250 dark:bg-[#282828]' : ''
                      }`}
                      title="Open Liked Songs"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#006450] flex items-center justify-center shadow-sm flex-shrink-0 relative group/thumb">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#1db954]" fill="currentColor">
                          <path d="M5 3h14a2 2 0 012 2v16l-9-5-9 5V5a2 2 0 012-2z" />
                        </svg>
                        {/* Play Overlay */}
                        <div 
                          onClick={(e) => handlePlaylistPlayToggle(e, 'likes')}
                          className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 cursor-pointer"
                        >
                          {track && String(currentContextId) === 'likes' && playStatus ? (
                            <svg role="img" height="14" width="14" viewBox="0 0 24 24" fill="white"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                          ) : (
                            <svg role="img" height="14" width="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                          )}
                        </div>
                      </div>
                      <div className='truncate flex-1 min-w-0'>
                        <p className={`text-sm truncate transition-colors ${
                          track && String(currentContextId) === 'likes' ? 'text-[#1db954] font-bold' : location.pathname === '/playlist/likes' ? 'text-blue-500 dark:text-sky-400 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-black group-hover:dark:text-white'
                        }`}>
                          Liked Songs
                          {track && String(currentContextId) === 'likes' && playStatus && (
                            <span className="text-[#1db954] text-xs font-mono ml-1.5 animate-pulse">🔊</span>
                          )}
                        </p>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-semibold'>Playlist • {likedSongs ? likedSongs.length : 0} songs</p>
                      </div>

                      {/* Hover play/pause button on the right */}
                      <div className='flex items-center gap-1.5 ml-auto flex-shrink-0 z-10'>
                        <button 
                          onClick={(e) => handlePlaylistPlayToggle(e, 'likes')}
                          className={`w-7 h-7 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                            track && String(currentContextId) === 'likes' ? 'opacity-100 flex' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden group-hover:flex'
                          } border-none`}
                          title={track && String(currentContextId) === 'likes' && playStatus ? "Pause Playlist" : "Play Playlist"}
                        >
                          {track && String(currentContextId) === 'likes' && playStatus ? (
                            <svg role="img" height="10" width="10" viewBox="0 0 24 24" fill="black"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                          ) : (
                            <svg role="img" height="10" width="10" viewBox="0 0 24 24" fill="black" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* User Created Playlists */}
                    {playlistsData.map((item) => {
                      const isSelected = location.pathname === `/playlist/${item._id || item.id}`;
                      const playlistTracks = item.songs || [];
                      const isCurrentPlaying = track && String(currentContextId) === String(item._id || item.id);
                      const isPlaying = playStatus && isCurrentPlaying;

                      return (
                        <div 
                          onClick={() => navigate(`/playlist/${item._id || item.id}`)} 
                          key={item._id || item.id} 
                          className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#282828] cursor-pointer transition-colors group relative ${
                            isSelected ? 'bg-gray-250 dark:bg-[#282828]' : ''
                          }`}
                          title={`Open ${item.name}`}
                        >
                          <div className="relative group/thumb">
                            {renderPlaylistCover(playlistTracks, "w-10 h-10")}
                            {/* Play Overlay */}
                            <div 
                              onClick={(e) => handlePlaylistPlayToggle(e, item)}
                              className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 cursor-pointer"
                            >
                              {isPlaying ? (
                                <svg role="img" height="14" width="14" viewBox="0 0 24 24" fill="white"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                              ) : (
                                <svg role="img" height="14" width="14" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                              )}
                            </div>
                          </div>

                          {/* Metadata Content */}
                          <div className='truncate flex-1 min-w-0'>
                            <p className={`text-sm truncate transition-colors ${
                              isCurrentPlaying ? 'text-[#1db954] font-bold' : isSelected ? 'text-blue-500 dark:text-sky-400 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-black group-hover:dark:text-white'
                            }`}>
                              {item.name}
                              {isPlaying && (
                                <span className="text-[#1db954] text-xs font-mono ml-1.5 animate-pulse">🔊</span>
                              )}
                            </p>
                            <p className='text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-semibold'>Playlist • {playlistTracks.length} songs</p>
                          </div>

                          {/* Hover play/pause button on the right */}
                          <div className='flex items-center gap-1.5 ml-auto flex-shrink-0 z-10'>
                            <button 
                              onClick={(e) => handlePlaylistPlayToggle(e, item)}
                              className={`w-7 h-7 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                                isCurrentPlaying ? 'opacity-100 flex' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden group-hover:flex'
                              } border-none`}
                              title={isPlaying ? "Pause Playlist" : "Play Playlist"}
                            >
                              {isPlaying ? (
                                <svg role="img" height="10" width="10" viewBox="0 0 24 24" fill="black"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                              ) : (
                                <svg role="img" height="10" width="10" viewBox="0 0 24 24" fill="black" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {playlistsData.length === 0 && (
                    <div className='bg-gray-200/50 dark:bg-[#181818] rounded-xl p-4 flex flex-col gap-2.5 mx-2 my-1 border border-gray-300/30 dark:border-zinc-800/60 shadow-sm mt-2'>
                      <div>
                        <p className='text-xs font-bold text-gray-900 dark:text-white'>Create your first playlist</p>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed font-semibold'>It's easy, we'll help you organize your music collection.</p>
                      </div>
                      <button 
                        onClick={handleCreatePlaylist}
                        className='w-fit bg-gray-950 dark:bg-white text-white dark:text-black font-extrabold text-[10px] py-2 px-3.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer shadow border-none'
                      >
                        Create Playlist
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Saved Albums Section */}
              {showAlbums && (
                <div>
                  <p className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2 mb-2 select-none'>Saved Albums</p>
                  {savedAlbumsData.length === 0 ? (
                    <p className='text-xs text-gray-500 pl-2 italic font-semibold'>No saved albums found</p>
                  ) : (
                    <div className='flex flex-col gap-1'>
                      {savedAlbumsData.map((item) => {
                        const isSelected = location.pathname === `/album/${item._id || item.id}`;
                        const isCurrentAlbum = track && String(currentContextId) === String(item._id);
                        const isPlaying = playStatus && isCurrentAlbum;

                        return (
                          <div 
                            onClick={() => navigate(`/album/${item._id || item.id}`)} 
                            key={item._id || item.id} 
                            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#282828] cursor-pointer transition-colors group relative ${
                              isSelected ? 'bg-gray-250 dark:bg-[#282828]' : ''
                            }`}
                            title={`Open ${item.name}`}
                          >
                            {/* Artwork Container */}
                            <div className='relative w-10 h-10 flex-shrink-0 group/thumb'>
                              <img className='w-full h-full object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-800' src={item.image} alt="" />
                              <div 
                                onClick={(e) => handleSidebarPlayToggle(e, item)}
                                className='absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 cursor-pointer'
                              >
                                {isPlaying ? (
                                  <svg role="img" height="14" width="14" viewBox="0 0 24 24" fill="white"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                                ) : (
                                  <svg role="img" height="14" width="14" viewBox="0 0 24 24" fill="white" className='ml-0.5'><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                                )}
                              </div>
                            </div>

                            {/* Metadata Content */}
                            <div className='truncate flex-1 min-w-0'>
                              <p className={`text-sm truncate transition-colors ${
                                isCurrentAlbum ? 'text-[#1db954] font-bold' : isSelected ? 'text-blue-500 dark:text-sky-400 font-bold' : 'text-gray-800 dark:text-gray-200 group-hover:text-black group-hover:dark:text-white'
                              }`}>
                                {item.name}
                                {isPlaying && (
                                  <span className="text-[#1db954] text-xs font-mono ml-1.5 animate-pulse">🔊</span>
                                )}
                              </p>
                              <p className='text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-semibold'>Saved Album</p>
                            </div>

                            {/* Actions Panel on the right side of the row */}
                            <div className='flex items-center gap-1.5 ml-auto flex-shrink-0 z-10'>
                              {/* Play/Pause toggle directly on the album row */}
                              <button 
                                onClick={(e) => handleSidebarPlayToggle(e, item)}
                                className={`w-7 h-7 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                                  isCurrentAlbum ? 'opacity-100 flex' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden group-hover:flex'
                                } border-none`}
                                title={isPlaying ? "Pause Album" : "Play Album"}
                              >
                                {isPlaying ? (
                                  <svg role="img" height="10" width="10" viewBox="0 0 24 24" fill="black"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                                ) : (
                                  <svg role="img" height="10" width="10" viewBox="0 0 24 24" fill="black" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                                )}
                              </button>

                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Sidebar
