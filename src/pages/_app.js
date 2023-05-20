import '../styles/globals.css';
import { ThemeProvider } from '../context/themeContext';
import useAuth from "../utils/auth/authState";
import SignIn from './auth/SignIn';


function MyApp({ Component, pageProps }) {
  const user = useAuth();
  if (!user) {
    return <SignIn />
  }

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
