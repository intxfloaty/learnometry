import React, { useState, useEffect } from 'react'
import styles from '@/styles/Home.module.css'
import useAuth from "../utils/auth/authState";
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'
import SignIn from './auth/SignIn';


export default function Home() {
  const user = useAuth();
  const [responses, setResponses] = useState([]);
  const [depthResponse, setDepthResponse] = useState({});

  return (
    <>
      <main className={styles.main} >
        <Sidebar />
        <InputPromptText
          responses={responses}
          setResponses={setResponses}
          depthResponse={depthResponse}
          setDepthResponse={setDepthResponse}
        />
      </main>
    </>
  )
}
