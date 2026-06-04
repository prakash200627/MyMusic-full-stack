import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlayerContext } from '../context/PlayerContext'
import { assets } from '../assets/assets'

const DisplayLibrary = () => {
  const navigate = useNavigate()
  
  const {
    playlistsData,
    savedAlbumsData,
    likedSongs,
    createPlaylist,
    customPrompt,
    track,
    playStatus,
    play,
    pause,
    playWithId,
    currentContextId,
    songsData,
    playAlbumWithId
  } = useContext(PlayerContext);

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'playlists' | 'albums'
  const username = localStorage.getItem('username') || 'User';

  const calculateTotalDuration = (tracks) => {
    let totalSeconds = 0;
    (tracks || []).forEach(track => {
      if (!track || !track.duration) return;
      const parts = track.duration.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        totalSeconds += (minutes * 60) + seconds;
      } else if (parts.length === 3) {
        const hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        const seconds = parseInt(parts[2], 10) || 0;
        totalSeconds += (hours * 3600) + (minutes * 60) + seconds;
      }
    });

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs} hr ${mins} min`;
    }
    if (mins > 0) {
      return `${mins} min ${secs} sec`;
    }
    return `${secs} sec`;
  };

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

  const handleAlbumPlayToggle = (e, albumItem) => {
    e.stopPropagation();
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
      playAlbumWithId(albumItem._id);
    }
  }

  const renderPlaylistCover = (playlistTracks) => {
    if (playlistTracks && playlistTracks.length >= 4) {
      return (
        <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden grid grid-cols-2 grid-rows-2 border border-zinc-800 shadow">
          <img className="w-full h-full object-cover" src={playlistTracks[0].image || playlistTracks[0].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[1].image || playlistTracks[1].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[2].image || playlistTracks[2].cover} alt="" />
          <img className="w-full h-full object-cover" src={playlistTracks[3].image || playlistTracks[3].cover} alt="" />
        </div>
      );
    }
    if (playlistTracks && playlistTracks.length >= 1) {
      return (
        <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden border border-zinc-800 shadow">
          <img className="w-full h-full object-cover" src={playlistTracks[0].image || playlistTracks[0].cover} alt="" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 flex-shrink-0 bg-zinc-800 rounded flex items-center justify-center border border-zinc-800 shadow overflow-hidden">
        <img className='w-full h-full object-cover' src={assets.mymusic_logo} alt="" />
      </div>
    );
  };

  const showPlaylists = activeFilter === 'all' || activeFilter === 'playlists';
  const showAlbums = activeFilter === 'all' || activeFilter === 'albums';

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
          <h1 className="text-2xl font-black tracking-tight">Your Library</h1>
        </div>

        {/* Search & Add Action Icons */}
        <div className="flex items-center gap-4.5">
          <button className="text-gray-400 hover:text-white bg-transparent border-none outline-none cursor-pointer flex items-center justify-center p-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5.5 h-5.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </button>
          
          <button 
            onClick={handleCreatePlaylist}
            className="text-gray-400 hover:text-white bg-transparent border-none outline-none cursor-pointer flex items-center justify-center p-0"
            title="Create Playlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-5 select-none text-xs font-bold">
        <button 
          onClick={() => setActiveFilter(activeFilter === 'playlists' ? 'all' : 'playlists')}
          className={`px-4.5 py-2 rounded-full cursor-pointer transition-all border border-transparent ${
            activeFilter === 'playlists' 
              ? 'bg-white text-black hover:scale-105 active:scale-95' 
              : 'bg-zinc-800/80 text-white hover:bg-zinc-750 hover:scale-105 active:scale-95'
          }`}
        >
          Playlists
        </button>
        <button 
          onClick={() => setActiveFilter(activeFilter === 'albums' ? 'all' : 'albums')}
          className={`px-4.5 py-2 rounded-full cursor-pointer transition-all border border-transparent ${
            activeFilter === 'albums' 
              ? 'bg-white text-black hover:scale-105 active:scale-95' 
              : 'bg-zinc-800/80 text-white hover:bg-zinc-750 hover:scale-105 active:scale-95'
          }`}
        >
          Albums
        </button>
      </div>

      {/* Library Items List */}
      <div className="flex flex-col gap-3.5 mb-10">
        
        {/* Liked Songs Playlist Item */}
        {showPlaylists && (() => {
          const isCurrentPlaying = track && String(currentContextId) === 'likes';
          const isPlaying = playStatus && isCurrentPlaying;

          return (
            <div 
              onClick={() => navigate('/playlist/likes')}
              className="flex items-center gap-3.5 cursor-pointer hover:bg-zinc-800/30 p-1.5 rounded-lg transition-colors group relative"
            >
              <div className="relative w-12 h-12 flex-shrink-0 group/thumb">
                <div className="w-12 h-12 rounded bg-[#006450] flex items-center justify-center shadow">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1db954]" fill="currentColor">
                    <path d="M5 3h14a2 2 0 012 2v16l-9-5-9 5V5a2 2 0 012-2z" />
                  </svg>
                </div>
                {/* Overlay Play Button on Artwork */}
                <div 
                  onClick={(e) => handlePlaylistPlayToggle(e, 'likes')}
                  className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  {isPlaying ? (
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="white"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                  ) : (
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                  )}
                </div>
              </div>
              <div className="truncate flex-1 min-w-0">
                <p className={`text-sm font-bold truncate transition-colors ${
                  isCurrentPlaying ? 'text-[#1db954]' : 'group-hover:text-[#1db954]'
                }`}>
                  Liked Songs
                  {isPlaying && (
                    <span className="text-[#1db954] text-xs font-mono ml-1.5 animate-pulse">🔊</span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold flex items-center gap-1.5">
                  <span className="text-[#1db954]">📌</span> Playlist • {likedSongs ? likedSongs.length : 0} songs • {calculateTotalDuration(likedSongs)}
                </p>
              </div>

              {/* Hover play/pause button on the right */}
              <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 z-10">
                <button 
                  onClick={(e) => handlePlaylistPlayToggle(e, 'likes')}
                  className={`w-9 h-9 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    isCurrentPlaying ? 'opacity-100 flex' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden group-hover:flex'
                  } border-none`}
                  title={isPlaying ? "Pause Playlist" : "Play Playlist"}
                >
                  {isPlaying ? (
                    <svg role="img" height="12" width="12" viewBox="0 0 24 24" fill="black"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                  ) : (
                    <svg role="img" height="12" width="12" viewBox="0 0 24 24" fill="black" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                  )}
                </button>
              </div>
            </div>
          );
        })()}

        {/* User Playlists */}
        {showPlaylists && playlistsData.map((item) => {
          const playlistTracks = item.songs || [];
          const isCurrentPlaying = track && String(currentContextId) === String(item._id || item.id);
          const isPlaying = playStatus && isCurrentPlaying;

          return (
            <div 
              key={item._id || item.id}
              onClick={() => navigate(`/playlist/${item._id || item.id}`)}
              className="flex items-center gap-3.5 cursor-pointer hover:bg-zinc-800/30 p-1.5 rounded-lg transition-colors group relative"
            >
              <div className="relative w-12 h-12 flex-shrink-0 group/thumb">
                {renderPlaylistCover(playlistTracks)}
                {/* Overlay Play Button on Artwork */}
                <div 
                  onClick={(e) => handlePlaylistPlayToggle(e, item)}
                  className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  {isPlaying ? (
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="white"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                  ) : (
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                  )}
                </div>
              </div>
              <div className="truncate flex-1 min-w-0">
                <p className={`text-sm font-bold truncate transition-colors ${
                  isCurrentPlaying ? 'text-[#1db954]' : 'group-hover:text-[#1db954]'
                }`}>
                  {item.name}
                  {isPlaying && (
                    <span className="text-[#1db954] text-xs font-mono ml-1.5 animate-pulse">🔊</span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Playlist • {playlistTracks.length} songs • {calculateTotalDuration(playlistTracks)}</p>
              </div>

              {/* Hover play/pause button on the right */}
              <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 z-10">
                <button 
                  onClick={(e) => handlePlaylistPlayToggle(e, item)}
                  className={`w-9 h-9 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    isCurrentPlaying ? 'opacity-100 flex' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden group-hover:flex'
                  } border-none`}
                  title={isPlaying ? "Pause Playlist" : "Play Playlist"}
                >
                  {isPlaying ? (
                    <svg role="img" height="12" width="12" viewBox="0 0 24 24" fill="black"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                  ) : (
                    <svg role="img" height="12" width="12" viewBox="0 0 24 24" fill="black" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Saved Albums */}
        {showAlbums && savedAlbumsData.map((item) => {
          const isCurrentAlbum = track && String(currentContextId) === String(item._id);
          const isPlaying = playStatus && isCurrentAlbum;

          const albumTracks = (songsData || []).filter(s => {
            const songAlbumId = s.albumId && (s.albumId._id || s.albumId);
            return String(songAlbumId) === String(item._id) ||
                   String(s.album).toLowerCase() === String(item.name || item.title).toLowerCase();
          });
          const albumDuration = calculateTotalDuration(albumTracks);

          return (
            <div 
              key={item._id || item.id}
              onClick={() => navigate(`/album/${item._id || item.id}`)}
              className="flex items-center gap-3.5 cursor-pointer hover:bg-zinc-800/30 p-1.5 rounded-lg transition-colors group relative"
            >
              <div className="relative w-12 h-12 flex-shrink-0 group/thumb">
                <img className="w-12 h-12 object-cover rounded shadow border border-zinc-800 flex-shrink-0" src={item.image} alt="" />
                {/* Overlay Play Button on Artwork */}
                <div 
                  onClick={(e) => handleAlbumPlayToggle(e, item)}
                  className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  {isPlaying ? (
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="white"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                  ) : (
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="white" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                  )}
                </div>
              </div>
              <div className="truncate flex-1 min-w-0">
                <p className={`text-sm font-bold truncate transition-colors ${
                  isCurrentAlbum ? 'text-[#1db954]' : 'group-hover:text-[#1db954]'
                }`}>
                  {item.name}
                  {isPlaying && (
                    <span className="text-[#1db954] text-xs font-mono ml-1.5 animate-pulse">🔊</span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Album • {albumTracks.length} songs • {albumDuration}</p>
              </div>

              {/* Hover play/pause button on the right */}
              <div className="flex items-center gap-1.5 ml-auto flex-shrink-0 z-10">
                <button 
                  onClick={(e) => handleAlbumPlayToggle(e, item)}
                  className={`w-9 h-9 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                    isCurrentAlbum ? 'opacity-100 flex' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden group-hover:flex'
                  } border-none`}
                  title={isPlaying ? "Pause Album" : "Play Album"}
                >
                  {isPlaying ? (
                    <svg role="img" height="12" width="12" viewBox="0 0 24 24" fill="black"><path d="M5.7 3h3.5v18H5.7zm9.1 0h3.5v18h-3.5z"></path></svg>
                  ) : (
                    <svg role="img" height="12" width="12" viewBox="0 0 24 24" fill="black" className="ml-0.5"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {showPlaylists && playlistsData.length === 0 && (
          <div className="text-center py-10 bg-zinc-900/40 rounded-xl border border-zinc-800/50 p-6 mx-2 my-2">
            <p className="text-xs font-bold">Create your first playlist</p>
            <p className="text-[10px] text-gray-400 mt-1.5 max-w-[80%] mx-auto leading-relaxed">Organize your music library by creating custom lists.</p>
            <button 
              onClick={handleCreatePlaylist}
              className="mt-3 bg-white text-black font-extrabold text-[10px] py-1.5 px-4.5 rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer border-none"
            >
              Create Playlist
            </button>
          </div>
        )}
      </div>

    </div>
  )
}

export default DisplayLibrary
