// hooks/useAuth.js
import { useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log(user, "signed in")
      } else {
        setUser(null);
        signInAnonymously(auth)
          .then(() => {
            // Signed in..
            console.log(user, "signed in")
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
            // Handle errors here
          });
      }
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  return user;
};

export default useAuth;
