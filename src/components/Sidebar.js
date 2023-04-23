import React, { useState } from 'react'
import ThemeToggleButton from './ThemeToggleButton';
import styles from '../styles/Sidebar.module.css'
import { ListItemButton, ListItemText, IconButton, Drawer, useMediaQuery, AppBar, Toolbar, Hidden } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';


const Sidebar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerWidth = 260;

  const isMobile = useMediaQuery('(max-width:1024px)'); // Adjust the breakpoint value as needed

  const toggleDrawer = (open) => (event) => {
    setDrawerOpen(open);
  };

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

      <div className={styles.themeToggleButtonContainer}>
        <ThemeToggleButton />
      </div>
    </div>
  );

  return (
    <>
      <Hidden lgUp>
        <AppBar position="fixed" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Hidden>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Sidebar