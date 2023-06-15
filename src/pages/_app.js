import '../styles/globals.css';
import { ThemeProvider } from '../context/themeContext';
import useAuth from "../utils/auth/authState";
import SignIn from './auth/SignIn';
import Loading from '../components/Loading';
import { SubscriptionProvider } from '@/context/subscriptionContext';

function MyApp({ Component, pageProps }) {
  const { user, loading } = useAuth();

  // If the auth state is still loading, display a loading screen.
  if (loading) {
    return <Loading />;
  }

  // If no user is authenticated, display the sign-in screen.
  if (!user) {
    return <SignIn />
  }

  // If a user is authenticated, proceed to the application.
  return (
    <SubscriptionProvider>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </SubscriptionProvider>
  );
}

export default MyApp;
