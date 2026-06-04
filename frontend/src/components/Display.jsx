import React, { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import DisplayHome from './DisplayHome'
import DisplayAlbum from './DisplayAlbum'
import DisplayPlaylist from './DisplayPlaylist'
import DisplayProfile from './DisplayProfile'
import DisplaySearch from './DisplaySearch'
import DisplayLibrary from './DisplayLibrary'
import DisplayQueue from './DisplayQueue'
import { PlayerContext } from '../context/PlayerContext'

const Display = () => {
  const { albumsData } = useContext(PlayerContext)

  return (
    <div className='flex-1 min-w-0 m-0 md:m-2 px-0 md:px-6 pt-0 md:pt-4 rounded-none md:rounded bg-white dark:bg-[#121212] text-gray-900 dark:text-white overflow-auto md:ml-0 transition-all duration-300 border-none md:border border-gray-200 dark:border-transparent'>
      {albumsData.length === 0 ? (
        <div className='text-center py-10 text-gray-550 dark:text-gray-400'>Loading MyMusic Catalog...</div>
      ) : (
        <Routes>
          <Route path='/' element={<DisplayHome />} />
          <Route path='/album/:id' element={<DisplayAlbum />} />
          <Route path='/playlist/:id' element={<DisplayPlaylist />} />
          <Route path='/profile' element={<DisplayProfile />} />
          <Route path='/search' element={<DisplaySearch />} />
          <Route path='/library' element={<DisplayLibrary />} />
          <Route path='/queue' element={<DisplayQueue />} />
        </Routes>
      )}
    </div>
  )
}

export default Display
