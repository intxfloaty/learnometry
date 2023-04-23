import React from 'react'
import styles from '../styles/Sidebar.module.css'
import { ListItemButton, ListItemText, IconButton, Drawer } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';


const Sidebar = () => {
  const drawerWidth = 260;

  const drawer = (
    <div className={styles.sidebar}>

      <div className={styles.logoContainer}>
        <img
          alt="Logo"
          src="/images/logo.svg" className={styles.logo} />
      </div>

      <ListItemButton onClick={() => navigate('/profile')}>
        <IconButton >
          <AccountBoxIcon />
        </IconButton>
        <ListItemText primary="Profile" />
      </ListItemButton>

      <ListItemButton onClick={() => {/* Add leaderboard functionality here */ }}>
        <IconButton >
          <LeaderboardIcon />
        </IconButton>
        <ListItemText primary="Leaderboard" />
      </ListItemButton>

      <ListItemButton onClick={() => {

      }}>
        <IconButton>
          <LogoutIcon />
        </IconButton>
        <ListItemText primary="Log Out" />
      </ListItemButton>
    </div>
  );

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {drawer}
    </Drawer>
  )
}

export default Sidebar