import React, { useContext } from 'react'
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
      className='flex items-center justify-between p-2 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group/item relative select-none border border-transparent'
    >
      <div className='flex items-center gap-2 overflow-hidden flex-1'>
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
        <img className='w-8 h-8 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-800' src={item.image} alt="" />
        <div onClick={() => playWithId(item._id)} className='truncate flex-1 min-w-0 pl-1.5'>
          <p className='text-xs font-bold text-gray-850 dark:text-gray-200 group-hover/item:text-[#1db954] dark:group-hover/item:text-[#1db954] truncate transition-colors'>{item.name || item.title}</p>
          <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5'>{item.album || 'Single'}</p>
        </div>
      </div>
      <div className='flex items-center gap-2 pl-2'>
        <span className='text-[10px] text-gray-500 dark:text-gray-400 font-mono'>{item.duration}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); removeFromQueue(item.queueId); }}
          className='w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-600/20 text-red-500 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer text-xs font-bold border-none bg-transparent'
          title="Remove from queue"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const NowPlayingSidebar = () => {
  const { 
    track, 
    setShowNowPlaying, 
    songsData, 
    playWithId, 
    activeRightSidebarTab, 
    setActiveRightSidebarTab,
    customQueue,
    setCustomQueue,
    removeFromQueue,
    getUpcomingQueue,
    getUpcomingAutoTracks,
    isShuffle,
    playStatus,
    rightSidebarWidth,
    setRightSidebarWidth
  } = useContext(PlayerContext)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // avoids conflicts with standard clicks
      },
    })
  );

  if (!track) return null

  // Resolve computed upcoming queue tracks
  const upcomingQueue = getUpcomingQueue()

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = customQueue.findIndex(s => s.queueId === active.id);
    const newIndex = customQueue.findIndex(s => s.queueId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setCustomQueue(arrayMove(customQueue, oldIndex, newIndex));
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const newWidth = Math.max(250, Math.min(450, window.innerWidth - e.clientX));
    setRightSidebarWidth(newWidth);
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
    const newWidth = Math.max(250, Math.min(450, window.innerWidth - clientX));
    setRightSidebarWidth(newWidth);
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  return (
    <div 
      className='hidden lg:flex bg-gray-50 dark:bg-[#121212] border-l border-gray-200 dark:border-[#282828] h-full flex-col p-4 text-gray-900 dark:text-white overflow-y-auto select-none relative group/right-sidebar scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 flex-shrink-0'
      style={{ width: `${rightSidebarWidth}px` }}
    >
      
      {/* Resizer Handle */}
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className='absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-[#1db954]/50 active:bg-[#1db954] z-30 transition-colors'
      />
      
      {/* 1. Now Playing View (Default) */}
      {activeRightSidebarTab === 'nowPlaying' && (
        <div className='flex flex-col animate-fade-in'>
          {/* Header */}
          <div className='flex items-center justify-between mb-4'>
            <span className='font-bold text-sm text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white cursor-pointer'>Song Information</span>
            <div className='flex items-center gap-1.5'>
              <button 
                onClick={() => setActiveRightSidebarTab('queue')}
                className='px-3 py-1 bg-gray-200 dark:bg-[#242424] hover:bg-gray-300 dark:hover:bg-[#2e2e2e] text-gray-800 dark:text-white text-xs font-bold rounded-full transition-all border border-gray-300 dark:border-gray-700 cursor-pointer'
                title="Go to Play Queue"
              >
                Queue
              </button>
              <button 
                onClick={() => setShowNowPlaying(false)}
                className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#282828] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer font-bold text-sm transition-all border-none bg-transparent'
                title="Close panel"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Album Artwork Cover */}
          <div className='w-full aspect-square overflow-hidden rounded-xl shadow-lg relative group mb-4 border border-gray-200 dark:border-[#282828]'>
            <img 
              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-103' 
              src={track.image} 
              alt={track.title || track.name} 
            />
            <div className='absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </div>

          {/* Song Name & Artist */}
          <div className='flex flex-col mb-4 truncate'>
            <h2 className='text-xl font-bold tracking-tight hover:underline cursor-pointer truncate'>{track.title || track.name}</h2>
            <p className='text-sm text-[#1db954] mt-0.5 truncate font-semibold'>{track.artistName || "MyMusic Artist"}</p>
          </div>

          {/* Song Specs */}
          <div className='bg-gray-100/60 dark:bg-[#181818] rounded-xl p-4 border border-gray-200 dark:border-[#282828] shadow-md flex flex-col gap-2.5 relative overflow-hidden group mb-4 text-xs'>
            <p className='font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1'>Track Specs</p>
            
            <div className='flex justify-between py-1 border-b border-gray-200/60 dark:border-[#282828]/40'>
              <span className='text-gray-500 dark:text-gray-400 font-semibold'>Movie / Source</span>
              <span className='font-medium text-right text-gray-800 dark:text-gray-100'>{track.movie || "N/A"}</span>
            </div>

            <div className='flex justify-between py-1 border-b border-gray-200/60 dark:border-[#282828]/40'>
              <span className='text-gray-500 dark:text-gray-400 font-semibold'>Composer</span>
              <span className='font-medium text-right text-gray-800 dark:text-gray-100'>{track.composer || "N/A"}</span>
            </div>

            <div className='flex justify-between py-1 border-b border-gray-200/60 dark:border-[#282828]/40'>
              <span className='text-gray-500 dark:text-gray-400 font-semibold'>Music Director</span>
              <span className='font-medium text-right text-gray-800 dark:text-gray-100'>{track.musicDirector || "N/A"}</span>
            </div>

            <div className='flex justify-between py-1 border-b border-gray-200/60 dark:border-[#282828]/40'>
              <span className='text-gray-500 dark:text-gray-400 font-semibold'>Singer</span>
              <span className='font-medium text-right text-gray-800 dark:text-gray-100'>{track.singer || "N/A"}</span>
            </div>

            <div className='flex justify-between py-1 border-b border-gray-200/60 dark:border-[#282828]/40'>
              <span className='text-gray-500 dark:text-gray-400 font-semibold'>Genre</span>
              <span className='font-medium text-right text-gray-800 dark:text-gray-100'>{track.genre || "N/A"}</span>
            </div>

            <div className='flex justify-between py-1 border-b border-gray-200/60 dark:border-[#282828]/40'>
              <span className='text-gray-500 dark:text-gray-400 font-semibold'>Release Year</span>
              <span className='font-medium text-right text-gray-800 dark:text-gray-100'>{track.releaseYear || "N/A"}</span>
            </div>

            <div className='flex justify-between py-1'>
              <span className='text-gray-500 dark:text-gray-400 font-semibold'>Album</span>
              <span className='font-medium text-right text-gray-800 dark:text-gray-100'>{track.album || "Single"}</span>
            </div>
          </div>

          {/* Single Next Up Preview */}
          <div className='min-h-[100px] border-t border-gray-200 dark:border-[#282828] pt-4 mb-2'>
            <div className='flex items-center justify-between mb-2.5'>
              <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>Next Song</p>
              <button 
                onClick={() => setActiveRightSidebarTab('queue')}
                className='text-xs font-bold text-[#1db954] hover:underline cursor-pointer bg-transparent border-none'
              >
                Open Queue
              </button>
            </div>
            
            {upcomingQueue.length > 0 ? (
              <div 
                onClick={() => playWithId(upcomingQueue[0]._id)} 
                className='flex items-center justify-between p-2 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group/item'
                title={`Play ${upcomingQueue[0].name || upcomingQueue[0].title}`}
              >
                <div className='flex items-center gap-3 overflow-hidden flex-1'>
                  <img className='w-10 h-10 object-cover rounded shadow-sm border border-gray-300 dark:border-gray-800' src={upcomingQueue[0].image} alt="" />
                  <div className='truncate flex-1'>
                    <p className='text-xs font-bold text-gray-850 dark:text-gray-200 group-hover/item:text-[#1db954] truncate transition-colors'>{upcomingQueue[0].name || upcomingQueue[0].title}</p>
                    <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5'>{upcomingQueue[0].album || 'Single'}</p>
                  </div>
                </div>
                <span className='text-[10px] text-gray-500 dark:text-gray-400 font-mono pl-2'>{upcomingQueue[0].duration}</span>
              </div>
            ) : (
              <p className='text-xs text-gray-500 italic pl-1'>Queue is empty</p>
            )}
          </div>
        </div>
      )}

      {/* 2. Full Queue View */}
      {activeRightSidebarTab === 'queue' && (
        <div className='flex flex-col animate-fade-in'>
          {/* Header */}
          <div className='flex items-center justify-between mb-5'>
            <div className='flex items-center gap-2.5'>
              <button 
                onClick={() => setActiveRightSidebarTab('nowPlaying')}
                className='w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-[#242424] hover:bg-gray-300 dark:hover:bg-[#2e2e2e] text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-all cursor-pointer text-xs font-bold border-none'
                title="Back to Now Playing"
              >
                ←
              </button>
              <span className='font-bold text-sm text-gray-800 dark:text-gray-200'>Play Queue</span>
            </div>
            <button 
              onClick={() => setShowNowPlaying(false)}
              className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#282828] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer font-bold text-sm transition-all border-none bg-transparent'
              title="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Currently Playing Track */}
          <div className='flex flex-col gap-2.5 mb-5'>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>Now Playing</p>
            <div className='flex items-center gap-3 p-2.5 rounded bg-gray-200 dark:bg-[#1a1a1a] border border-[#1db954]/25 shadow-sm'>
              <img className='w-11 h-11 object-cover rounded shadow-md border border-[#1db954]/20' src={track.image} alt="" />
              <div className='truncate flex-1'>
                <p className='text-xs font-bold text-[#1db954] truncate'>{track.title || track.name}</p>
                <p className='text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5'>{track.album || 'Single'}</p>
              </div>
              {playStatus && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#1db954] animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              )}
            </div>
          </div>

          {/* Scrollable Next Up Queue */}
          <div className='flex flex-col gap-5'>
            
            {/* A. Manually Added custom queue (Draggable with dnd-kit) */}
            {customQueue.length > 0 && (
              <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between pl-1 pr-1'>
                  <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest'>Next Up (Manually Added)</p>
                  <button 
                    onClick={() => setCustomQueue([])}
                    className='text-[10px] font-bold text-red-500 hover:text-red-400 hover:underline cursor-pointer bg-transparent border-none'
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
                    <div className='flex flex-col gap-1'>
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
                    <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1'>Next Up</p>
                    <p className='text-xs text-gray-500 italic pl-1'>End of queue source</p>
                  </div>
                )
              }

              return (
                <div className='flex flex-col gap-2'>
                  <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1 truncate'>
                    {isShuffle ? 'Next from Shuffle Pool' : (track.album ? `Next from Album: ${track.album}` : 'Next from catalog')}
                  </p>
                  <div className='flex flex-col gap-1'>
                    {remainingSequence.slice(0, 20).map((item, index) => (
                      <div 
                        onClick={() => playWithId(item._id)} 
                        key={`auto-${item._id}-${index}`} 
                        className='flex items-center justify-between p-2 rounded hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group/item'
                        title={`Play ${item.name || item.title}`}
                      >
                        <div className='flex items-center gap-2.5 overflow-hidden flex-1'>
                          {/* Numbers removed as requested */}
                          <img className='w-8 h-8 object-cover rounded shadow-sm border border-gray-200 dark:border-gray-800' src={item.image} alt="" />
                          <div className='truncate flex-1'>
                            <p className='text-xs font-bold text-gray-800 dark:text-gray-200 group-hover/item:text-[#1db954] truncate transition-colors'>{item.name || item.title}</p>
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
      )}

    </div>
  )
}

export default NowPlayingSidebar
