import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const getBackendUrl = () => {
        const envUrl = import.meta.env.VITE_API_URL;
        if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl.trim() !== '') {
            return envUrl;
        }
        return 'http://localhost:4000';
    };
    const url = getBackendUrl().replace(/\/+$/, '');
    console.log("Backend URL =", url);

    const [songsData, setSongsData] = useState([]);
    const [isLoadingSongs, setIsLoadingSongs] = useState(true);
    const [albumsData, setAlbumsData] = useState([]);
    const [playlistsData, setPlaylistsData] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [track, setTrack] = useState(null);
    const [currentContextId, setCurrentContextId] = useState(null);
    const [autoPlayOnTrackChange, setAutoPlayOnTrackChange] = useState(false);
    const [playStatus, setPlayStatus] = useState(false);

    // Premium Audio Player States
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'context' | 'track'
    const [isSuspended, setIsSuspended] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNowPlaying, setShowNowPlaying] = useState(true);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);

    // Category Filter & Page-Popup Modal state managers
    const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'songs' | 'albums'
    const [modalConfig, setModalConfig] = useState(null);

    // Toast notification state
    const [toastMessage, setToastMessage] = useState(null);
    const toastTimerRef = useRef(null);

    const showToast = (message, duration = 3000) => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }
        setToastMessage(message);
        toastTimerRef.current = setTimeout(() => {
            setToastMessage(null);
            toastTimerRef.current = null;
        }, duration);
    };

    // Persistent Resizable Sidebar Widths
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        const saved = localStorage.getItem("sidebarWidth");
        return saved ? parseInt(saved, 10) : 280;
    });
    const [rightSidebarWidth, setRightSidebarWidth] = useState(() => {
        const saved = localStorage.getItem("rightSidebarWidth");
        return saved ? parseInt(saved, 10) : 320;
    });

    useEffect(() => {
        localStorage.setItem("sidebarWidth", sidebarWidth);
    }, [sidebarWidth]);

    useEffect(() => {
        localStorage.setItem("rightSidebarWidth", rightSidebarWidth);
    }, [rightSidebarWidth]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 403) {
                    const errMsg = error.response.data?.message || '';
                    if (errMsg.toLowerCase().includes('suspended')) {
                        setIsSuspended(true);
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token || token === "null" || token === "undefined") {
                return;
            }
            try {
                const response = await axios.get(`${url}/api/user/status`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.data.success && (response.data.status === 'active' || response.data.status === 'pending')) {
                    setIsSuspended(false);
                }
            } catch (error) {
                const errMsg = error.response?.data?.message || '';
                if (error.response?.status === 403 && errMsg.toLowerCase().includes('suspended')) {
                    setIsSuspended(true);
                }
            }
        };

        // Poll every 3 seconds for immediate real-time synchronization
        const interval = setInterval(checkStatus, 3000);
        checkStatus();

        return () => clearInterval(interval);
    }, [url]);

    useEffect(() => {
        if (isSuspended && playStatus) {
            pause();
        }
    }, [isSuspended, playStatus]);

    const customAlert = (message, title = "Alert") => {
        return new Promise((resolve) => {
            setModalConfig({
                type: 'alert',
                title,
                message,
                onConfirm: () => {
                    setModalConfig(null);
                    resolve(true);
                }
            });
        });
    };

    const customConfirm = (message, title = "Confirm") => {
        return new Promise((resolve) => {
            setModalConfig({
                type: 'confirm',
                title,
                message,
                onConfirm: () => {
                    setModalConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModalConfig(null);
                    resolve(false);
                }
            });
        });
    };

    const customPrompt = (message, defaultValue = "", title = "Prompt") => {
        return new Promise((resolve) => {
            setModalConfig({
                type: 'prompt',
                title,
                message,
                defaultValue,
                onConfirm: (val) => {
                    setModalConfig(null);
                    resolve(val);
                },
                onCancel: () => {
                    setModalConfig(null);
                    resolve(null);
                }
            });
        });
    };

    // Customized Queue & Creator States
    const [activeRightSidebarTab, setActiveRightSidebarTab] = useState('nowPlaying');
    const [customQueue, setCustomQueue] = useState([]);
    const [shuffledSequence, setShuffledSequence] = useState([]);
    const [savedAlbumsData, setSavedAlbumsData] = useState([]);
    const [lastPreviousClickTime, setLastPreviousClickTime] = useState(0);

    // Sleep Timer States
    const [sleepTimerId, setSleepTimerId] = useState(null);
    const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null);

    const [time, setTime] = useState({
        current: {
            seconds: 0,
            minutes: 0
        },
        totalTime: {
            seconds: 0,
            minutes: 0
        }
    });

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    }
    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    }

    const changeVolume = (newVol) => {
        const val = parseFloat(newVol);
        setVolume(val);
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : val;
        }
    }

    const toggleMute = () => {
        if (isMuted) {
            if (audioRef.current) audioRef.current.volume = volume;
            setIsMuted(false);
        } else {
            if (audioRef.current) audioRef.current.volume = 0;
            setIsMuted(true);
        }
    }

    const getContextPool = (currentTrack) => {
        if (!currentTrack) return [];

        if (currentContextId === 'likes') {
            return likedSongs || [];
        }

        if (currentContextId && playlistsData.some(p => String(p._id) === String(currentContextId))) {
            const activePlaylist = playlistsData.find(p => String(p._id) === String(currentContextId));
            return activePlaylist ? (activePlaylist.songs || []).filter(s => s !== null && s !== undefined) : [];
        }

        if (currentContextId === 'mix') {
            return songsData || [];
        }

        if (currentContextId && albumsData.some(a => String(a._id) === String(currentContextId))) {
            return (songsData || []).filter(s => {
                const songAlbumId = s.albumId && (s.albumId._id || s.albumId);
                return String(songAlbumId) === String(currentContextId);
            });
        }

        // Fallback: active album or catalog
        const activeAlbumId = currentTrack.albumId && (currentTrack.albumId._id || currentTrack.albumId);
        if (activeAlbumId) {
            return (songsData || []).filter(s => {
                const songAlbumId = s.albumId && (s.albumId._id || s.albumId);
                return String(songAlbumId) === String(activeAlbumId);
            });
        }

        return songsData || [];
    };

    const toggleRepeatMode = () => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'context';
            if (prev === 'context') return 'track';
            return 'off';
        });
    };

    const previous = async () => {
        if (!track || songsData.length === 0) return;

        const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
        const now = Date.now();
        const timeSinceLastClick = now - lastPreviousClickTime;
        setLastPreviousClickTime(now);

        // Standard Music Player Skip Behavior:
        // Restart the song from the beginning if it has played for more than 1.5 seconds,
        // unless clicked twice in quick succession (within 800ms).
        if (currentTime > 1.5 && timeSinceLastClick > 800) {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setPlayStatus(true);
            }
            return;
        }

        if (repeatMode === 'track') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setPlayStatus(true);
            }
            return;
        }

        const contextTracks = getContextPool(track);
        const currentIndex = contextTracks.findIndex(s => String(s._id) === String(track._id));

        if (currentIndex > 0) {
            const prevTrack = contextTracks[currentIndex - 1];
            setTrack(prevTrack);
            setAutoPlayOnTrackChange(true);
        } else if (currentIndex === 0) {
            if (repeatMode === 'context') {
                const prevTrack = contextTracks[contextTracks.length - 1];
                setTrack(prevTrack);
                setAutoPlayOnTrackChange(true);
            } else {
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                    setPlayStatus(true);
                }
            }
        } else {
            // fallback global previous if context lookup index is first song
            const fallbackIndex = songsData.findIndex(s => String(s._id) === String(track._id));
            if (fallbackIndex > 0) {
                const prevTrack = songsData[fallbackIndex - 1];
                setTrack(prevTrack);
                setAutoPlayOnTrackChange(true);
            }
        }
    }

    const next = async () => {
        if (!track || songsData.length === 0) return;
        if (repeatMode === 'track') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setPlayStatus(true);
            }
            return;
        }

        // 1. Manually queued tracks have absolute top priority
        if (customQueue.length > 0) {
            const nextTrack = customQueue[0];
            setCustomQueue(prev => prev.slice(1));
            setTrack(nextTrack);
            setAutoPlayOnTrackChange(true);
            return;
        }

        // 2. Transition directly using resolved upcoming queue (handles shuffle perfectly)
        const upcoming = getUpcomingQueue();
        if (upcoming.length > 0) {
            const nextTrack = upcoming[0];
            // If it came from manual queue (safety check), slice it
            if (customQueue.some(s => String(s._id) === String(nextTrack._id))) {
                setCustomQueue(prev => prev.filter(s => String(s._id) !== String(nextTrack._id)));
            }
            setTrack(nextTrack);
            setAutoPlayOnTrackChange(true);
        } else {
            if (repeatMode === 'context') {
                const pool = getContextPool(track);
                if (pool.length > 0) {
                    if (isShuffle) {
                        const shuffled = [...pool].sort(() => Math.random() - 0.5);
                        setShuffledSequence(shuffled);
                        setTrack(shuffled[0]);
                    } else {
                        setTrack(pool[0]);
                    }
                    setAutoPlayOnTrackChange(true);
                    return;
                }
            }

            // fallback loop or general catalog next
            const generalIndex = songsData.findIndex(s => String(s._id) === String(track._id));
            if (generalIndex >= 0 && generalIndex < songsData.length - 1) {
                const nextTrack = songsData[generalIndex + 1];
                setTrack(nextTrack);
                setAutoPlayOnTrackChange(true);
            } else if (repeatMode === 'context') {
                setTrack(songsData[0]);
                setAutoPlayOnTrackChange(true);
            }
        }
    }

    const addToQueue = (song) => {
        if (!song || !song._id) return;
        const uniqueQueueId = `${song._id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCustomQueue(prev => [...prev, { ...song, queueId: uniqueQueueId }]);
    }

    const removeFromQueue = (queueId) => {
        setCustomQueue(prev => prev.filter(s => s.queueId !== queueId && s._id !== queueId));
    }

    const generateShuffleSequence = (currentTrack) => {
        if (!currentTrack) {
            setShuffledSequence([]);
            return;
        }

        const pool = getContextPool(currentTrack);
        const otherTracks = pool.filter(s => String(s._id) !== String(currentTrack._id));
        const shuffled = [...otherTracks].sort(() => Math.random() - 0.5);
        setShuffledSequence(shuffled);
    };

    // Keep shuffle sequence synced with mode changes
    useEffect(() => {
        if (isShuffle) {
            generateShuffleSequence(track);
        } else {
            setShuffledSequence([]);
        }
    }, [isShuffle]);

    // Track natural transitions or manual jumps
    useEffect(() => {
        if (!track) return;
        if (isShuffle) {
            if (shuffledSequence.length > 0 && String(shuffledSequence[0]._id) === String(track._id)) {
                setShuffledSequence(prev => prev.slice(1));
            } else {
                generateShuffleSequence(track);
            }
        }
    }, [track]);

    // Handle catalog initial loads for shuffle mode
    useEffect(() => {
        if (isShuffle && shuffledSequence.length === 0 && track && songsData.length > 0) {
            generateShuffleSequence(track);
        }
    }, [songsData]);

    const getUpcomingAutoTracks = () => {
        if (!track) return [];
        if (isShuffle) {
            return shuffledSequence;
        }

        // 1. Liked Songs context
        if (currentContextId === 'likes') {
            const currentIndex = likedSongs.findIndex(s => String(s._id) === String(track._id));
            if (currentIndex !== -1) {
                return likedSongs.slice(currentIndex + 1);
            }
            return [];
        }

        // 2. Custom Playlist context
        if (currentContextId && playlistsData.some(p => String(p._id) === String(currentContextId))) {
            const activePlaylist = playlistsData.find(p => String(p._id) === String(currentContextId));
            if (activePlaylist && activePlaylist.songs) {
                const playlistSongs = activePlaylist.songs.filter(s => s !== null && s !== undefined);
                const currentIndex = playlistSongs.findIndex(s => String(s._id) === String(track._id));
                if (currentIndex !== -1) {
                    return playlistSongs.slice(currentIndex + 1);
                }
            }
            return [];
        }

        // 3. Mix context (all songs)
        if (currentContextId === 'mix') {
            const currentIndex = songsData.findIndex(s => String(s._id) === String(track._id));
            if (currentIndex !== -1) {
                return songsData.slice(currentIndex + 1);
            }
            return [];
        }

        // 4. Album context
        if (currentContextId && albumsData.some(a => String(a._id) === String(currentContextId))) {
            const albumTracks = (songsData || []).filter(s => {
                const songAlbumId = s.albumId && (s.albumId._id || s.albumId);
                return String(songAlbumId) === String(currentContextId);
            });
            const currentIndex = albumTracks.findIndex(s => String(s._id) === String(track._id));
            if (currentIndex !== -1) {
                return albumTracks.slice(currentIndex + 1);
            }
            return [];
        }

        // Fallback: Default album relational search if no context is found, otherwise general catalog
        const activeAlbumId = track.albumId && (track.albumId._id || track.albumId);
        if (activeAlbumId) {
            const albumTracks = (songsData || []).filter(s => {
                const songAlbumId = s.albumId && (s.albumId._id || s.albumId);
                return String(songAlbumId) === String(activeAlbumId);
            });
            const currentIndex = albumTracks.findIndex(s => String(s._id) === String(track._id));
            if (currentIndex !== -1) {
                return albumTracks.slice(currentIndex + 1);
            }
        }

        const currentIndex = songsData.findIndex(s => String(s._id) === String(track._id));
        if (currentIndex !== -1) {
            return songsData.slice(currentIndex + 1);
        }
        return [];
    };

    const getUpcomingQueue = () => {
        return [...customQueue, ...getUpcomingAutoTracks()];
    };

    const seekSong = (e) => {
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration);
    }

    const playWithId = async (id, contextId = null) => {
        if (!songsData || songsData.length === 0) return;

        // If clicking on the currently active track and the context also matches (or is not specified)
        if (track && track._id === id && (contextId === null || currentContextId === contextId)) {
            if (playStatus) {
                pause();
            } else {
                play();
            }
            return;
        }

        const found = songsData.find(s => s._id === id);
        if (!found) return;
        setTrack(found);
        setCurrentContextId(contextId);
        setAutoPlayOnTrackChange(true);
    }

    const playAlbumWithId = async (albumId) => {
        if (!songsData || songsData.length === 0) return;

        let albumSongs = [];
        if (albumId === 'mix') {
            albumSongs = [...songsData];
        } else {
            albumSongs = songsData.filter(s => {
                const songAlbumId = s.albumId && (s.albumId._id || s.albumId);
                return String(songAlbumId) === String(albumId);
            });
        }

        if (albumSongs.length > 0) {
            setTrack(albumSongs[0]);
            setCurrentContextId(albumId);
            setAutoPlayOnTrackChange(true);

            // Re-sync shuffle sequence for this new list if isShuffle is true
            if (isShuffle) {
                const otherTracks = albumSongs.slice(1).sort(() => Math.random() - 0.5);
                setShuffledSequence(otherTracks);
            } else {
                setShuffledSequence([]);
            }
        }
    };

    const getSongsData = async (page = 1, limit = 200) => {
        try {
            setIsLoadingSongs(true);
            const response = await axios.get(`${url}/api/song/list?page=${page}&limit=${limit}`);
            // normalize backend song shape to frontend expectations
            const mapped = (response.data.songs || []).map(s => ({
                ...s,
                name: s.title || s.name,
                _id: s._id || s.id
            }));
            setSongsData(mapped)

            // Restore active song from localStorage
            const savedTrackId = localStorage.getItem('activeTrackId');
            const savedContextId = localStorage.getItem('activeContextId');
            let initialTrack = null;

            if (savedTrackId && mapped.length) {
                initialTrack = mapped.find(s => String(s._id) === String(savedTrackId));
            }

            if (!initialTrack && mapped.length) {
                initialTrack = mapped[0];
            }

            if (initialTrack && !track) {
                setTrack(initialTrack);
                if (savedContextId) {
                    setCurrentContextId(savedContextId);
                }
                // ensure audio src is set for the initial track
                if (audioRef.current) {
                    audioRef.current.src = initialTrack.file;
                    audioRef.current.dataset.progressRestored = '';
                }
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
        } finally {
            setIsLoadingSongs(false);
        }
    }

    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`)
            // backend uses `title`; normalize to `name` for the UI
            const mapped = (response.data.albums || []).map(a => ({
                ...a,
                name: a.title || a.name
            }));
            setAlbumsData(mapped)
        } catch (error) {
            console.error("Error fetching albums:", error);
        }
    }

    // Debounced Backend-based Live Search integration
    useEffect(() => {
        if (!searchTerm.trim()) {
            getSongsData();
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await axios.get(`${url}/api/search?q=${encodeURIComponent(searchTerm)}`);
                if (response.data.success) {
                    const mapped = (response.data.songs || []).map(s => ({
                        ...s,
                        name: s.title || s.name,
                        _id: s._id || s.id
                    }));
                    setSongsData(mapped);
                }
            } catch (err) {
                console.error("Backend search failed:", err);
            }
        }, 300); // 300ms debounce limit

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);


    const getAuthHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const getPlaylistsData = async () => {
        try {
            const response = await axios.get(`${url}/api/user/playlist/list`, getAuthHeaders());
            if (response.data.success) {
                setPlaylistsData(response.data.playlists || []);
            }
        } catch (error) {
            console.error("getPlaylistsData error:", error);
            const token = localStorage.getItem('token');
            if (error.response?.status === 401 && token && token !== "null" && token !== "undefined") {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                getPlaylistsData();
            }
        }
    };

    const getSavedAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/user/albums/saved`, getAuthHeaders());
            if (response.data.success) {
                setSavedAlbumsData(response.data.albums || []);
            }
        } catch (error) {
            console.error("getSavedAlbumsData error:", error);
            const token = localStorage.getItem('token');
            if (error.response?.status === 401 && token && token !== "null" && token !== "undefined") {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                getSavedAlbumsData();
            }
        }
    };

    const getLikedSongsData = async () => {
        try {
            const response = await axios.get(`${url}/api/user/likes/list`, getAuthHeaders());
            if (response.data.success) {
                setLikedSongs(response.data.songs || []);
            }
        } catch (error) {
            console.error("getLikedSongsData error:", error);
            const token = localStorage.getItem('token');
            if (error.response?.status === 401 && token && token !== "null" && token !== "undefined") {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                getLikedSongsData();
            }
        }
    };

    const likeSong = async (songId) => {
        try {
            const response = await axios.post(`${url}/api/user/likes/toggle`, { songId }, getAuthHeaders());
            if (response.data.success) {
                await getLikedSongsData();
                return true;
            }
        } catch (error) {
            console.error("likeSong error:", error);
        }
        return false;
    };

    const unlikeSong = async (songId) => {
        try {
            const response = await axios.post(`${url}/api/user/likes/unlike`, { songId }, getAuthHeaders());
            if (response.data.success) {
                await getLikedSongsData();
                return true;
            }
        } catch (error) {
            console.error("unlikeSong error:", error);
        }
        return false;
    };

    const saveAlbum = async (albumId) => {
        try {
            const response = await axios.post(`${url}/api/user/albums/save`, { albumId }, getAuthHeaders());
            if (response.data.success) {
                await getSavedAlbumsData();
                return true;
            }
        } catch (error) {
            console.error("saveAlbum error:", error);
        }
        return false;
    };

    const unsaveAlbum = async (albumId) => {
        try {
            const response = await axios.post(`${url}/api/user/albums/unsave`, { albumId }, getAuthHeaders());
            if (response.data.success) {
                await getSavedAlbumsData();
                return true;
            }
        } catch (error) {
            console.error("unsaveAlbum error:", error);
        }
        return false;
    };

    const createPlaylist = async (name, desc = "") => {
        try {
            const response = await axios.post(`${url}/api/user/playlist/create`, { name, desc }, getAuthHeaders());
            if (response.data.success) {
                await getPlaylistsData();
                return response.data.playlist;
            }
        } catch (error) {
            console.error("createPlaylist error:", error);
        }
        return null;
    };

    const deletePlaylist = async (id) => {
        try {
            const response = await axios.delete(`${url}/api/user/playlist/${id}`, getAuthHeaders());
            if (response.data.success) {
                await getPlaylistsData();
                return true;
            }
        } catch (error) {
            console.error("deletePlaylist error:", error);
        }
        return false;
    };

    const addSongToPlaylist = async (playlistId, songId) => {
        try {
            const response = await axios.post(`${url}/api/user/playlist/add-song`, { playlistId, songId }, getAuthHeaders());
            if (response.data.success) {
                await getPlaylistsData();
                return true;
            }
        } catch (error) {
            console.error("addSongToPlaylist error:", error);
        }
        return false;
    };

    const removeSongFromPlaylist = async (playlistId, songId) => {
        try {
            const response = await axios.post(`${url}/api/user/playlist/remove-song`, { playlistId, songId }, getAuthHeaders());
            if (response.data.success) {
                await getPlaylistsData();
                return true;
            }
        } catch (error) {
            console.error("removeSongFromPlaylist error:", error);
        }
        return false;
    };

    const reorderPlaylist = async (playlistId, songIds) => {
        try {
            const response = await axios.post(`${url}/api/user/playlist/reorder`, { playlistId, songIds }, getAuthHeaders());
            if (response.data.success) {
                await getPlaylistsData();
                return true;
            }
        } catch (error) {
            console.error("reorderPlaylist error:", error);
        }
        return false;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Apply volume
        audio.volume = isMuted ? 0 : volume;

        const onTimeUpdate = () => {
            const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
            const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
            const percent = duration > 0 ? Math.floor((currentTime / duration) * 100) : 0;
            if (seekBar.current) seekBar.current.style.width = percent + "%";
            setTime({
                current: {
                    seconds: Math.floor(currentTime % 60),
                    minutes: Math.floor(currentTime / 60)
                },
                totalTime: {
                    seconds: Math.floor(duration % 60),
                    minutes: Math.floor(duration / 60)
                }
            })
            if (audio.src && currentTime > 0) {
                localStorage.setItem('activeTrackProgress', currentTime);
            }
        };

        const onLoaded = () => {
            const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
            setTime(prev => ({
                ...prev,
                totalTime: {
                    seconds: Math.floor(duration % 60),
                    minutes: Math.floor(duration / 60)
                }
            }));

            // Restore saved progress on refresh
            if (audio.dataset.progressRestored !== 'true') {
                const savedProgress = localStorage.getItem('activeTrackProgress');
                if (savedProgress) {
                    audio.currentTime = parseFloat(savedProgress);
                }
                audio.dataset.progressRestored = 'true';

                // If it was playing when refreshed, try to play it
                const wasPlaying = localStorage.getItem('activeTrackPlaying') === 'true';
                if (wasPlaying) {
                    audio.play().then(() => {
                        setPlayStatus(true);
                    }).catch(err => {
                        console.log("Autoplay was blocked by browser:", err);
                        // Register a one-time click/touch listener to resume playing upon interaction
                        const resumeOnInteraction = () => {
                            audio.play().then(() => {
                                setPlayStatus(true);
                            }).catch(e => console.log("Failed to play on interaction:", e));
                            document.removeEventListener('click', resumeOnInteraction);
                            document.removeEventListener('touchstart', resumeOnInteraction);
                        };
                        document.addEventListener('click', resumeOnInteraction);
                        document.addEventListener('touchstart', resumeOnInteraction);
                    });
                }
            }
        };

        const onPlay = () => {
            setPlayStatus(true);
            localStorage.setItem('activeTrackPlaying', 'true');
        };
        const onPause = () => {
            setPlayStatus(false);
            localStorage.setItem('activeTrackPlaying', 'false');
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        }
    }, [audioRef, seekBar, volume, isMuted]);

    // Handle song ending (loop vs next track)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            next();
        };

        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        }
    }, [songsData, track, isShuffle, repeatMode]);

    // centralize playback when `track` changes
    useEffect(() => {
        if (!track || !audioRef.current) return;
        if (!autoPlayOnTrackChange) return;

        const doPlay = async () => {
            try {
                audioRef.current.pause();
                audioRef.current.src = track.file;
                audioRef.current.dataset.progressRestored = 'true';
                localStorage.removeItem('activeTrackProgress');
                audioRef.current.load();
                await audioRef.current.play();
                setPlayStatus(true);
            } catch (e) {
                // autoplay may be blocked
            } finally {
                setAutoPlayOnTrackChange(false);
            }
        }

        doPlay();
    }, [track, autoPlayOnTrackChange, audioRef]);

    // Trigger atomic log play analytics after 30 seconds of active playback
    useEffect(() => {
        if (!track || !playStatus) return;

        const timer = setTimeout(async () => {
            try {
                await axios.post(`${url}/api/analytics/log-play`, {
                    songId: track._id,
                    durationSeconds: 30
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log(`📊 Song "${track.title || track.name}" listening analytics logged (>30s play event)`);
            } catch (err) {
                console.warn("Could not log song listening play metric:", err.message);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [track, playStatus]);

    // Advanced Keyboard Shortcuts Listener (Space = Toggle, Arrows = Skip/Volume)
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
                return;
            }

            if (e.code === 'Space' || e.code === 'F9' || e.key === 'F9') {
                e.preventDefault();
                if (playStatus) {
                    pause();
                } else {
                    play();
                }
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                next();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                previous();
            } else if (e.code === 'ArrowUp') {
                e.preventDefault();
                changeVolume(Math.min(volume + 0.05, 1.0));
            } else if (e.code === 'ArrowDown') {
                e.preventDefault();
                changeVolume(Math.max(volume - 0.05, 0.0));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [playStatus, play, pause, volume, changeVolume]);

    // Persistent active song states
    useEffect(() => {
        if (track && track._id) {
            localStorage.setItem('activeTrackId', track._id);
        }
    }, [track]);

    useEffect(() => {
        if (currentContextId) {
            localStorage.setItem('activeContextId', currentContextId);
        } else {
            localStorage.removeItem('activeContextId');
        }
    }, [currentContextId]);

    useEffect(() => {
        getSongsData();
        getAlbumsData();
        getPlaylistsData();
        getSavedAlbumsData();
        getLikedSongsData();
    }, [])




    const contextValue = {
        url,
        audioRef,
        seekBar,
        seekBg,
        track, setTrack,
        currentContextId, setCurrentContextId,
        playStatus, setPlayStatus,
        time, setTime,
        play, pause,
        playWithId,
        playAlbumWithId,
        previous, next,
        isMobilePlayerOpen, setIsMobilePlayerOpen,
        seekSong,
        songsData, albumsData,
        isLoadingSongs,
        playlistsData, setPlaylistsData, getPlaylistsData,
        createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist, reorderPlaylist,
        savedAlbumsData, setSavedAlbumsData, getSavedAlbumsData, saveAlbum, unsaveAlbum,
        likedSongs, setLikedSongs, getLikedSongsData, likeSong, unlikeSong,
        sidebarWidth, setSidebarWidth,
        rightSidebarWidth, setRightSidebarWidth,
        volume, changeVolume,
        isMuted, toggleMute,
        isShuffle, setIsShuffle,
        repeatMode, setRepeatMode, toggleRepeatMode,
        isSuspended, setIsSuspended,
        searchTerm, setSearchTerm,
        showNowPlaying, setShowNowPlaying,
        isSearchActive, setIsSearchActive,
        activeCategory, setActiveCategory,
        modalConfig, setModalConfig,
        customAlert, customConfirm, customPrompt,
        toastMessage, showToast,
        getSongsData, getAlbumsData,
        activeRightSidebarTab, setActiveRightSidebarTab,
        customQueue, setCustomQueue, addToQueue, removeFromQueue, getUpcomingQueue, getUpcomingAutoTracks
    }
    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )
}

export default PlayerContextProvider;