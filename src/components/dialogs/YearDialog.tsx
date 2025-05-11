import CloseIcon from "@mui/icons-material/Close";
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
} from "@mui/material";
import { useEffect, useState } from "react";
import type { Year } from "../../services/firebase/years";
import YearForm from "../YearForm";
import YearTuitionChart from "../YearTuitionChart";

interface YearDialogProps {
  open: boolean;
  title: string;
  year: Partial<Year>;
  loading?: boolean;
  onClose: () => void;
  onSave: (year: Partial<Year>) => Promise<void>;
}

export default function YearDialog({
  open,
  title,
  year,
  loading = false,
  onClose,
  onSave,
}: YearDialogProps) {
  const [formData, setFormData] = useState<Partial<Year>>(year);
  const [saving, setSaving] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Update form data when year prop changes
  useEffect(() => {
    if (open) {
      setFormData(year);
    }
  }, [year, open]);

  // Validate form whenever data changes
  useEffect(() => {
    const isValid =
      !!formData.name &&
      !!formData.minimumTuition &&
      !!formData.maximumTuition &&
      !!formData.minimumIncome &&
      !!formData.maximumIncome;

    setFormValid(isValid);
  }, [formData]);

  // Handle form changes
  const handleChange = (updatedYear: Partial<Year>) => {
    setFormData(updatedYear);
  };

  // Handle save button click
  const handleSave = async () => {
    if (!formValid) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving year:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="year-dialog-title"
    >
      <AppBar position="static" color="primary" sx={{ bgcolor: "green.900" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} id="year-dialog-title">
            {title}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (formValid && !saving) {
            handleSave();
          }
        }}
      >
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <YearForm
                year={formData}
                onChange={handleChange}
                onEnterKeySubmit={formValid && !saving ? handleSave : undefined}
              />
              {formData.id && formValid && <YearTuitionChart year={formData as Year} />}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="error" variant="text" type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!formValid || saving}
            sx={{ bgcolor: "brown.500", "&:hover": { bgcolor: "brown.700" } }}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
