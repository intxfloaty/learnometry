import React, { useState } from 'react';
import styles from '../../styles/SignIn.module.css';
import { auth } from "../../utils/firebase";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button, TextField, Typography, Container, Box, Grid } from '@mui/material';
import { Google } from '@mui/icons-material';



const SignIn = () => {
  const provider = new GoogleAuthProvider();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
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
      // setError(error.message);
    }
  };

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
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  return (
    <div className={styles.parent}>
      <Container maxWidth="xs">
        <Box my={5}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12}>
              <Box textAlign="center">
                <img alt="Logo" src="/images/logo.svg" width={180} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box textAlign="center">
                <Typography variant="h3">WELCOME</Typography>
                <Typography variant="subtitle1">Log In / Sign Up to continue</Typography>
              </Box>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error" align="center">
                  {error}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Box mt={2}>
                  <Button fullWidth variant="contained" size="large" type="submit">
                    Continue
                  </Button>
                </Box>
              </form>
            </Grid>
            <Grid item xs={8}>
              <Box textAlign="center" mt={1} mb={1}>
                <Typography variant="overline">OR</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                type="submit"
                startIcon={<Google />}
                onClick={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
};

export default SignIn;
