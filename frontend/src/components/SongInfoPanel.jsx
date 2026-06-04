import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';

const SongInfoPanel = () => {
    const { track } = useContext(PlayerContext);

    if (!track) {
        return (
            <div className='w-full h-full bg-gray-100 dark:bg-[#121212] text-gray-500 p-6 border-l border-gray-200 dark:border-[#282828] flex items-center justify-center select-none font-sans'>
                <p className='text-sm text-gray-500'>Select a track to view song information.</p>
            </div>
        );
    }

    return (
        <div className='w-full h-full bg-gray-50 dark:bg-[#181818] text-gray-900 dark:text-white p-6 overflow-y-auto border-l border-gray-200 dark:border-[#282828] select-none font-sans transition-all duration-300'>
            <h3 className='text-xl font-bold mb-6 tracking-tight flex items-center gap-2'>
                <span>🎵</span> Song Information
            </h3>

            {/* Song Cover Thumbnail */}
            <div className='flex flex-col items-center mb-6'>
                <img 
                    className='w-40 h-40 object-cover rounded shadow-lg border border-gray-300 dark:border-[#282828] mb-4' 
                    src={track.image} 
                    alt={track.title} 
                />
                <h4 className='text-lg font-bold text-center line-clamp-1'>{track.title}</h4>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{track.artistName || "MyMusic Artist"}</p>
            </div>

            <hr className='border-gray-200 dark:border-[#282828] mb-6' />

            {/* Metadata Fields Layout */}
            <div className='flex flex-col gap-4 text-sm'>
                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Movie / Source</span>
                    <span className='font-medium text-right text-gray-800 dark:text-white'>{track.movie || "N/A"}</span>
                </div>

                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Composer</span>
                    <span className='font-medium text-right text-gray-800 dark:text-white'>{track.composer || "N/A"}</span>
                </div>

                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Music Director</span>
                    <span className='font-medium text-right text-gray-800 dark:text-white'>{track.musicDirector || "N/A"}</span>
                </div>

                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Singer</span>
                    <span className='font-medium text-right text-gray-800 dark:text-white'>{track.singer || "N/A"}</span>
                </div>

                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Genre</span>
                    <span className='font-medium text-right text-gray-800 dark:text-white'>{track.genre || "N/A"}</span>
                </div>

                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Release Year</span>
                    <span className='font-medium text-right text-gray-800 dark:text-white'>{track.releaseYear || "N/A"}</span>
                </div>

                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Album</span>
                    <span className='font-medium text-right text-gray-800 dark:text-white'>{track.album || "Single"}</span>
                </div>

                <div className='flex justify-between py-1 border-b border-gray-100 dark:border-[#282828]/40'>
                    <span className='text-gray-500 dark:text-gray-400 font-semibold'>Duration</span>
                    <span className='font-mono font-medium text-right text-gray-800 dark:text-white'>{track.duration}</span>
                </div>
            </div>
        </div>
    );
};

export default SongInfoPanel;
