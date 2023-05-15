import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Card, CardContent, Typography } from '@mui/material'

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
      {stack ? (
        <Card>
          <CardContent>
            <Typography variant="h5" component="div">
              {stack.stackName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {/* Additional information can be added here */}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  )
}

export default StackPage
