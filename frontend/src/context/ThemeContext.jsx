import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Tones: 'dark' | 'light' | 'system'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('mymusic-theme') || 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
            // Apply system theme custom styles
            root.style.colorScheme = systemTheme;
        } else {
            root.classList.add(theme);
            root.style.colorScheme = theme;
        }

        localStorage.setItem('mymusic-theme', theme);
    }, [theme]);

    // Handle real-time system theme changes if theme is set to 'system'
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            const newSystemTheme = e.matches ? 'dark' : 'light';
            root.classList.add(newSystemTheme);
            root.style.colorScheme = newSystemTheme;
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
