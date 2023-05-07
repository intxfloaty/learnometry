// hooks/useAuth.js
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
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
        console.log(user, "signed out")
      }
    });
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  return user;
};

export default useAuth;
