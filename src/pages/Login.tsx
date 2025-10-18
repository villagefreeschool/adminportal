import { useAuth } from "@contexts/useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import type { FirebaseError } from "firebase/app";
import { type FormEvent, useEffect, useId, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, loginWithGooglePopup, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If the user is already authenticated, redirect to the family page
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/my-family");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Get the redirect path from location state or default to home
  const from =
    location.state && "from" in location.state
      ? (location.state.from as { pathname: string }).pathname
      : "/my-family";

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
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

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      navigate(from);
    } catch (error) {
      console.error("Login error:", error);
      // Map Firebase error codes to user-friendly messages
      const firebaseError = error as FirebaseError;
      if (
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        setErrorMessage("Invalid email or password");
      } else if (firebaseError.code === "auth/invalid-email") {
        setErrorMessage("Invalid email format");
      } else {
        setErrorMessage(firebaseError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginWithGooglePopup();
      setIsLoading(false);
    } catch (error) {
      console.error("Google login error:", error);
      const firebaseError = error as FirebaseError;
      setErrorMessage(firebaseError.message);
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          title="VFS Portal Login"
          sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
        />

        <CardContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Typography variant="body-md" sx={{ mb: 2 }}>
            Sign in with Google:
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              sx={{
                bgcolor: "#4285F4",
                color: "white",
                fontWeight: "medium",
                "&:hover": { bgcolor: "#3367D6" },
                px: 3,
                py: 1.5,
                fontSize: "1rem",
                boxShadow: 3,
              }}
              startIcon={
                isLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        display: "inline-block",
                        width: 20,
                        height: 20,
                        border: "2px solid currentColor",
                        borderRadius: "50%",
                        borderTopColor: "transparent",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  </Box>
                ) : (
                  <GoogleIcon />
                )
              }
            >
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center", my: 1 }}>
            <Typography variant="body-sm" color="text.secondary">
              You&apos;ll be redirected to Google to sign in securely
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id={emailId}
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
              id={passwordId}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body-sm" color="error">
            Forgot Password?
          </Link>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Login
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
