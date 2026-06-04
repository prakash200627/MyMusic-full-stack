import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'
import { PlayerContext } from '../context/PlayerContext'

const DisplayHome = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const username = localStorage.getItem('username') || 'User';

  const { 
    songsData, 
    albumsData, 
    searchTerm, 
    getSongsData, 
    getAlbumsData, 
    isLoadingSongs, 
    playWithId, 
    currentContextId,
    activeCategory,
    setActiveCategory,
    track,
    likedSongs,
    likeSong,
    unlikeSong,
    playStatus
  } = useContext(PlayerContext);

  useEffect(() => {
    getSongsData();
    getAlbumsData();
  }, []);

  const filteredAlbums = albumsData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSongs = songsData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.album && item.album.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.language && item.language.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoadingSongs) {
    return (
      <div className='animate-pulse pr-1'>
        {/* Mobile top bar for skeleton */}
        {isMobile && (
          <div className="flex items-center gap-3.5 mb-5 mt-2">
            <div className="w-9 h-9 rounded-full bg-gray-250 dark:bg-[#282828] flex-shrink-0" />
            <div className="h-6 bg-gray-200 dark:bg-[#282828] rounded w-24" />
          </div>
        )}

        {/* Loading Category Toggles Skeleton */}
        <div className='flex items-center gap-2 mb-6 mt-4'>
          <div className='w-16 h-8 bg-gray-200 dark:bg-[#282828] rounded-full'></div>
          <div className='w-16 h-8 bg-gray-200 dark:bg-[#282828] rounded-full'></div>
          <div className='w-16 h-8 bg-gray-200 dark:bg-[#282828] rounded-full'></div>
        </div>

        <div className='mb-4'>
          <div className='h-7 bg-gray-200 dark:bg-[#282828] rounded w-48 mb-5'></div>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='w-full min-w-0 p-2 px-3 rounded bg-gray-100/50 dark:bg-[#181818]/50 border border-gray-100 dark:border-transparent'>
                <div className='aspect-square w-full bg-gray-200 dark:bg-[#282828] rounded mb-3'></div>
                <div className='h-4 bg-gray-200 dark:bg-[#282828] rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 dark:bg-[#282828] rounded w-1/2'></div>
              </div>
            ))}
          </div>
        </div>
        <div className='mb-4 mt-8'>
          <div className='h-7 bg-gray-200 dark:bg-[#282828] rounded w-48 mb-5'></div>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='w-full min-w-0 p-2 px-3 rounded bg-gray-100/50 dark:bg-[#181818]/50 border border-gray-100 dark:border-transparent'>
                <div className='aspect-square w-full bg-gray-200 dark:bg-[#282828] rounded mb-3'></div>
                <div className='h-4 bg-gray-200 dark:bg-[#282828] rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-gray-200 dark:bg-[#282828] rounded w-1/2'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Debounced Search Results in a clean 4-in-a-row compact grid
  if (searchTerm.trim() !== '') {
    const showAlbums = activeCategory === 'all' || activeCategory === 'albums';
    const showSongs = activeCategory === 'all' || activeCategory === 'songs';

    return (
      <div className='animate-fadeIn select-none pr-1'>
        {/* Category Toggles for Search */}
        {isMobile ? (
          <div className="flex items-center gap-3 mb-6 mt-2">
            <div 
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-purple-500 text-black flex items-center justify-center font-bold text-sm capitalize cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
            >
              {username.charAt(0)}
            </div>
            <div className='flex items-center gap-2 select-none text-xs font-bold'>
              <p 
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                  activeCategory === 'all' 
                    ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                    : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
                }`}
              >
                All
              </p>
              <p 
                onClick={() => setActiveCategory('songs')}
                className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                  activeCategory === 'songs' 
                    ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                    : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
                }`}
              >
                Songs
              </p>
              <p 
                onClick={() => setActiveCategory('albums')}
                className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                  activeCategory === 'albums' 
                    ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                    : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
                }`}
              >
                Albums
              </p>
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-2 mb-6 select-none text-xs font-bold'>
            <p 
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                activeCategory === 'all' 
                  ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
              }`}
            >
              All
            </p>
            <p 
              onClick={() => setActiveCategory('songs')}
              className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                activeCategory === 'songs' 
                  ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
              }`}
            >
              Songs
            </p>
            <p 
              onClick={() => setActiveCategory('albums')}
              className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                activeCategory === 'albums' 
                  ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
              }`}
            >
              Albums
            </p>
          </div>
        )}

        <h2 className='text-xl font-bold mb-6 text-gray-900 dark:text-white'>Search results for "{searchTerm}"</h2>

        {showAlbums && filteredAlbums.length > 0 && (
          <div className='mb-8'>
            <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-1.5'>Matching Albums</h3>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4'>
              {filteredAlbums.map((item, index) => (
                <AlbumItem key={item._id || index} name={item.name} desc={item.desc} id={item._id} image={item.image}/>
              ))}
            </div>
          </div>
        )}

        {showSongs && filteredSongs.length > 0 && (
          <div className='mb-8'>
            <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-zinc-800 pb-1.5'>Matching Songs</h3>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4'>
              {filteredSongs.map((item, index) => (
                <SongItem key={item._id || index} name={item.name} desc={item.desc} id={item._id} image={item.image}/>
              ))}
            </div>
          </div>
        )}

        {((showAlbums && filteredAlbums.length === 0) || (!showAlbums)) && 
         ((showSongs && filteredSongs.length === 0) || (!showSongs)) && (
          <div className='text-center py-20 text-gray-400'>
            <p className='text-xl font-semibold'>No matches found under "{activeCategory}" category</p>
            <p className='text-sm mt-2'>Please make sure your words are spelled correctly or try different keywords.</p>
          </div>
        )}
      </div>
    );
  }

  // Render normal view filtered by active category pill
  const renderAlbums = activeCategory === 'all' || activeCategory === 'albums';
  const renderSongs = activeCategory === 'all' || activeCategory === 'songs';

  return (
    <div className='animate-fadeIn select-none pr-1'>
      {/* Category Toggles for Normal View */}
      {isMobile ? (
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div 
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-purple-500 text-black flex items-center justify-center font-bold text-sm capitalize cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0"
          >
            {username.charAt(0)}
          </div>
          <div className='flex items-center gap-2 select-none text-xs font-bold'>
            <p 
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                activeCategory === 'all' 
                  ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
              }`}
            >
              All
            </p>
            <p 
              onClick={() => setActiveCategory('songs')}
              className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                activeCategory === 'songs' 
                  ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
              }`}
            >
              Songs
            </p>
            <p 
              onClick={() => setActiveCategory('albums')}
              className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
                activeCategory === 'albums' 
                  ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
              }`}
            >
              Albums
            </p>
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-2 mb-6 select-none text-xs font-bold'>
          <p 
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
              activeCategory === 'all' 
                ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
            }`}
          >
            All
          </p>
          <p 
            onClick={() => setActiveCategory('songs')}
            className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
              activeCategory === 'songs' 
                ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
            }`}
          >
            Songs
          </p>
          <p 
            onClick={() => setActiveCategory('albums')}
            className={`px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm ${
              activeCategory === 'albums' 
                ? 'bg-gray-850 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95' 
                : 'bg-gray-200 dark:bg-[#242424] text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-[#2a2a2a] hover:scale-105 active:scale-95 border border-transparent dark:border-[#383838]'
            }`}
          >
            Albums
          </p>
        </div>
      )}

      {filteredAlbums.length === 0 && filteredSongs.length === 0 ? (
        <div className='text-center py-20 text-gray-400 select-none'>
          <p className='text-xl font-semibold'>No tracks present in database</p>
          <p className='text-sm mt-2'>Seeding may be incomplete. Please check connection.</p>
        </div>
      ) : (
        <div className='animate-fadeIn select-none'>
          {/* 1. Albums Section */}
          {renderAlbums && filteredAlbums.length > 0 && (() => {
            const mainAlbum = {
              _id: 'mix',
              name: 'Main Album',
              desc: 'All songs from all albums',
              image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'
            };
            const displayedAlbums = [mainAlbum, ...filteredAlbums];

            return (
              <div className='mb-8'>
                <h1 className='my-4 font-bold text-2xl text-gray-900 dark:text-white'>Featured Charts</h1>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 pb-2'>
                  {displayedAlbums.map((item, index) => (
                    <AlbumItem key={item._id || index} name={item.name} desc={item.desc} id={item._id} image={item.image}/>
                  ))}
                </div>
              </div>
            );
          })()}


          {/* 3. Global Compact Songs List (Lighter, tight, and highly legible) */}
          {renderSongs && filteredSongs.length > 0 && (
            <div className='mb-8 mt-1'>
              <h1 className='my-2 font-bold text-2xl border-b border-gray-200 dark:border-zinc-800/80 pb-2 text-gray-900 dark:text-white'>All Integrated Songs</h1>
              <div className='flex flex-col gap-0.5 md:max-h-[380px] md:overflow-y-auto max-h-none overflow-y-visible pr-1.5 custom-scrollbar bg-[#fbfbfb] dark:bg-[#181818] px-2.5 pb-2.5 pt-0 rounded-xl border border-gray-200/80 dark:border-zinc-800/40 shadow-sm'>
                <div className='grid grid-cols-[30px_1fr_40px_50px] md:grid-cols-[45px_2.5fr_1.5fr_1.5fr_40px_60px] items-center gap-4 px-3 pt-2.5 pb-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-zinc-800 md:sticky md:top-0 bg-[#fbfbfb] dark:bg-[#181818] z-10 uppercase tracking-wider'>
                  <p>#</p>
                  <p>Title</p>
                  <p className='hidden md:block'>Artist</p>
                  <p className='hidden md:block'>Album</p>
                  <p></p>
                  <p className='text-right'>Duration</p>
                </div>
                {filteredSongs.map((item, index) => {
                  const isCurrent = track && String(track._id) === String(item._id) && String(currentContextId) === 'home';
                  const isLiked = likedSongs && likedSongs.some(s => String(s._id) === String(item._id));

                  return (
                    <div 
                      key={item._id || index}
                      onClick={() => playWithId(item._id, 'home')}
                      className='grid grid-cols-[30px_1fr_40px_50px] md:grid-cols-[45px_2.5fr_1.5fr_1.5fr_40px_60px] items-center gap-4 px-3 py-1.5 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] even:bg-gray-100/30 dark:even:bg-white/[0.01] transition-all cursor-pointer group text-xs border-l-2 border-transparent hover:border-[#1db954]'
                    >
                      <div className='text-gray-400 group-hover:text-[#1db954] transition-colors font-medium pl-1 text-[10px] md:text-xs relative flex items-center justify-center w-6 h-6'>
                        {isCurrent ? (
                          <>
                            <span className="group-hover:hidden flex items-center justify-center">
                              {playStatus ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-[#1db954] animate-pulse">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                </svg>
                              ) : (
                                <span className="text-[#1db954]">{index + 1}</span>
                              )}
                            </span>
                            <span className="hidden group-hover:flex items-center justify-center text-[#1db954]">
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
                            <span className="group-hover:hidden">{index + 1}</span>
                            <span className="hidden group-hover:flex items-center justify-center text-gray-900 dark:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </>
                        )}
                      </div>
                      <div className='flex items-center gap-3 min-w-0'>
                        <img className='w-8 h-8 object-cover rounded shadow-sm border border-gray-200 dark:border-zinc-850 flex-shrink-0' src={item.image} alt="" />
                        <div className="truncate min-w-0 flex-1">
                          <p className={`font-bold truncate transition-colors ${
                            isCurrent 
                              ? 'text-[#1db954]' 
                              : 'text-gray-900 dark:text-gray-200 group-hover:underline'
                          }`}>{item.name}</p>
                          <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate md:hidden mt-0.5 font-semibold'>
                            {item.artistName || item.artist || "Unknown Artist"}
                          </p>
                        </div>
                      </div>
                      <p className={`hidden md:block text-gray-600 dark:text-gray-400 truncate font-semibold transition-colors ${isCurrent ? 'text-[#1db954]/80' : ''}`}>{item.artistName || item.artist || "Unknown Artist"}</p>
                      <p className={`hidden md:block text-gray-500 dark:text-gray-400 truncate transition-colors ${isCurrent ? 'text-[#1db954]/70' : ''}`}>{item.album || "Single"}</p>
                      
                      {/* Heart Like Button column */}
                      <div onClick={(e) => e.stopPropagation()}>
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
                            isLiked ? 'opacity-100 text-[#1db954]' : 'opacity-40 md:opacity-0 md:group-hover:opacity-60 md:hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
                          }`}
                          title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
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
                      </div>

                      <p className='text-gray-500 dark:text-gray-400 text-right font-mono text-[10px] md:text-xs'>{item.duration}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DisplayHome
