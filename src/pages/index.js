import React, { useState, useEffect } from 'react'
import styles from '@/styles/Home.module.css'
import useAuth from "../utils/auth/authState";
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'
import { checkUserResponseCount, fetchProductName } from '@/utils/firebase'

export default function Home() {
  const [responses, setResponses] = useState([]);
  const [depthResponse, setDepthResponse] = useState({});
  const [subscriber, setSubscriber] = useState();
  const [productName, setProductName] = useState();

  useEffect(() => {
    checkUserResponseCount().then((userStatus) => {
      setSubscriber(userStatus.subscriber);
    });

    fetchProductName().then((productName) => {
      setProductName(productName);
    });
  }, []);


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
