import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { fetchStacks } from '@/utils/firebase';
import Link from 'next/link';
import styles from '@/styles/Stacks.module.css';

function Stacks() {
  const [stacks, setStacks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedStacks = await fetchStacks()
      setStacks(fetchedStacks);
    }
    fetchData()
  }, [])

  return (
    <main className={styles.main}>
      <div>
        <Sidebar />
      </div>
      <div className={styles.stacksContainer}>
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
