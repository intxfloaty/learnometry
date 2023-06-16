import React, { useEffect, useState } from 'react';
import styles from '../../styles/SignIn.module.css';
import { auth } from "../../utils/firebase";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button, TextField, Typography, Container, Box, Grid } from '@mui/material';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useRouter } from 'next/router';

const SignIn = () => {
  const router = useRouter();
  const provider = new GoogleAuthProvider();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const actionCodeSettings = {
    url: `https://learnometry-a4447.web.app`,
    handleCodeInApp: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setMessage('Sending email...');

    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        // The link was successfully sent. Inform the user.
        setMessage(`Email sent to ${email}! Please check your inbox!`);
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        window.localStorage.setItem('emailForSignIn', email);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ...
      });
  };


  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again. For example:
        email = window.prompt('Please provide your email for confirmation');
      }
      // The client SDK will parse the code from the link for you.
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          // Clear email from storage.
          router.push('/')
          window.localStorage.removeItem('emailForSignIn');
          // You can access the new user via result.user
          // Additional user info profile not available via:
          // result.additionalUserInfo.profile == null
          // You can check if the user is new or existing:
          // result.additionalUserInfo.isNewUser
        })
        .catch((error) => {
          // Some error occurred, you can inspect the code: error.code
          // Common errors could be invalid email and invalid or expired OTPs.
        });
    }
  }, []);

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
                    {!message &&
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
                    }
                  </Box>
                </form>
                {message && <Typography style={{ marginTop: "20px", color: "blue" }} align="center">{message}</Typography>}
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
