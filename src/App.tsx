import { Button, Typography, Stack } from '@mui/material'

function App() {
  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h4">Hello Material UI 🎉</Typography>
      <Button variant="contained">Klick mich</Button>
    </Stack>
  )
}

export default App