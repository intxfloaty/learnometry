import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import styles from '@/styles/Home.module.css'
import { fetchStacks } from '@/utils/firebase'
import { Grid, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material'
import Link from 'next/link'

function Stacks() {
  const [stacks, setStacks] = useState([]);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      const fetchedStacks = await fetchStacks()
      setStacks(fetchedStacks);
    }
    fetchData()
  }, [])

  return (
    <main className={styles.main}>
      <Sidebar />
      <Grid container spacing={3} style={{ marginLeft: "10px" }}>
        {stacks.map((stack) => (
          <Grid item xs={12} sm={6} md={4} key={stack.id}>
            <Link href={`/stacks/${stack.id}`} passHref>
              <Card sx={{
                maxWidth: isSmallScreen ? '100%' : 345,
                margin: 'auto',
                boxShadow: 3,
              }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {stack.stackName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {/* Additional information can be added here */}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </main>
  )
}

export default Stacks
