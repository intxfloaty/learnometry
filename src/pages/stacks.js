import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { auth, fetchStacks } from '@/utils/firebase';
import Link from 'next/link';
import styles from '@/styles/Stacks.module.css';

function Stacks() {
  const [stacks, setStacks] = useState([]);
  const userId = auth.currentUser.uid;
  console.log(stacks, 'stacks')
  console.log(userId, 'userId')


  useEffect(() => {
    const fetchData = async () => {
      const fetchedStacks = await fetchStacks(userId)
      setStacks(fetchedStacks);
    }
    fetchData()
  }, [userId])

  return (
    <main className={styles.main}>
      <div>
        <Sidebar />
      </div>
      <div className={styles.stacksContainer}>
        <h1 className={styles.stacksTitle}>Your Stacks</h1>
        {stacks.map((stack, index) => (
          <Link href={`/stacks/${stack.id}`} passHref key={index}>
            <div className={styles.stack}>
              <span className={styles.stackName}>
                {stack.stackName}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Stacks
