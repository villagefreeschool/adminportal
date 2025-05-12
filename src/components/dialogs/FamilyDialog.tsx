import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { Family } from "@services/firebase/models/types";
import React, { useState } from "react";
import FamilyForm from "../FamilyForm";

interface FamilyDialogProps {
  open: boolean;
  title: string;
  family: Family;
  loading?: boolean;
  onClose: () => void;
  onSave: (family: Family) => Promise<void>;
  onDelete?: (family: Family) => Promise<void>;
  fullScreen?: boolean;
  isEditing?: boolean;
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
  onDelete,
  fullScreen: forcedFullScreen,
  isEditing = false,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const fullScreen = forcedFullScreen !== undefined ? forcedFullScreen : isSmallScreen;
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
      console.error("Error saving family:", err);
      setError("An error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (
      !onDelete ||
      !window.confirm("Are you sure you want to delete this family? This action cannot be undone.")
    ) {
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await onDelete(localFamily);
      onClose();
    } catch (err) {
      console.error("Error deleting family:", err);
      setError("An error occurred while deleting. Please try again.");
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
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        {isEditing && onDelete && (
          <Button
            onClick={handleDelete}
            color="error"
            variant="outlined"
            disabled={saving || loading}
            startIcon={<DeleteIcon />}
            sx={{ mr: "auto" }}
          >
            Delete
          </Button>
        )}
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            bgcolor: theme.palette.brown[500],
            "&:hover": { bgcolor: theme.palette.brown[700] },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FamilyDialog;
