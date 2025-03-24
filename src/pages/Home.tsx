import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

function Home() {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: { xs: 3, sm: 4 },
          width: '100%',
        }}
      >
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
