import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Family } from '../services/firebase/models/types';
import { fetchFamily, saveFamily, calculatedNameForFamily } from '../services/firebase/families';
import FamilyDialog from '../components/dialogs/FamilyDialog';
import { useAuth } from '../contexts/useAuth';
import LabeledData from '../components/LabeledData';
import Guardian from '../components/Guardian';
import Student from '../components/Student';

function MyFamily() {
  const { myFamily: contextFamily, isLoading: authLoading } = useAuth();

  // State variables
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch family on mount or when ID changes
  useEffect(() => {
    if (authLoading) return;

    if (contextFamily) {
      // If myFamily is already in the auth context, use it
      setFamily(contextFamily);
      setLoading(false);
    } else if (contextFamily === null) {
      // If myFamily is explicitly null, user has no family
      setError('You do not have a family record in the system yet.');
      setLoading(false);
    }
  }, [contextFamily, authLoading]);

  // Update family
  const handleUpdateFamily = async (familyData: Family) => {
    try {
      await saveFamily(familyData);
      // Reload the family data
      const updatedFamily = await fetchFamily(familyData.id);
      setFamily(updatedFamily);
    } catch (error) {
      console.error('Error updating family:', error);
      throw error;
    }
  };

  // Format address for display
  const formatAddress = (family: Family): string => {
    if (!family.address) return 'No address on file';

    let address = family.address;
    if (family.city || family.state || family.zip) {
      address += `, ${family.city || ''} ${family.state || ''} ${family.zip || ''}`;
    }
    return address;
  };

  // Render loading state
  if (loading || authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error || !family) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: { xs: 3, sm: 4 },
          mt: 2,
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          {error || 'Family information not available'}
        </Typography>
        <Typography variant="body1" paragraph>
          Please contact an administrator if you believe this is an error.
        </Typography>
      </Paper>
    );
  }

  // Calculate family name for display
  const familyName = calculatedNameForFamily(family);

  return (
    <>
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box
          sx={{ p: 2, bgcolor: 'green.900', color: 'white', display: 'flex', alignItems: 'center' }}
        >
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            {familyName}
          </Typography>
          <Box>
            <Tooltip title="Edit Family">
              <IconButton onClick={() => setEditDialogOpen(true)} sx={{ color: 'white', mr: 1 }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Family Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Family Information" sx={{ bgcolor: 'grey.100' }} />
                <CardContent>
                  <Grid container spacing={2}>
                    <LabeledData label="Family Name" xs={12} sm={6}>
                      {family.name}
                    </LabeledData>
                    <LabeledData label="Address" xs={12} sm={6}>
                      {formatAddress(family)}
                    </LabeledData>
                    {family.phone && (
                      <LabeledData label="Phone" xs={12} sm={6}>
                        {family.phone}
                      </LabeledData>
                    )}
                    {family.grossFamilyIncome !== undefined && (
                      <LabeledData label="Gross Family Income" xs={12} sm={6}>
                        {family.slidingScaleOptOut
                          ? 'Opted out of sliding scale'
                          : family.grossFamilyIncome !== null
                            ? new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(family.grossFamilyIncome)
                            : 'Not provided'}
                      </LabeledData>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Students Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Students
              </Typography>

              {family.students.map((student, index) => (
                <Card key={student.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardHeader title={`Student #${index + 1}`} sx={{ bgcolor: 'grey.100' }} />
                  <CardContent>
                    <Student student={student} />
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* Guardians Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Guardians
              </Typography>

              <Grid container spacing={2}>
                {family.guardians.map((guardian, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardHeader
                        title={`${guardian.firstName} ${guardian.lastName}`}
                        subheader={guardian.relationship}
                        sx={{ bgcolor: 'grey.100' }}
                      />
                      <CardContent>
                        <Guardian guardian={guardian} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Emergency Contacts Section */}
            {family.emergencyContacts && family.emergencyContacts.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Emergency Contacts
                </Typography>

                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      {family.emergencyContacts.map((contact, index) => (
                        <LabeledData key={index} label={`Contact #${index + 1}`} xs={12} md={6}>
                          {contact.firstName} {contact.lastName}
                          {contact.relationship && ` (${contact.relationship})`}
                          {contact.cellPhone && `, ${contact.cellPhone}`}
                        </LabeledData>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Medical Providers Section */}
            {family.medicalProviders && family.medicalProviders.length > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Medical Providers
                </Typography>

                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      {family.medicalProviders.map((provider, index) => (
                        <LabeledData
                          key={index}
                          label={provider.type || `Provider #${index + 1}`}
                          xs={12}
                          md={6}
                        >
                          {provider.name}
                          {provider.type && ` (${provider.type})`}
                          {provider.phone && `, ${provider.phone}`}
                        </LabeledData>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Medical Insurance Section */}
            {(family.medicalInsuranceProvider ||
              family.medicalInsuranceNameOfPrimaryInsured ||
              family.medicalInsurancePolicyNumber ||
              family.medicalInsuranceGroupNumber) && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Medical Insurance
                </Typography>

                <Card variant="outlined">
                  <CardContent>
                    <Grid container spacing={2}>
                      {family.medicalInsuranceProvider && (
                        <LabeledData label="Insurance Provider" xs={12} sm={6}>
                          {family.medicalInsuranceProvider}
                        </LabeledData>
                      )}

                      {family.medicalInsuranceNameOfPrimaryInsured && (
                        <LabeledData label="Primary Insured" xs={12} sm={6}>
                          {family.medicalInsuranceNameOfPrimaryInsured}
                        </LabeledData>
                      )}

                      {family.medicalInsurancePolicyNumber && (
                        <LabeledData label="Policy Number" xs={12} sm={6}>
                          {family.medicalInsurancePolicyNumber}
                        </LabeledData>
                      )}

                      {family.medicalInsuranceGroupNumber && (
                        <LabeledData label="Group Number" xs={12} sm={6}>
                          {family.medicalInsuranceGroupNumber}
                        </LabeledData>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Pickup List Section */}
            {family.pickupList && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Additional Adults Authorized to Pick Up
                </Typography>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body1" whiteSpace="pre-wrap">
                      {family.pickupList}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                  sx={{
                    bgcolor: 'green.800',
                    '&:hover': { bgcolor: 'green.900' },
                  }}
                >
                  Edit Family
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Edit Family Dialog */}
      <FamilyDialog
        open={editDialogOpen}
        title={`Edit ${familyName}`}
        family={family}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateFamily}
        fullScreen={true}
      />
    </>
  );
}

export default MyFamily;
