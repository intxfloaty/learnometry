import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '@/styles/Home.module.css'
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'

const StackPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [stack, setStack] = useState(null);

  useEffect(() => {
    if (id) { // to avoid running on initial render
    }
  }, [id]);


  return (
    <div>
       <main className={styles.main} >
          <Sidebar />
          <InputPromptText />
        </main>
    </div>
  )
}

export default StackPage
