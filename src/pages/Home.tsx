import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

function Home() {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to VFS Admin Portal
        </Typography>
        <Typography variant="body1" paragraph>
          This is the home page of the Village Free School administration portal.
        </Typography>
        <Typography variant="body1">
          Use the navigation menu to access different sections of the application.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Home;
