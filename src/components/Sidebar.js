import React, { useState } from 'react'
import ThemeToggleButton from './ThemeToggleButton';
import styles from '../styles/Sidebar.module.css'
import { ListItemButton, ListItemText, IconButton, Drawer, useMediaQuery, AppBar, Toolbar, Hidden } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TwitterIcon from '@mui/icons-material/Twitter';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';


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

      <ListItemButton >
        <IconButton >
          <AddBoxIcon color='primary' />
        </IconButton>
        <ListItemText primary="New Stack" />
      </ListItemButton>

      <ListItemButton >
        <IconButton >
          <LayersIcon color='primary' />
        </IconButton>
        <ListItemText primary="Your Stacks" />
      </ListItemButton>

      <ListItemButton >
        <IconButton >
          <LeaderboardIcon color='primary' />
        </IconButton>
        <ListItemText primary="Leaderboard" />
      </ListItemButton>

      <ListItemButton>
        <IconButton >
          <TwitterIcon color='primary' />
        </IconButton>
        <ListItemText primary="Follow" />
      </ListItemButton>

      <ListItemButton onClick={() => signOut(auth).then(() => {
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
      })}>
        <IconButton >
          <LogoutIcon color='primary' />
        </IconButton>
        <ListItemText primary="Log out" />
      </ListItemButton>

      {/* <div className={styles.themeToggleButtonContainer}>
        <ThemeToggleButton />
      </div> */}
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