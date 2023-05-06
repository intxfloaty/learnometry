import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, TextField, Typography, Button, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from '../styles/AuthModal.module.css';

const AuthModal = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth BackdropProps={{ className: styles.backdrop }}>
      <DialogTitle disableTypography className={styles.modalTitle}>
        <Typography variant="h5">Log In / Sign Up</Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close" className={styles.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box className={styles.emailContainer}>
          <TextField
            style={{ marginBottom: '8px' }}
            fullWidth
            label="Email Address"
            variant="outlined"
            type="email"
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" fullWidth>
              Continue with email
            </Button>
          </Box>
        </Box>
        <Typography variant="subtitle1" align="center">
          or
        </Typography>
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" color='primary' fullWidth>
            Continue with Google
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
