import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'

// Import dnd-kit packages for premium drag-and-drop sorting in play queue
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sub-component for individual draggable queue rows
const SortableQueueItem = ({ item, removeFromQueue, playWithId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.queueId });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition || undefined,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 'auto',
    backgroundColor: isDragging ? 'rgba(29, 185, 84, 0.15)' : undefined
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className='flex items-center justify-between p-2.5 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group/item relative select-none border border-transparent'
    >
      <div className='flex items-center gap-3 overflow-hidden flex-1'>
        {/* Grab Handle for sorting */}
        <span 
          {...attributes} 
          {...listeners} 
          className='text-gray-400 hover:text-black dark:hover:text-white cursor-grab p-1.5 flex-shrink-0 text-sm font-semibold select-none'
          title="Hold and drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          ⣿
        </span>
        <img className='w-10 h-10 object-cover rounded shadow-sm border border-gray-200 dark:border-zinc-800' src={item.image} alt="" />
        <div onClick={() => playWithId(item._id)} className='truncate flex-1 min-w-0 pl-1.5'>
          <p className='text-xs font-bold text-gray-950 dark:text-gray-200 group-hover/item:text-[#1db954] dark:group-hover/item:text-[#1db954] truncate transition-colors'>{item.name || item.title}</p>
          <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5'>{item.album || 'Single'}</p>
        </div>
      </div>
      <div className='flex items-center gap-2 pl-2'>
        <span className='text-[10px] text-gray-500 dark:text-gray-400 font-mono'>{item.duration}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); removeFromQueue(item.queueId); }}
          className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-600/20 text-red-500 hover:text-red-400 transition-opacity cursor-pointer text-xs font-bold border-none bg-transparent'
          title="Remove from queue"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const DisplayQueue = () => {
  const navigate = useNavigate();
  const { 
    track, 
    playWithId, 
    customQueue,
    setCustomQueue,
    removeFromQueue,
    getUpcomingQueue,
    getUpcomingAutoTracks,
    isShuffle,
    playStatus
  } = useContext(PlayerContext);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // avoids conflicts with standard clicks
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = customQueue.findIndex(s => s.queueId === active.id);
    const newIndex = customQueue.findIndex(s => s.queueId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setCustomQueue(arrayMove(customQueue, oldIndex, newIndex));
    }
  };

  if (!track) {
    return (
      <div className='flex flex-col h-full bg-white dark:bg-[#121212] text-gray-900 dark:text-white px-5 pt-4 pb-24 overflow-y-auto animate-fadeIn select-none justify-center items-center text-center'>
        <p className='text-gray-400 text-sm font-semibold'>No track is currently playing</p>
        <button 
          onClick={() => navigate('/')}
          className='mt-4 px-6 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs rounded-full uppercase tracking-wider transition-all cursor-pointer border-none'
        >
          Explore Music
        </button>
      </div>
    );
  }

  const upcomingQueue = getUpcomingQueue();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212] text-gray-900 dark:text-white px-5 pt-4 select-none pb-24 overflow-y-auto animate-fadeIn">
      
      {/* Header */}
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2.5'>
          <button 
            onClick={() => navigate(-1)}
            className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-[#242424] hover:bg-gray-300 dark:hover:bg-[#2e2e2e] text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-all cursor-pointer text-xs font-bold border-none'
            title="Go Back"
          >
            ←
          </button>
          <h1 className='text-2xl font-black tracking-tight'>Play Queue</h1>
        </div>
      </div>

      {/* Currently Playing Track */}
      <div className='flex flex-col gap-2.5 mb-6'>
        <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>Now Playing</p>
        <div className='flex items-center gap-3 p-3 rounded-lg bg-gray-150 dark:bg-[#1a1a1a] border border-[#1db954]/25 shadow-sm'>
          <img className='w-14 h-14 object-cover rounded shadow-md border border-[#1db954]/20' src={track.image} alt="" />
          <div className='truncate flex-1'>
            <p className='text-sm font-bold text-[#1db954] truncate'>{track.title || track.name}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5'>{track.artistName || track.artist || "MyMusic Artist"}</p>
          </div>
          {playStatus && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#1db954] animate-pulse flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          )}
        </div>
      </div>

      {/* Scrollable Next Up Queue */}
      <div className='flex flex-col gap-6'>
        
        {/* A. Manually Added custom queue */}
        {customQueue.length > 0 && (
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between pl-1 pr-1'>
              <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>Next Up (Manually Added)</p>
              <button 
                onClick={() => setCustomQueue([])}
                className='text-xs font-bold text-red-500 hover:text-red-400 hover:underline cursor-pointer bg-transparent border-none'
                title="Clear manually added queue"
              >
                Clear queue
              </button>
            </div>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={customQueue.map(s => s.queueId)} 
                strategy={verticalListSortingStrategy}
              >
                <div className='flex flex-col gap-1.5'>
                  {customQueue.map((item) => (
                    <SortableQueueItem 
                      key={`sortable-${item.queueId}`}
                      item={item}
                      removeFromQueue={removeFromQueue}
                      playWithId={playWithId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {(() => {
          const remainingSequence = getUpcomingAutoTracks();

          if (remainingSequence.length === 0) {
            return (
              <div className='flex flex-col gap-2'>
                <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1'>Next Up</p>
                <p className='text-xs text-gray-550 dark:text-gray-400 italic pl-1'>End of queue source</p>
              </div>
            )
          }

          return (
            <div className='flex flex-col gap-2'>
              <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1 truncate'>
                {isShuffle ? 'Next from Shuffle Pool' : (track.album ? `Next from Album: ${track.album}` : 'Next from catalog')}
              </p>
              <div className='flex flex-col gap-1.5'>
                {remainingSequence.slice(0, 30).map((item, index) => (
                  <div 
                    onClick={() => playWithId(item._id)} 
                    key={`auto-${item._id}-${index}`} 
                    className='flex items-center justify-between p-2.5 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group/item border border-transparent'
                    title={`Play ${item.name || item.title}`}
                  >
                    <div className='flex items-center gap-3 overflow-hidden flex-1'>
                      <img className='w-10 h-10 object-cover rounded shadow-sm border border-gray-200 dark:border-zinc-800' src={item.image} alt="" />
                      <div className='truncate flex-1'>
                        <p className='text-xs font-bold text-gray-850 dark:text-gray-200 group-hover/item:text-[#1db954] truncate transition-colors'>{item.name || item.title}</p>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5'>{item.album || 'Single'}</p>
                      </div>
                    </div>
                    <span className='text-[10px] text-gray-500 dark:text-gray-400 font-mono pl-2'>{item.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  );
};

export default DisplayQueue;
