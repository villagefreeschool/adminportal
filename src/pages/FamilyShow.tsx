import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
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
  Breadcrumbs,
  Link,
  Tooltip,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import { Family, EmergencyContact, MedicalProvider } from '../services/firebase/models/types';
import {
  fetchFamily,
  deleteFamily,
  saveFamily,
  calculatedNameForFamily,
} from '../services/firebase/families';
import FamilyDialog from '../components/dialogs/FamilyDialog';
import FamilyDeleteDialog from '../components/dialogs/FamilyDeleteDialog';
import { useAuth } from '../contexts/useAuth';
import LabeledData from '../components/LabeledData';
import Guardian from '../components/Guardian';
import Student from '../components/Student';

function FamilyShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const theme = useTheme();

  // State variables
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch family on mount or when ID changes
  useEffect(() => {
    if (id) {
      loadFamily(id);
    }
  }, [id]);

  // Load family data
  const loadFamily = async (familyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchFamily(familyId);
      if (data) {
        setFamily(data);
      } else {
        setError('Family not found');
      }
    } catch (error) {
      console.error('Error fetching family:', error);
      setError('Error loading family data');
    } finally {
      setLoading(false);
    }
  };

  // Update family
  const handleUpdateFamily = async (familyData: Family) => {
    try {
      await saveFamily(familyData);
      await loadFamily(familyData.id);
    } catch (error) {
      console.error('Error updating family:', error);
      throw error;
    }
  };

  // Delete family
  const handleDeleteFamily = async (familyData: Family) => {
    try {
      await deleteFamily(familyData);
      navigate('/families');
    } catch (error) {
      console.error('Error deleting family:', error);
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

  // Format emergency contact for display
  const formatContact = (contact: EmergencyContact): string => {
    let text = contact.firstName;
    if (contact.lastName) {
      text += ` ${contact.lastName}`;
    }
    if (contact.relationship) {
      text += ` (${contact.relationship})`;
    }
    if (contact.cellPhone) {
      text += `, ${contact.cellPhone}`;
    }
    return text;
  };

  // Format medical provider for display
  const formatProvider = (provider: MedicalProvider): string => {
    let text = provider.name;
    if (provider.type) {
      text += ` (${provider.type})`;
    }
    if (provider.phone) {
      text += `, ${provider.phone}`;
    }
    return text;
  };

  // Render loading state
  if (loading) {
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
          {error || 'Family not found'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/families')}
          sx={{ mt: 2 }}
        >
          Back to Families
        </Button>
      </Paper>
    );
  }

  // Calculate family name for display
  const familyName = calculatedNameForFamily(family);

  return (
    <>
      <Box mb={2}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/families" underline="hover" color="inherit">
            Families
          </Link>
          <Typography color="text.primary">{familyName}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 2,
            bgcolor: theme.palette.green[900],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            {familyName}
          </Typography>
          <Box>
            {isAdmin && (
              <>
                <Tooltip title="Family Registrations">
                  <IconButton
                    component={RouterLink}
                    to={`/families/${family.id}/registrations`}
                    sx={{ color: 'white', mr: 1 }}
                  >
                    <DescriptionIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Family">
                  <IconButton
                    onClick={() => setEditDialogOpen(true)}
                    sx={{ color: 'white', mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Family">
                  <IconButton onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'white' }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Family Information */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Family Information" />
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
                  <CardHeader title={`Student #${index + 1}`} />
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
                          {formatContact(contact)}
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
                          {formatProvider(provider)}
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
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/families')}
                >
                  Back to Families
                </Button>
                {isAdmin && (
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={`/families/${family.id}/registrations`}
                      startIcon={<DescriptionIcon />}
                      sx={{
                        bgcolor: theme.palette.brown[500],
                        '&:hover': { bgcolor: theme.palette.brown[700] },
                        mr: 1,
                      }}
                    >
                      Registrations
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setEditDialogOpen(true)}
                      sx={{
                        bgcolor: theme.palette.green[800],
                        '&:hover': { bgcolor: theme.palette.green[900] },
                      }}
                    >
                      Edit Family
                    </Button>
                  </Box>
                )}
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

      {/* Delete Family Dialog */}
      <FamilyDeleteDialog
        open={deleteDialogOpen}
        family={family}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteFamily}
      />
    </>
  );
}

export default FamilyShow;
