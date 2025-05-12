import { useAuth } from "@contexts/useAuth";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function Home() {
  const { currentUser, myFamily, isAdmin } = useAuth();

  return (
    <>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box
          component="img"
          src="/VFSLogo.png"
          alt="Village Free School Logo"
          sx={{ maxWidth: "100%", maxHeight: "200px" }}
        />
      </Box>

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

        <Typography variant="body-md" paragraph>
          {currentUser?.displayName ? `Hello, ${currentUser.displayName}!` : "Welcome!"}
          {isAdmin && " You have administrator privileges."}
        </Typography>

        {myFamily ? (
          <Typography variant="body-md" paragraph>
            You are connected to the {myFamily.name}. Use the navigation menu to access your family
            information and registration options.
          </Typography>
        ) : (
          <Typography variant="body-md" paragraph>
            This is the home page of the Village Free School administration portal. Use the
            navigation menu to access different sections of the application.
          </Typography>
        )}
      </Paper>
    </>
  );
}

export default Home;
