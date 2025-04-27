import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { VFSAdminUser } from '../../services/firebase/models/types';
import UserForm from '../UserForm';
import { fetchUser, saveUser } from '../../services/firebase/users';

interface UserDialogProps {
  open: boolean;
  email?: string; // If provided, edit mode; otherwise, create mode
  onClose: () => void;
  onSave: (user: VFSAdminUser) => void;
}

/**
 * Dialog component for creating or editing a user
 */
const UserDialog: React.FC<UserDialogProps> = ({ open, email, onClose, onSave }) => {
  const theme = useTheme();
  const [user, setUser] = useState<VFSAdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(email);
  const title = isEditMode ? `Edit User ${email}` : 'New User';

  // Load user data when in edit mode
  useEffect(() => {
    if (open && isEditMode) {
      const loadUser = async () => {
        setLoading(true);
        try {
          const userData = await fetchUser(email!);
          if (userData) {
            setUser(userData);
          } else {
            setError('User not found');
            onClose();
          }
        } catch (err) {
          console.error('Error loading user:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      };

      loadUser();
    } else if (open && !isEditMode) {
      // Initialize a new user object for create mode
      setUser({
        email: '',
        firstName: '',
        lastName: '',
        isAdmin: false,
        isStaff: false,
      });
    }
  }, [open, isEditMode, email, onClose]);

  // Handle form changes
  const handleChange = (updatedUser: VFSAdminUser) => {
    setUser(updatedUser);
  };

  // Handle save
  const handleSave = async () => {
    if (!user) return;

    // Simple validation
    if (!user.email || !user.firstName || !user.lastName) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const savedUser = await saveUser(user);
      onSave(savedUser);
      onClose();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth="md" fullWidth>
      <AppBar position="relative" sx={{ bgcolor: theme.palette.green[900] }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {title}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            disabled={saving}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : user ? (
            <UserForm
              user={user}
              onChange={handleChange}
              allowChangingEmail={!isEditMode}
              onEnterKeyPressed={handleSave}
            />
          ) : null}

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={saving} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={saving || loading}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              bgcolor: theme.palette.brown[500],
              '&:hover': { bgcolor: theme.palette.brown[700] },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserDialog;
