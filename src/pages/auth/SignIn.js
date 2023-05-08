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
      {/* <Grid item xs={12}>
        <Box textAlign="center">
          <img alt="Logo" src="/images/logo.svg" width={200} />
        </Box>
      </Grid> */}
      <Box
        width={{ xs: '100%', sm: '80%', md: '50%' }}
        height={{ xs: '100%', sm: '80%', md: 'auto' }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        boxShadow={20}
        bgcolor="background.paper"
        borderRadius={2}
      >
        <Container maxWidth="xs">
          <Box my={5}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item xs={12}>
                <Box textAlign="center">
                  <Typography variant="h5" style={{ color: "blue", fontSize: "32px", fontWeight: "bolder" }}>Welcome to Learnometry</Typography>
                  <Typography variant="body2" style={{ color: "graytext", fontWeight: "bold" }}>Sign in or Sign up to continue</Typography>
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
                  <Box mt={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      sx={{ width: { xs: '100%', sm: '80%', md: '70%' } }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      type="submit"
                      sx={{ width: { xs: '100%', sm: '80%', md: '70%' }, marginTop: "10px" }}
                      style={{ backgroundColor: 'black', color: 'white' }}
                    >
                      Continue
                    </Button>
                  </Box>
                </form>
              </Grid>
              <Grid item xs={8}>
                <Box textAlign="center" mt={1} mb={1}>
                  <Typography variant="caption">OR</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  type="submit"
                  onClick={handleGoogleSignIn}
                  sx={{ width: { xs: '100%', sm: '80%', md: '70%' } }}
                  style={{ backgroundColor: 'black', color: 'white' }}
                >
                  <img alt="Google" src="/images/google-icon.svg" width={20} style={{ marginRight: "8px" }} />
                  Continue with Google
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </div>
  );
};

export default SignIn;
