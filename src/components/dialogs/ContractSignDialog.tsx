import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  useTheme,
  DialogActions,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Contract as ContractType, SignatureData } from '../../services/firebase/models/types';
import SignatureCapture from '../SignatureCapture';

interface ContractSignDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatures: Record<string, SignatureData>) => Promise<void>;
  // Technically we don't use the contract directly, but we include it for future extensions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contract: ContractType;
  guardianIds: string[];
  guardianNames: Record<string, string>;
  existingSignatures?: Record<string, SignatureData>;
  initialGuardian?: string | null;
}

/**
 * Dialog component for signing contracts
 */
const ContractSignDialog: React.FC<ContractSignDialogProps> = ({
  open,
  onClose,
  onSave,
  _contract,
  guardianIds,
  guardianNames,
  existingSignatures = {},
  initialGuardian = null,
}) => {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGuardian, setActiveGuardian] = useState<string | null>(initialGuardian);
  const [signatures, setSignatures] = useState<Record<string, SignatureData>>(existingSignatures);
  
  // Update active guardian when initialGuardian prop changes
  useEffect(() => {
    if (initialGuardian) {
      setActiveGuardian(initialGuardian);
    }
  }, [initialGuardian]);

  // Handle dialog close
  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  // Handle signature save
  const handleSaveSignature = (guardianId: string, signatureData: string) => {
    const now = new Date();
    setSignatures((prev) => ({
      ...prev,
      [guardianId]: {
        data: signatureData,
        date: now.toISOString(),
        guardianId,
      },
    }));
    setActiveGuardian(null);
  };

  // Handle final saving of all signatures
  const handleSaveAll = async () => {
    setError(null);
    setSaving(true);

    try {
      await onSave(signatures);
      onClose();
    } catch (err) {
      console.error('Error saving signatures:', err);
      setError('Failed to save signatures. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Status information
  const signedGuardians = Object.keys(signatures);
  const remainingGuardians = guardianIds.filter((id) => !signedGuardians.includes(id));
  const allSigned = remainingGuardians.length === 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <AppBar position="relative" sx={{ bgcolor: theme.palette.green[900] }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Sign Contract
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            disabled={saving}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <DialogContent dividers>
        {activeGuardian ? (
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            my={2}
          >
            <Typography variant="h6" gutterBottom>
              {guardianNames[activeGuardian]}&apos;s Signature
            </Typography>
            <SignatureCapture
              onSave={(data) => handleSaveSignature(activeGuardian, data)}
              onCancel={() => setActiveGuardian(null)}
              initialSignature={signatures[activeGuardian]?.data}
            />
          </Box>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Contract Signatures
            </Typography>
            <Typography variant="body1" paragraph>
              All guardians must sign the contract before it will be marked as completed. Each
              guardian should sign individually.
            </Typography>

            {/* Show signed guardians */}
            {signedGuardians.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Signed:
                </Typography>
                {signedGuardians.map((guardianId) => (
                  <Box
                    key={guardianId}
                    display="flex"
                    alignItems="center"
                    mb={2}
                    p={2}
                    border="1px solid #eee"
                    borderRadius={1}
                  >
                    <Box flexGrow={1}>
                      <Typography variant="body1">{guardianNames[guardianId]}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Signed on: {new Date(signatures[guardianId].date).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box width={150} height={60}>
                      <img
                        src={signatures[guardianId].data}
                        alt={`${guardianNames[guardianId]}'s signature`}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ ml: 2 }}
                      onClick={() => setActiveGuardian(guardianId)}
                    >
                      Re-sign
                    </Button>
                  </Box>
                ))}
              </Box>
            )}

            {/* Show guardians who still need to sign */}
            {remainingGuardians.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Still needs signatures from:
                </Typography>
                {remainingGuardians.map((guardianId) => (
                  <Box
                    key={guardianId}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                    p={2}
                    border="1px dashed #ccc"
                    borderRadius={1}
                  >
                    <Typography variant="body1">{guardianNames[guardianId]}</Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setActiveGuardian(guardianId)}
                    >
                      Sign Now
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}

        {error && (
          <Box mt={2}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveAll}
          color="primary"
          variant="contained"
          disabled={saving || !allSigned || activeGuardian !== null}
          startIcon={saving ? <CircularProgress size={20} /> : <AssignmentTurnedInIcon />}
          sx={{
            bgcolor: theme.palette.brown[500],
            '&:hover': { bgcolor: theme.palette.brown[700] },
          }}
        >
          {saving ? 'Saving...' : 'Complete & Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractSignDialog;
