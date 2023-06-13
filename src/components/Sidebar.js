import React, { useState } from 'react'
import Link from 'next/link';
import styles from '../styles/Sidebar.module.css'
import { ListItemButton, ListItemText, IconButton, Drawer, useMediaQuery, AppBar, Toolbar, Hidden } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TwitterIcon from '@mui/icons-material/Twitter';
import PersonIcon from '@mui/icons-material/Person';
import MyPlanModal from './MyPlanModal';
import ComingSoonModal from './ComingSoonModal';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/router';


const Sidebar = ({ subscriber, productName }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [progressReportModalOpen, setProgressReportModalOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push('/'); // Navigate to the home page.
      })
      .catch((error) => {
        // An error happened.
      });
  };


  const drawerWidth = 260;

  const isMobile = useMediaQuery('(max-width:1024px)'); // Adjust the breakpoint value as needed

  const toggleDrawer = (open) => (event) => {
    setDrawerOpen(open);
  };

  const handleProgressReportModalOpen = () => {
    setProgressReportModalOpen(true);
  };

  const handleProgressReportModalClose = () => {
    setProgressReportModalOpen(false);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };


  const drawer = (
    <div className={styles.sidebar}>

      <div className={styles.logoContainer}>
        <img
          alt="Logo"
          src="/images/logo.svg" className={styles.logo} />
      </div>

      <Link href="/">
        <ListItemButton >
          <IconButton >
            <AddBoxIcon color='primary' />
          </IconButton>
          <ListItemText primary="New Stack" />
        </ListItemButton>
      </Link>

      <Link href="/stacks">
        <ListItemButton>
          <IconButton >
            <LayersIcon color='primary' />
          </IconButton>
          <ListItemText primary="Your Stacks" />
        </ListItemButton>
      </Link>

      <ListItemButton onClick={handleProgressReportModalOpen} >
        <IconButton >
          <LeaderboardIcon color='primary' />
        </IconButton>
        <ListItemText primary="Progress Report" />
      </ListItemButton>

      <ListItemButton onClick={handleModalOpen}>
        <IconButton >
          <PersonIcon color='primary' />
        </IconButton>
        <ListItemText primary="My Plan" />
      </ListItemButton>


      <a
        href="https://twitter.com/omni_trix5" // Replace with your platform's Twitter account URL
        target="_blank"
        rel="noopener noreferrer"
      >
        <ListItemButton>
          <IconButton >
            <TwitterIcon color='primary' />
          </IconButton>
          <ListItemText primary="Follow" />
        </ListItemButton>
      </a>

      <ListItemButton onClick={handleLogout}>
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
      <MyPlanModal open={modalOpen} handleClose={handleModalClose} subscriber={subscriber} productName={productName} />
      <ComingSoonModal
        open={progressReportModalOpen}
        handleClose={handleProgressReportModalClose}
      />
    </>
  )
}

export default Sidebar