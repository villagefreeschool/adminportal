import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

function Home() {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: { xs: 3, sm: 4 },
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
  );
}

export default Home;
