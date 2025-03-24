import { useState, FormEvent } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Divider,
  CardHeader,
  Alert,
  Box,
  Grid,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = (location.state as any)?.from?.pathname || '/my-family';

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
    } catch (error: any) {
      console.error('Login error:', error);
      // Map Firebase error codes to user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email format');
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginWithGoogle();
      navigate(from);
    } catch (error: any) {
      console.error('Google login error:', error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          title="VFS Portal Login"
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
        />

        <CardContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ pt: 1 }}>
                Have a Google Account? Register and login with one click:
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
              <Box
                component="img"
                src="/btn_google_signin_dark_normal_web@2x.png"
                alt="Sign in with Google"
                sx={{
                  maxWidth: 200,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
                onClick={handleGoogleLogin}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isLoading}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" color="error">
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

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          If you haven't created an account on the VFS Portal yet, and you don't have a Google
          Account, then you'll need to create one:
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
