import React, { useState } from 'react';
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
  useMediaQuery,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FamilyForm from '../FamilyForm';
import { Family } from '../../services/firebase/models/types';

interface FamilyDialogProps {
  open: boolean;
  title: string;
  family: Family;
  loading?: boolean;
  onClose: () => void;
  onSave: (family: Family) => Promise<void>;
}

/**
 * Dialog component for creating or editing a family
 * Used for both new and edit operations
 */
const FamilyDialog: React.FC<FamilyDialogProps> = ({
  open,
  title,
  family,
  loading = false,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [localFamily, setLocalFamily] = useState<Family>(family);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local family when prop changes
  React.useEffect(() => {
    setLocalFamily(family);
  }, [family]);

  // Handle form change
  const handleChange = (updatedFamily: Family) => {
    setLocalFamily(updatedFamily);
  };

  // Handle save
  const handleSave = async () => {
    setError(null);
    setSaving(true);
    
    try {
      await onSave(localFamily);
      onClose();
    } catch (err) {
      console.error('Error saving family:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!saving ? onClose : undefined}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown={saving}
    >
      <AppBar position="relative" sx={{ bgcolor: 'green.900' }}>
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

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <FamilyForm family={localFamily} onChange={handleChange} />
        )}
        
        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ bgcolor: 'brown.500', '&:hover': { bgcolor: 'brown.700' } }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FamilyDialog;