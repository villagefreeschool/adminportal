import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, LinearProgress, Typography } from '@mui/material';
import { Contract as ContractType, Family, Year } from '../services/firebase/models/types';
import { fetchContract } from '../services/firebase/contracts';
import { fetchFamily } from '../services/firebase/families';
import { fetchYear } from '../services/firebase/years';
import LabeledData from './LabeledData';
import ContractEditDialog from './dialogs/ContractEditDialog';
import ContractPDFGenerator from './ContractPDFGenerator';
import { useAuth } from '../contexts/useAuth';
import { formatCurrency } from '../services/tuitioncalc';

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
              item
              xs={12 / family.students.length}
              sm={8 / family.students.length}
              key={student.id}
            >
              <LabeledData label={student.preferredName || student.firstName} textAlign="center">
                {contract ? contract.studentDecisions[student.id] : 'Unknown'}
              </LabeledData>
            </Grid>
          ))}

          <Grid item>
            <LabeledData label="Total Tuition" textAlign="center">
              {formatCurrency(contract.tuition || 0)}
            </LabeledData>
          </Grid>
        </Grid>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        {canEditRegistration && (
          <Button variant="contained" color="primary" onClick={handleEdit}>
            Edit Registration
          </Button>
        )}
      </Box>

      {contract && (
        <Box display="flex" justifyContent="center" mt={2}>
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
    </Box>
  );
};

export default Contract;
