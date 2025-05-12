import SignatureCapture from "@components/contracts/SignatureCapture";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CloseIcon from "@mui/icons-material/Close";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import type { Contract as ContractType, SignatureData } from "@services/firebase/models/types";
import { useEffect, useMemo, useState } from "react";

interface ContractSignDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatures: Record<string, SignatureData>) => Promise<void>;
  // Technically we don't use the contract directly, but we include it for future extensions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _contract: ContractType;
  guardianIds: string[];
  guardianNames: Record<string, string>;
  existingSignatures?: Record<string, SignatureData>;
  initialGuardian?: string | null;
}

/**
 * Dialog component for signing contracts
 */
function ContractSignDialog({
  open,
  onClose,
  onSave,
  _contract,
  guardianIds,
  guardianNames,
  existingSignatures = {},
  initialGuardian = null,
}: ContractSignDialogProps) {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGuardian, setActiveGuardian] = useState<string | null>(initialGuardian);
  const [signatures, setSignatures] = useState<Record<string, SignatureData>>(existingSignatures);

  // Calculate who still needs to sign
  const signedGuardians = useMemo(() => Object.keys(signatures || {}), [signatures]);

  const remainingGuardians = useMemo(
    () => guardianIds?.filter((id) => !signedGuardians.includes(id)) || [],
    [guardianIds, signedGuardians],
  );

  const allSigned = useMemo(() => remainingGuardians.length === 0, [remainingGuardians]);

  // Only select a guardian when explicitly requested via initialGuardian
  useEffect(() => {
    if (open) {
      if (initialGuardian) {
        // Only set active guardian if specifically provided
        setActiveGuardian(initialGuardian);
      } else {
        // Otherwise start with overview (no active guardian)
        setActiveGuardian(null);
      }
    }
  }, [open, initialGuardian]);

  // Handle dialog close
  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  // Handle signature save
  const handleSaveSignature = (guardianId: string, signatureData: string) => {
    console.log("Saving signature for guardian:", guardianId);

    // If signature data is empty, remove the signature
    if (!signatureData) {
      console.log("Removing signature for guardian:", guardianId);
      const updatedSignatures = { ...signatures };
      delete updatedSignatures[guardianId];
      setSignatures(updatedSignatures);
      setActiveGuardian(null);
      return;
    }

    const now = new Date();

    const updatedSignatures = {
      ...signatures,
      [guardianId]: {
        data: signatureData,
        date: now.toISOString(),
        guardianId,
      },
    };

    // Update signatures state
    setSignatures(updatedSignatures);

    // Reset active guardian state after successful save
    setActiveGuardian(null);

    console.log("Updated signatures:", Object.keys(updatedSignatures));
  };

  // Handle final saving of all signatures
  const handleSaveAll = async () => {
    setError(null);
    setSaving(true);

    try {
      await onSave(signatures);
      onClose();
    } catch (err) {
      console.error("Error saving signatures:", err);
      setError("Failed to save signatures. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Log information for debugging
  console.log("Contract Dialog Debug:", {
    guardianIds,
    guardianNames,
    signedGuardians,
    remainingGuardians,
    activeGuardian,
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      fullScreen
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#fafafa",
        },
      }}
    >
      <AppBar position="sticky" sx={{ bgcolor: theme.palette.green[900] }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {activeGuardian
              ? `${guardianNames[activeGuardian]}'s Signature`
              : "Contract Signatures"}
          </Typography>
          {activeGuardian && (
            <Button
              color="inherit"
              startIcon={<CloseIcon />}
              onClick={() => setActiveGuardian(null)}
              sx={{ mr: 2 }}
            >
              Back to Overview
            </Button>
          )}
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

      <DialogContent>
        {activeGuardian ? (
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            my={4}
            mx="auto"
            maxWidth="800px"
          >
            <Paper elevation={3} sx={{ p: 4, width: "100%", mb: 3, borderRadius: 2 }}>
              <SignatureCapture
                onSave={(data) => handleSaveSignature(activeGuardian, data)}
                onCancel={() => setActiveGuardian(null)}
                initialSignature={signatures[activeGuardian]?.data}
                width={700}
                height={250}
                label={`Signature for ${guardianNames[activeGuardian]}`}
              />
            </Paper>
          </Box>
        ) : (
          <Box maxWidth="800px" mx="auto" pt={2}>
            <Typography variant="h5" gutterBottom align="center">
              Contract Signature Status
            </Typography>
            <Typography variant="body-md" paragraph align="center">
              All guardians must sign this contract to complete the enrollment process.
            </Typography>

            {/* Clear instructions for using the signature dialog */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                my: 3,
                bgcolor: "#f5f9ff",
                borderRadius: 2,
                border: "1px solid #d0e0ff",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                mb={2}
                borderBottom="1px solid #e0e0ff"
                pb={2}
              >
                <Box sx={{ backgroundColor: "#e3f2fd", p: 1, borderRadius: "50%" }}>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                    i
                  </Typography>
                </Box>
                <Typography variant="h6" color="primary">
                  Digital Signature Instructions
                </Typography>
              </Box>

              <Typography variant="body-md" paragraph>
                To sign this contract, click the <strong>&quot;Sign Now&quot;</strong> button next
                to each guardian&apos;s name.
              </Typography>

              <Typography variant="body-sm" color="text.secondary">
                Once all guardians have signed, click &quot;Complete & Submit&quot; at the bottom of
                this page to finalize the contract.
              </Typography>
            </Paper>

            {/* Guardian signature cards */}
            <Box mt={5} mb={4}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ borderBottom: "2px solid #3f51b5", pb: 1, color: "#3f51b5" }}
              >
                Guardian Signatures
              </Typography>

              {guardianIds.map((guardianId) => {
                const signature = signatures[guardianId];
                const isSigned = !!signature;

                return (
                  <Paper
                    key={guardianId}
                    elevation={2}
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: 2,
                      border: isSigned ? "1px solid #81c784" : "1px dashed #bdbdbd",
                      backgroundColor: isSigned ? "#f1f8e9" : "#fff",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" flexWrap="wrap">
                      {/* Guardian info */}
                      <Box flexGrow={1} minWidth="200px">
                        <Typography variant="h6">
                          {guardianNames[guardianId] || `Guardian ${guardianId}`}
                        </Typography>
                        {isSigned && (
                          <Typography
                            variant="body-sm"
                            color="success.main"
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <span style={{ fontSize: "1.2rem" }}>✓</span>
                            Signed on {new Date(signature.date).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>

                      {/* Signature preview */}
                      {isSigned && (
                        <Box
                          width={140}
                          height={70}
                          mr={2}
                          borderRadius={1}
                          overflow="hidden"
                          border="1px solid #e0e0e0"
                          bgcolor="#fff"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <img
                            src={signature.data}
                            alt={`${guardianNames[guardianId]}'s signature`}
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                          />
                        </Box>
                      )}

                      {/* Action button */}
                      <Button
                        variant={isSigned ? "outlined" : "contained"}
                        color={isSigned ? "primary" : "primary"}
                        size="medium"
                        onClick={() => setActiveGuardian(guardianId)}
                        sx={{
                          fontWeight: "bold",
                          px: 3,
                          boxShadow: isSigned ? "none" : 2,
                        }}
                        startIcon={isSigned ? null : <span>✍️</span>}
                      >
                        {isSigned ? "View & Edit" : "Sign Now"}
                      </Button>
                    </Box>
                  </Paper>
                );
              })}

              {guardianIds.length === 0 && (
                <Paper
                  sx={{
                    p: 3,
                    mt: 2,
                    bgcolor: "#fff8f8",
                    border: "1px solid #ffcdd2",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: "bold", color: "error.main" }}
                  >
                    No Guardians Found
                  </Typography>
                  <Typography variant="body-md">
                    There are no guardians associated with this family record. Please add guardians
                    to the family profile before attempting to sign the contract.
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Status summary */}
            <Paper
              elevation={1}
              sx={{
                p: 3,
                mt: 3,
                bgcolor: allSigned ? "#f1f8e9" : "#fff",
                borderRadius: 2,
                border: allSigned ? "1px solid #c5e1a5" : "1px solid #e0e0e0",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <Box>
                  <Typography variant="h6" color={allSigned ? "success.main" : "text.primary"}>
                    {allSigned
                      ? "All signatures complete!"
                      : `${signedGuardians.length} of ${guardianIds.length} guardians signed`}
                  </Typography>
                  <Typography variant="body-sm" color="text.secondary">
                    {allSigned ? "Your contract is ready to be submitted" : ""}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {error && (
          <Box mt={2}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {activeGuardian && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: "#fff",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Box maxWidth="800px" mx="auto" display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => setActiveGuardian(null)} disabled={saving}>
              Back to Overview
            </Button>
          </Box>
        </Box>
      )}

      {/* Only show the Close button on the overview page when not all have signed */}
      {!activeGuardian && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: "#fff",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Box maxWidth="800px" mx="auto" display="flex" justifyContent="flex-end" gap={2}>
            <Button onClick={handleClose} color="inherit" disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color={allSigned ? "success" : "primary"}
              onClick={handleSaveAll}
              disabled={saving}
              startIcon={<AssignmentTurnedInIcon />}
            >
              {allSigned ? "Complete Signing Process" : "Save Signatures"}
            </Button>
          </Box>
        </Box>
      )}
    </Dialog>
  );
}

export default ContractSignDialog;
