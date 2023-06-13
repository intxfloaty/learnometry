import React, { useState, useEffect } from 'react'
import styles from '@/styles/Home.module.css'
import useAuth from "../utils/auth/authState";
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'
import { auth, checkUserResponseCount } from '@/utils/firebase'

export default function Home() {
  const [responses, setResponses] = useState([]);
  const [depthResponse, setDepthResponse] = useState({});
  const [subscriber, setSubscriber] = useState();
  console.log(subscriber, 'subscriber')

  useEffect(() => {
    checkUserResponseCount().then((userStatus) => {
      setSubscriber(userStatus.subscriber);
    });
  }, []);


  return (
    <>
      <main className={styles.main} >
        <Sidebar subscriber={subscriber} />
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
