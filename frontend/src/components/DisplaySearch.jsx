import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'
import AlbumItem from './AlbumItem'
import SongItem from './SongItem'

const DisplaySearch = () => {
  const navigate = useNavigate()
  const {
    songsData,
    albumsData,
    searchTerm,
    setSearchTerm,
    track
  } = useContext(PlayerContext)

  const username = localStorage.getItem('username') || 'User';

  const filteredAlbums = albumsData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSongs = songsData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.artist && item.artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.album && item.album.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Colorful premium Spotify-like gradient cards for browsing categories
  const categories = [
    { title: 'Podcasts', gradient: 'from-[#e1306c] to-[#c13584]' },
    { title: 'New Releases', gradient: 'from-[#1db954] to-[#1aa34a]' },
    { title: 'Pop', gradient: 'from-[#509bf5] to-[#2c77d2]' },
    { title: 'Hip-Hop', gradient: 'from-[#ba5d07] to-[#8c4302]' },
    { title: 'Telugu', gradient: 'from-[#e8115b] to-[#b70c44]' },
    { title: 'Hindi', gradient: 'from-[#a567fb] to-[#7f4ccb]' },
    { title: 'Tamil', gradient: 'from-[#1e3264] to-[#121f3f]' },
    { title: 'Rock', gradient: 'from-[#777777] to-[#444444]' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#121212] text-white px-5 pt-4 select-none pb-24 overflow-y-auto animate-fadeIn">
      
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <div 
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-purple-500 text-black flex items-center justify-center font-bold text-sm capitalize cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            {username.charAt(0)}
          </div>
          <h1 className="text-2xl font-black tracking-tight">Search</h1>
        </div>
      </div>

      {/* Persistent anchored input box */}
      <div className="relative flex items-center mb-6">
        <span className="absolute left-4 text-gray-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.8" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
        </span>
        <input 
          type="text" 
          placeholder="What do you want to listen to?" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white text-black pl-12 pr-10 py-3 rounded-md text-sm font-bold focus:outline-none placeholder-gray-500 transition-all shadow-md"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="absolute right-4 text-gray-500 hover:text-black font-extrabold text-sm bg-transparent border-none outline-none cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dynamic Screen Content */}
      {searchTerm.trim() === '' ? (
        /* Empty Query Category Browse Grid */
        <div>
          <h2 className="text-base font-bold mb-4">Browse all</h2>
          <div className="grid grid-cols-2 gap-3.5">
            {categories.map((cat, i) => (
              <div 
                key={i}
                className={`bg-gradient-to-br ${cat.gradient} h-28 rounded-lg p-4 relative overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] active:scale-95 transition-all`}
              >
                <span className="font-extrabold text-sm block max-w-[70%] leading-tight tracking-tight">{cat.title}</span>
                {/* Simulated floating diagonal cover miniature */}
                <div className="absolute -right-4 -bottom-2 w-14 h-14 bg-white/10 dark:bg-black/10 rounded rotate-25 shadow-lg border border-white/20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Query Matching Content */
        <div className="flex flex-col gap-6">
          {filteredAlbums.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Albums</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
                {filteredAlbums.map((item, index) => (
                  <AlbumItem key={item._id || index} name={item.name} desc={item.desc} id={item._id} image={item.image}/>
                ))}
              </div>
            </div>
          )}

          {filteredSongs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Songs</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
                {filteredSongs.map((item, index) => (
                  <SongItem key={item._id || index} name={item.name} desc={item.desc} id={item._id} image={item.image}/>
                ))}
              </div>
            </div>
          )}

          {filteredAlbums.length === 0 && filteredSongs.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="font-bold">No results found for "{searchTerm}"</p>
              <p className="text-xs mt-1">Please try different keywords.</p>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default DisplaySearch
