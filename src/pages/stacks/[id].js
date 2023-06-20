import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '@/styles/Home.module.css'
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'
import { auth, fetchSubStacks } from '@/utils/firebase'

const StackPage = () => {
  const router = useRouter()
  const { id } = router.query
  const userId = auth.currentUser.uid;
  const [subId, setSubId] = useState(null); // [id].js
  const [stack, setStack] = useState(null);
  const [responses, setResponses] = useState([]);
  const [depthResponse, setDepthResponse] = useState({});

  useEffect(() => {
    if (id) { // to avoid running on initial render
      fetchSubStacks(userId, id).then((fetchedStack) => {
        setStack(fetchedStack);
      });
    }
  }, [userId, id]);

  useEffect(() => {
    if (stack) {
      const responses = stack.map((item) => {
        return item.stack;
      })
      setResponses(responses)
    }
  }, [stack]);

  useEffect(() => {
    if (stack) {
      const depthResponse = stack.reduce((acc, item) => {
        return { ...acc, ...item.depthStack };
      }, {});
      setDepthResponse(depthResponse);
    }
  }, [stack]);


  return (
    <div>
      <main className={styles.main} >
        <Sidebar />
        <InputPromptText
          responses={responses}
          setResponses={setResponses}
          depthResponse={depthResponse}
          setDepthResponse={setDepthResponse}
          id={id}
          subId={subId}
        />
      </main>
    </div>
  )
}

export default StackPage
