import { useAuth } from "@contexts/useAuth";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import type { FirebaseError } from "firebase/app";
import { type FormEvent, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<{ email?: string }>({});
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { sendPasswordReset } = useAuth();

  const validateForm = () => {
    const errors: { email?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      await sendPasswordReset(email);
      setIsSent(true);
    } catch (error) {
      console.error("Password reset error:", error);
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === "auth/user-not-found") {
        setErrorMessage("No account found with this email address");
      } else {
        setErrorMessage(firebaseError.message);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Success state after sending password reset email
  if (isSent) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Password Reset Email Sent
            </Typography>

            <Typography paragraph>
              Password reset instructions have been sent to your email address. Please follow the
              link in your email to reset your password.
            </Typography>

            <Typography paragraph>
              After resetting your password, return to the login page.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Button component={RouterLink} to="/login" variant="contained" color="primary">
                Return to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          title="Forgot Password?"
          sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
        />

        <CardContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Typography paragraph>
            This page allows you to reset your account password on the VFS Portal.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSending}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Link component={RouterLink} to="/login" variant="body-sm">
            Back to Login
          </Link>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSending}
          >
            Send Password Reset Email
          </Button>
        </CardActions>
      </Card>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body-sm" sx={{ mb: 1 }}>
          If you haven&apos;t created an account on the VFS Portal yet, and you don&apos;t have a
          Google Account, then you&apos;ll need to create one:
        </Typography>
        <Button
          component={RouterLink}
          to="/create-account"
          variant="contained"
          color="primary"
          size="small"
        >
          Create an Account
        </Button>
      </Box>
    </Container>
  );
}
