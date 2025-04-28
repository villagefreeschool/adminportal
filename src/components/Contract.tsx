import React, { useState, useEffect } from 'react';
import { Box, Button, LinearProgress, Typography, Divider } from '@mui/material';
import { Grid } from '@mui/material';
import {
  Contract as ContractType,
  Family,
  SignatureData,
  Year,
} from '../services/firebase/models/types';
import { fetchContract, saveContractSignatures } from '../services/firebase/contracts';
import { fetchFamily } from '../services/firebase/families';
import { fetchYear } from '../services/firebase/years';
import LabeledData from './LabeledData';
import ContractEditDialog from './dialogs/ContractEditDialog';
import ContractSignDialog from './dialogs/ContractSignDialog';
import ContractPDFGenerator from './ContractPDFGenerator';
import { useAuth } from '../contexts/useAuth';
import { formatCurrency } from '../services/tuitioncalc';
import HowToRegIcon from '@mui/icons-material/HowToReg';

interface ContractProps {
  familyId: string;
  yearId: string;
}

/**
 * Contract component displays student enrollment status and contract details
 */
const Contract: React.FC<ContractProps> = ({ familyId, yearId }) => {
  const [loading, setLoading] = useState(false);
  const [family, setFamily] = useState<Family | null>(null);
  const [year, setYear] = useState<Year | null>(null);
  const [contract, setContract] = useState<ContractType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [activeGuardian, setActiveGuardian] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  // Fetch data when component mounts or props change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch family, year and contract in parallel
        const [familyData, yearData, contractData] = await Promise.all([
          fetchFamily(familyId),
          fetchYear(yearId),
          fetchContract(yearId, familyId),
        ]);

        setFamily(familyData);
        setYear(yearData);
        setContract(contractData);
      } catch (error) {
        console.error('Error loading contract data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [familyId, yearId]);

  // Determine if user can register
  const canRegister = year && (year.isAcceptingRegistrations || isAdmin) && !contract;

  // Determine if user can edit registration
  const canEditRegistration =
    contract && (isAdmin || (year?.isAcceptingRegistrations && !contract.isSigned));

  // Determine if user can sign the contract
  const canSignContract = contract && (isAdmin || year?.isAcceptingRegistrations);

  // Check if contract has signatures
  const hasSignatures =
    contract && contract.signatures && Object.keys(contract.signatures || {}).length > 0;

  // Create a map of guardian names for display
  const guardianNames: Record<string, string> = {};
  const guardianIds: string[] = [];

  if (family?.guardians) {
    // Generate IDs for guardians if they don't have one
    family.guardians.forEach((guardian, index) => {
      // Use existing ID or generate a new one using index
      const guardianId = guardian.id || `guardian-${index}`;
      guardianIds.push(guardianId);
      guardianNames[guardianId] = `${guardian.firstName} ${guardian.lastName}`;
    });
  }

  // Log for debugging
  console.log('Contract Component Debug:', {
    familyId,
    yearId,
    'family?.guardians': family?.guardians,
    'guardians with IDs': family?.guardians?.filter((g) => g.id),
    'guardian IDs array': family?.guardians?.map((g) => g.id),
    guardianIds,
    guardianNames,
  });

  // Open contract edit dialog
  const handleEdit = () => {
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setDialogOpen(false);
  };

  // Handle contract save
  const handleSave = (updatedContract: ContractType) => {
    setContract(updatedContract);
  };

  // Open signature dialog - now just opens the dialog without selecting a guardian
  const handleOpenSignDialog = () => {
    // Just open the dialog, don't pre-select a guardian
    // This will show the overview page with all guardians
    setActiveGuardian(null);
    setSignDialogOpen(true);
  };

  // Handle closing signature dialog
  const handleCloseSignDialog = () => {
    setSignDialogOpen(false);
    setActiveGuardian(null);
  };

  // Handle saving signatures
  const handleSaveSignatures = async (signatures: Record<string, SignatureData>) => {
    if (!contract || !yearId || !familyId) return;

    try {
      await saveContractSignatures(yearId, familyId, signatures);

      // Update the local contract with the signatures
      setContract({
        ...contract,
        signatures,
        isSigned: true,
      });
    } catch (error) {
      console.error('Error saving signatures:', error);
      throw error;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box>
        <LinearProgress />
      </Box>
    );
  }

  // Show empty state when no contract exists
  if (!contract) {
    return (
      <Box>
        <Typography align="center" gutterBottom>
          Registration for this school year has not yet been submitted.
        </Typography>

        {canRegister && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" color="primary" onClick={handleEdit}>
              Register Now
            </Button>
          </Box>
        )}

        <ContractEditDialog
          open={dialogOpen}
          yearId={yearId}
          familyId={familyId}
          onClose={handleClose}
          onSave={handleSave}
        />
      </Box>
    );
  }

  // Show contract details
  return (
    <Box>
      {family && family.students && (
        <Grid container spacing={2} justifyContent="space-around">
          {family.students.map((student) => (
            <Grid
              size={{ xs: 12 / family.students.length, sm: 8 / family.students.length }}
              key={student.id}
            >
              <LabeledData label={student.preferredName || student.firstName} textAlign="center">
                {contract ? contract.studentDecisions[student.id] : 'Unknown'}
              </LabeledData>
            </Grid>
          ))}

          <Grid>
            <LabeledData label="Total Tuition" textAlign="center">
              {formatCurrency(contract.tuition || 0)}
            </LabeledData>
          </Grid>
        </Grid>
      )}

      <Box display="flex" justifyContent="center" mt={2} gap={2} flexWrap="wrap">
        {canEditRegistration && (
          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit Registration
          </Button>
        )}

        {canSignContract && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenSignDialog}
            startIcon={<HowToRegIcon />}
            sx={{
              fontWeight: 'bold',
              fontSize: '1rem',
              py: 1,
              px: 3,
              boxShadow: 2,
            }}
          >
            {hasSignatures ? 'Edit Signatures' : 'Sign Contract'}
          </Button>
        )}
      </Box>

      {/* Signature status display */}
      {hasSignatures && (
        <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1" fontWeight="bold">
              Signatures
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {guardianIds.map((guardianId) => {
            const signature = contract?.signatures?.[guardianId];
            return (
              <Box key={guardianId} display="flex" alignItems="center" mb={2}>
                <Box flexGrow={1} display="flex" alignItems="center">
                  <Typography variant="body-sm" sx={{ width: '40%' }}>
                    {guardianNames[guardianId]}:
                  </Typography>
                  {signature ? (
                    <>
                      <Typography variant="body-sm" color="success.main">
                        Signed on {new Date(signature.date).toLocaleDateString()}
                      </Typography>
                      <Box
                        ml={1}
                        width={120}
                        height={50}
                        border="1px solid #eee"
                        borderRadius={1}
                        p={1}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <img
                          src={signature.data}
                          alt={`${guardianNames[guardianId]}'s signature`}
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        />
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body-sm" color="text.secondary">
                      Not signed
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Open the dialog with the specific guardian selected
                    setActiveGuardian(guardianId);
                    setSignDialogOpen(true);
                  }}
                >
                  {signature ? 'Edit' : 'Sign'}
                </Button>
              </Box>
            );
          })}
        </Box>
      )}

      {contract && year && family && (
        <Box display="flex" justifyContent="center" mt={3}>
          <ContractPDFGenerator year={year} family={family} contract={contract} />
        </Box>
      )}

      <ContractEditDialog
        open={dialogOpen}
        yearId={yearId}
        familyId={familyId}
        onClose={handleClose}
        onSave={handleSave}
      />

      {/* Signature Dialog */}
      {contract && (
        <ContractSignDialog
          open={signDialogOpen}
          onClose={handleCloseSignDialog}
          onSave={handleSaveSignatures}
          _contract={contract}
          guardianIds={guardianIds}
          guardianNames={guardianNames}
          existingSignatures={contract.signatures}
          initialGuardian={activeGuardian}
        />
      )}
    </Box>
  );
};

export default Contract;
