import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import { Contract, Family, Year } from '../../services/firebase/models/types';
import { fetchContract, saveContract } from '../../services/firebase/contracts';
import { fetchFamily } from '../../services/firebase/families';

interface ContractEditDialogProps {
  open: boolean;
  yearId: string;
  familyId: string;
  onClose: () => void;
  onSave: (contract: Contract) => void;
}

/**
 * Dialog for editing contract details
 */
const ContractEditDialog: React.FC<ContractEditDialogProps> = ({
  open,
  yearId,
  familyId,
  onClose,
  onSave,
}) => {
  const theme = useTheme();
  const [contract, setContract] = useState<Contract | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contract and family data when dialog opens
  useEffect(() => {
    if (open && yearId && familyId) {
      loadData();
    }
  }, [open, yearId, familyId]);

  // Load contract and family data
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch contract and family in parallel
      const [contractData, familyData] = await Promise.all([
        fetchContract(yearId, familyId),
        fetchFamily(familyId),
      ]);

      // Initialize contract if it doesn't exist
      if (!contractData) {
        setContract({
          id: familyId,
          familyID: familyId,
          yearID: yearId,
          studentDecisions: {},
          tuition: 0,
          assistanceAmount: 0,
          tuitionAssistanceRequested: false,
          tuitionAssistanceGranted: false,
          isSigned: false,
        });
      } else {
        setContract(contractData);
      }

      if (familyData) {
        setFamily(familyData);
      } else {
        setError('Family not found');
      }
    } catch (err) {
      console.error('Error loading contract data:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Handle number input change
  const handleNumberChange = (field: string, value: string) => {
    if (!contract) return;

    let numValue = parseFloat(value);
    if (isNaN(numValue)) numValue = 0;

    setContract({
      ...contract,
      [field]: numValue,
    });
  };

  // Handle checkbox change
  const handleCheckboxChange = (field: string, checked: boolean) => {
    if (!contract) return;

    setContract({
      ...contract,
      [field]: checked,
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!contract) return;

    setSaving(true);
    setError(null);

    try {
      const savedContract = await saveContract(contract);
      onSave(savedContract);
      onClose();
    } catch (err) {
      console.error('Error saving contract:', err);
      setError('Error saving contract');
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Contract</DialogTitle>
        <DialogContent dividers>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state if no contract or family
  if (error || !contract || !family) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent dividers>
          <Typography color="error">{error || 'Missing contract or family data'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{`Edit Contract for ${family.name || 'Family'}`}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Tuition"
              type="number"
              value={contract.tuition || 0}
              onChange={(e) => handleNumberChange('tuition', e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={contract.tuitionAssistanceRequested || false}
                  onChange={(e) =>
                    handleCheckboxChange('tuitionAssistanceRequested', e.target.checked)
                  }
                />
              }
              label="Tuition Assistance Requested"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={contract.tuitionAssistanceGranted || false}
                  onChange={(e) =>
                    handleCheckboxChange('tuitionAssistanceGranted', e.target.checked)
                  }
                  disabled={!contract.tuitionAssistanceRequested}
                />
              }
              label="Tuition Assistance Granted"
            />
          </Grid>
          {contract.tuitionAssistanceRequested && contract.tuitionAssistanceGranted && (
            <Grid item xs={12}>
              <TextField
                label="Assistance Amount"
                type="number"
                value={contract.assistanceAmount || 0}
                onChange={(e) => handleNumberChange('assistanceAmount', e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={contract.isSigned || false}
                  onChange={(e) => handleCheckboxChange('isSigned', e.target.checked)}
                />
              }
              label="Contract Signed"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{
            bgcolor: theme.palette.brown[500],
            '&:hover': { bgcolor: theme.palette.brown[700] },
          }}
        >
          {saving ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractEditDialog;
