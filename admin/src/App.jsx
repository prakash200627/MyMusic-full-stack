import React, { useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import ListAlbum from './pages/ListAlbum';
import AddSong from './pages/AddSong';
import AddAlbum from './pages/AddAlbum';
import ListSong from './pages/ListSong';
import EditSong from './pages/EditSong';
import EditAlbum from './pages/EditAlbum';
import AdminLogin from './pages/AdminLogin';
import ManageUsers from './pages/ManageUsers';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl !== 'undefined' && envUrl !== 'null' && envUrl.trim() !== '') {
    return envUrl;
  }
  return 'http://localhost:4000';
};
export const url = getBackendUrl();
console.log("Admin API URL is:", url);

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin-token') || '')
  const [theme, setTheme] = useState(localStorage.getItem('admin-theme') || 'light')

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
  };

  if (!token) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <ToastContainer />
        <AdminLogin onLoginSuccess={(tok) => setToken(tok)} />
      </div>
    )
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} flex items-start min-h-screen text-gray-900 dark:text-white transition-colors duration-300`}>
      <ToastContainer />
      <Sidebar />
      <div className='flex-1 h-screen overflow-y-scroll bg-[#F3FFF7] dark:bg-[#070e0a] transition-colors duration-300'>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div className='pt-8 pl-5 sm:pt-12 sm:pl-12'>
          <Routes>
            <Route path='/' element={<Navigate to="/list-song" replace />} />
            <Route path='/add-song' element={<AddSong />} />
            <Route path='/add-album' element={<AddAlbum />} />
            <Route path='/list-song' element={<ListSong />} />
            <Route path='/list-album' element={<ListAlbum />} />
            <Route path='/edit-song/:id' element={<EditSong />} />
            <Route path='/edit-album/:id' element={<EditAlbum />} />
            <Route path='/manage-users' element={<ManageUsers />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}

export default App
