import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { calculatedNameForFamily } from "@services/firebase/families";
import type { Family } from "@services/firebase/models/types";
import type React from "react";
import { useState } from "react";

interface FamilyDeleteDialogProps {
  open: boolean;
  family: Family | null;
  onClose: () => void;
  onDelete: (family: Family) => Promise<void>;
}

/**
 * Dialog component for confirming family deletion
 */
const FamilyDeleteDialog: React.FC<FamilyDeleteDialogProps> = ({
  open,
  family,
  onClose,
  onDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle delete action
  const handleDelete = async () => {
    if (!family) return;

    setError(null);
    setDeleting(true);

    try {
      await onDelete(family);
      onClose();
    } catch (err) {
      console.error("Error deleting family:", err);
      setError("An error occurred while deleting. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Generate family name for display
  const familyName = family ? calculatedNameForFamily(family) : "";

  // List students for confirmation
  const studentNames = family?.students.map((s) => `${s.firstName} ${s.lastName}`).join(", ");

  return (
    <Dialog open={open} onClose={!deleting ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Family Deletion</DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{familyName}</strong>?
        </DialogContentText>

        <Box mt={2}>
          <Typography variant="subtitle2">This will permanently delete:</Typography>
          <ul>
            <li>Family profile for {familyName}</li>
            <li>Student records for: {studentNames}</li>
            <li>All enrollments for these students</li>
            <li>All contracts for this family</li>
          </ul>

          <Typography color="error" variant="body-sm" sx={{ mt: 2, fontWeight: "bold" }}>
            This action cannot be undone.
          </Typography>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={deleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={deleting || !family}
          startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FamilyDeleteDialog;
