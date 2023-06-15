import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/router';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  List,
  ListItem,
  Grid,
  Paper,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { auth } from '@/utils/firebase';
import { useSubscription } from '@/context/subscriptionContext';

const MyPlanModal = ({ open, handleClose, modalMessage }) => {
  const { subscriber, productName } = useSubscription();
  const [userId, setUserId] = useState('');
  console.log(subscriber, productName, 'subscriber, productName')
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isExtraSmall = useMediaQuery('(max-width:400px)');

  const modalMaxWidth = isMobile ? 'xs' : isTablet ? 'sm' : 'md';
  const gridSpacing = isMobile ? 2 : 3;
  const gridColumns = isMobile ? 12 : 6;
  const listItemStyle = isExtraSmall ? { fontSize: '12px', textAlign: 'center' } : { textAlign: 'center' };

  useEffect(() => {
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, []);

  const handleGetPro = async () => {
    try {
      const response = await fetch('https://upgradeplan-h2i33bupla-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'pro', userId: userId })
      });
      const data = await response.json();
      const url = data.data.attributes.url;

      // Use the router to navigate to the new page
      router.push(url);
    } catch (error) {
      console.log(error);
    }
  }

  const handleGetPlus = async () => {
    try {
      const response = await fetch('https://upgradeplan-h2i33bupla-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'plus', userId: userId })
      });
      const data = await response.json();
      const url = data.data.attributes.url;

      // Use the router to navigate to the new page
      router.push(url);
    } catch (error) {
      console.log(error);
    }
  }

  const renderPlusBox = () => {
    return (
      <Grid item xs={gridColumns}>
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: "20px" }}>
            <Typography variant="h5" align="center" gutterBottom
              style={{
                color: "blue",
                fontSize: "28px",
                fontWeight: "bolder"
              }}>
              Plus
            </Typography>
            <Typography variant="h6" style={{ fontWeight: "bold" }} gutterBottom>
              $10/month
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <List>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">1. Unlimited Responses/day</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">2. Different learning Styles</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">3. Stack history</Typography>
                </ListItem>
              </List>
            </Box>
            {/* <Box sx={{ mt: 'auto', display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button variant="contained" color="primary" onClick={handleGetPlus}
                style={{ backgroundColor: 'black', color: 'white' }}>
                Get Plus
              </Button>
            </Box> */}
          </Paper>
        </Box>
      </Grid>
    )
  }

  const renderProBox = () => {
    return (
      <Grid item xs={gridColumns}>
        <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h5" align="center" gutterBottom
              style={{
                color: "blue",
                fontSize: "28px",
                fontWeight: "bolder"
              }}>
              Pro
            </Typography>
            <Typography variant="h6" style={{ fontWeight: "bold" }} gutterBottom>
              $20/month
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <List>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">1. Unlimited Responses/day</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">2. Different learning Styles</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">3. Stack history</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">4.Chat with PDF</Typography>
                </ListItem>
                <ListItem disablePadding>
                  <Typography style={listItemStyle} align="center">5. Access to upcoming new features</Typography>
                </ListItem>
              </List>
            </Box>
            {/* <Box sx={{ mt: 'auto', display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button variant="contained" color="primary" onClick={handleGetPro}
                style={{ backgroundColor: 'black', color: 'white' }}>
                Get Pro
              </Button>
            </Box> */}
          </Paper>
        </Box>
      </Grid>
    )
  }


  if (subscriber) {
    if (productName === 'Plus') {
      return (
        <Dialog open={open} onClose={handleClose} fullWidth >
          <DialogTitle>
            <Typography style={{ padding: "10px", fontSize: "16px", fontWeight: "bold" }} align="center">
              You are already a subscriber!
            </Typography>
          </DialogTitle>
          {(productName === 'Plus') ? renderPlusBox() : renderProBox()}
        </Dialog>
      )
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={modalMaxWidth}>
      {(modalMessage) ?
        <Typography style={{ padding: "10px", fontSize: "16px", fontWeight: "bold" }}>
          {modalMessage}
        </Typography> :
        <Typography style={{ padding: "10px", fontSize: "16px", fontWeight: "bold" }}>
          Currently, you are on the Learnometry Free plan. Upgrade your plan to enjoy unlimited daily responses and gain access to additional features.
        </Typography>}
      <DialogContent>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={gridColumns}>
            <Box sx={{ height: '100%' }}>
              <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" align="center" gutterBottom
                  style={{
                    color: "blue",
                    fontSize: "28px",
                    fontWeight: "bolder"
                  }}>
                  Plus
                </Typography>
                <Typography variant="h6" style={{ fontWeight: "bold" }} gutterBottom>
                  $10/month
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <List>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">1. Unlimited Responses/day</Typography>
                    </ListItem>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">2. Different learning Styles</Typography>
                    </ListItem>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">3. Stack history</Typography>
                    </ListItem>
                  </List>
                </Box>
                <Box sx={{ mt: 'auto', display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Button variant="contained" color="primary" onClick={handleGetPlus}
                    style={{ backgroundColor: 'black', color: 'white' }}>
                    Get Plus
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Grid>
          <Grid item xs={gridColumns}>
            <Box sx={{ height: '100%' }}>
              <Paper elevation={1} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" align="center" gutterBottom
                  style={{
                    color: "blue",
                    fontSize: "28px",
                    fontWeight: "bolder"
                  }} >
                  Pro
                </Typography>
                <Typography variant="h6" style={{ fontWeight: "bold" }} gutterBottom>
                  $20/month
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <List>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">1. Unlimited Responses/day</Typography>
                    </ListItem>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">2. Different learning Styles</Typography>
                    </ListItem>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">3. Stack history</Typography>
                    </ListItem>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">4.Chat with PDF</Typography>
                    </ListItem>
                    <ListItem disablePadding>
                      <Typography style={listItemStyle} align="center">5. Access to upcoming new features</Typography>
                    </ListItem>
                  </List>
                </Box>
                <Box sx={{ mt: 'auto', display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Button variant="contained" color="primary" onClick={handleGetPro}
                    style={{ backgroundColor: 'black', color: 'white' }}>
                    Get Pro
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default MyPlanModal;
