import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

interface LoadingSpinnerProps {
  title?: string;
  description?: string;
  minHeight?: string;
}

function LoadingSpinner({ title, description, minHeight = "100vh" }: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight={minHeight}
      width="100%"
      gap={3}
    >
      <CircularProgress size={40} thickness={3.6} />

      {(title || description) && (
        <Box textAlign="center" maxWidth={400}>
          {title && (
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={500}
              gutterBottom={!!description}
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body-sm" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export default LoadingSpinner;
