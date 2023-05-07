import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from "../../utils/firebase"

const EmailLinkHandler = () => {

  useEffect(() => {
    async function handleEmailLink() {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // TODO: Show an error or prompt the user to enter their email
          return;
        }

        try {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          navigate('/'); // Redirect to the main page
        } catch (error) {
          // TODO: Handle the error (e.g., show an error message)
          console.error('Error signing in with email link:', error);
        }
      }
    }

    handleEmailLink();
  }, []);
};

export default EmailLinkHandler;
