import { useAuth } from "@contexts/useAuth";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import type { FirebaseError } from "firebase/app";
import { type FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { createAccount, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If the user is already authenticated, redirect to the family page
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/my-family");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const validateForm = () => {
    const errors: {
      email?: string;
      password?: string;
      passwordConfirmation?: string;
    } = {};
    let isValid = true;

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!passwordConfirmation) {
      errors.passwordConfirmation = "Password confirmation is required";
      isValid = false;
    } else if (password !== passwordConfirmation) {
      errors.passwordConfirmation = "Passwords must match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setFormErrors({}); // Clear any existing form errors

    try {
      await createAccount(email, password);
      // Navigation happens in the auth state change listener
      navigate("/my-family");
    } catch (error) {
      console.error("Create account error:", error);
      // Map Firebase error codes to user-friendly messages
      const firebaseError = error as FirebaseError;
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setErrorMessage("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email format");
          break;
        case "auth/weak-password":
          setErrorMessage("Password is too weak. Please choose a stronger password.");
          break;
        case "auth/operation-not-allowed":
          setErrorMessage("Account creation is currently disabled. Please contact support.");
          break;
        case "auth/too-many-requests":
          setErrorMessage("Too many failed attempts. Please try again later.");
          break;
        default:
          setErrorMessage(firebaseError.message || "An error occurred while creating your account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          title="Create a VFS Portal Account"
          sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
        />

        <CardContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
              {errorMessage.includes("email already exists") && (
                <>
                  {" "}
                  <Link component={RouterLink} to="/login" sx={{ color: "inherit" }}>
                    Login
                  </Link>{" "}
                  instead.
                </>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Create Account Form">
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
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="passwordConfirmation"
              label="Password Confirmation"
              type="password"
              id="passwordConfirmation"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              error={!!formErrors.passwordConfirmation}
              helperText={formErrors.passwordConfirmation}
              disabled={isLoading}
              aria-describedby={
                formErrors.passwordConfirmation ? "passwordConfirmation-error" : undefined
              }
            />
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Button
            variant="text"
            color="error"
            size="small"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </CardActions>
      </Card>

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography variant="body-sm" color="text.secondary">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Login here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
