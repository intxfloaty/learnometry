import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import useAuth from "../utils/auth/signInAnonymously";
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const user = useAuth();
  return (
    <>
      {user &&
        <main className={styles.main} >
          <Sidebar />
          <InputPromptText />
        </main>}
    </>
  )
}
