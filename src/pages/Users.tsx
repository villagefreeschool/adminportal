import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

function Users() {
  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Users
        </Typography>
        <Typography variant="body1">
          This page will display a list of all system users and related management options.
        </Typography>
      </Paper>
    </Box>
  );
}

export default Users;
