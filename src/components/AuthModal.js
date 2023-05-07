import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, TextField, Typography, Button, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styles from '../styles/AuthModal.module.css';
import { sendEmailLink } from '../utils/auth/sendEmailLink';
import { auth } from '../utils/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut  } from 'firebase/auth';



const AuthModal = ({ open, onClose }) => {
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState('');

  const handleContinueWithEmail = async (e) => {
    e.preventDefault();
    // setMessage('Sending email...');

    try {
      await sendEmailLink(email);
      // setMessage('Email sent! Check your inbox for the sign-in link.');

      // Save the email to localStorage to be used in email link handling
      window.localStorage.setItem('emailForSignIn', email);
    } catch (error) {
      // setMessage('Error sending email: ' + error.message);
      console.log(error)
    }
  }

  const handleGoogleSignIn = async () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...

      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" fullWidth onClick={handleContinueWithEmail}>
              Continue with email
            </Button>
          </Box>
        </Box>
        <Typography variant="subtitle1" align="center">
          or
        </Typography>
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" color='primary' fullWidth onClick={handleGoogleSignIn}>
            Continue with Google
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
