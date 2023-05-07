import styles from '@/styles/Home.module.css'
import useAuth from "../utils/auth/signInAnonymously";
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'
import SignIn from './auth/SignIn';


export default function Home() {
  const user = useAuth();

  if(!user) {
    return <SignIn />
  }
  return (
    <>
      {user &&
        <main className={styles.main} >
          <Sidebar />
          <InputPromptText />
        </main>
        } 
    </>
  )
}
