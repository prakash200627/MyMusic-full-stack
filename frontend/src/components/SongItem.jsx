import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const SongItem = ({name, image, desc, id}) => {

  const {playWithId}=useContext(PlayerContext)

  return (
    <div onClick={()=>playWithId(id, 'home')} className='w-full min-w-0 p-2 px-3 rounded cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors group select-none'>
      <div className='aspect-square overflow-hidden rounded mb-2'>
        <img className='rounded w-full h-full object-cover group-hover:scale-105 transition-all duration-350' src={image} alt={name} />
      </div>
      <p className='font-bold text-gray-900 dark:text-white text-sm truncate mb-0.5'>{name}</p>
      <p className='text-gray-500 dark:text-slate-300 text-xs truncate font-medium'>{desc}</p>
    </div>
  )
}

export default SongItem
