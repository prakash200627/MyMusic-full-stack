import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'

const AlbumItem = ({image, name, desc, id}) => {
    const navigate = useNavigate();
    const { playAlbumWithId } = useContext(PlayerContext);

    return (
        <div className='w-full min-w-0 p-2 px-3 rounded cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all duration-300 relative group select-none'>
            <div className='relative overflow-hidden rounded shadow-md aspect-square mb-2.5'>
                <img 
                    onClick={() => navigate(`/album/${id}`)} 
                    className='rounded w-full h-full object-cover group-hover:scale-105 transition-all duration-500' 
                    src={image} 
                    alt={name} 
                />
                
                {/* Premium Floating green circular play button on hover */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // prevent navigation
                        playAlbumWithId(id);
                    }}
                    className='absolute bottom-3 right-3 w-11 h-11 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer z-10 border-none'
                    title={`Play ${name}`}
                >
                    <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="black" className="ml-0.5">
                        <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
                    </svg>
                </button>
            </div>
            <div onClick={() => navigate(`/album/${id}`)}>
                <p className='font-bold text-gray-900 dark:text-white text-sm truncate mb-0.5'>{name}</p>
                <p className='text-gray-500 dark:text-slate-300 text-xs truncate font-medium'>{desc}</p>
            </div>
        </div>
    )
}

export default AlbumItem
