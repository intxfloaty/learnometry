import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from '@/styles/Home.module.css'
import Sidebar from '@/components/Sidebar'
import InputPromptText from '@/components/InputPromptText'
import { fetchSubStacks } from '@/utils/firebase'

const StackPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [subId, setSubId] = useState(null); // [id].js
  const [stack, setStack] = useState(null);
  const [responses, setResponses] = useState([]);
  const [depthResponse, setDepthResponse] = useState({});
  console.log(stack, 'stack')
  console.log(responses, 'responses[id].js')
  console.log(depthResponse, 'depthResponse[id].js')

  useEffect(() => {
    if (id) { // to avoid running on initial render
      const fetchData = async () => {
        const fetchedStack = await fetchSubStacks(id)
        setStack(fetchedStack);
      }
      fetchData()
    }
  }, [id]);

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
