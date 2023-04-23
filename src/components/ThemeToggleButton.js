import React from 'react';
import { useTheme } from '../context/themeContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const ThemeToggleButton = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
    </button>
  );
};

export default ThemeToggleButton;
