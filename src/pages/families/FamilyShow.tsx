import Guardian from "@components/Guardian";
import LabeledData from "@components/LabeledData";
import Student from "@components/Student";
import FamilyDeleteDialog from "@components/dialogs/FamilyDeleteDialog";
import FamilyDialog from "@components/dialogs/FamilyDialog";
import { useAuth } from "@contexts/useAuth";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import { deleteFamily, fetchFamily, saveFamily } from "@services/firebase/families";
import type { Family } from "@services/firebase/models/types";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function FamilyShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, currentUser } = useAuth();
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
        setError("Family not found");
      }
    } catch (error) {
      console.error("Error fetching family:", error);
      setError("Error loading family data");
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
      console.error("Error updating family:", error);
      throw error;
    }
  };

  // Delete family
  const handleDeleteFamily = async (familyData: Family) => {
    try {
      await deleteFamily(familyData);
      navigate("/families");
    } catch (error) {
      console.error("Error deleting family:", error);
      throw error;
    }
  };

  // Create a new family
  const handleNewFamily = () => {
    setEditDialogOpen(true);
  };

  // Calculate emergency contacts for display
  const emergencyContacts = family?.emergencyContacts
    ? family.emergencyContacts.map((c, i) => ({
        ...c,
        order: i + 1,
        name: `${c.firstName} ${c.lastName}`,
      }))
    : [];

  // Emergency contact headers
  const emergencyContactHeaders = [
    { text: "#", field: "order" },
    { text: "Name", field: "name" },
    { text: "Relationship", field: "relationship" },
    { text: "Cell", field: "cellPhone" },
    { text: "Work", field: "workPhone" },
    { text: "Notes", field: "notes" },
  ];

  // Medical provider headers
  const medicalProviderHeaders = [
    { text: "Name", field: "name" },
    { text: "Office", field: "office" },
    { text: "Phone", field: "phoneNumber" },
  ];

  // Render loading state
  if (loading) {
    return (
      <Container>
        <Box py={2}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  // Render create family prompt
  if (!loading && !family && currentUser) {
    return (
      <Container sx={{ padding: 2 }}>
        <Grid container justifyContent="center" textAlign="center">
          <Grid size={{ xs: 12, sm: 10, md: 6 }}>
            <Typography variant="h4">Create a New Family Profile?</Typography>
            <Box sx={{ my: 2 }}>
              <Typography>
                You logged in with the email address
                <strong> {currentUser?.email}</strong>
                <br />
                This email address is not yet associated with a family profile.
              </Typography>
            </Box>
            <Box sx={{ my: 2 }}>
              <Typography>
                If you&apos;re a new family, welcome! Please create your family&apos;s profile.
              </Typography>
            </Box>
            <Box sx={{ my: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleNewFamily}
                sx={{
                  bgcolor: theme.palette.green[900],
                  "&:hover": { bgcolor: theme.palette.green[800] },
                }}
                startIcon={<span className="fas fa-plus-square" />}
              >
                Create Family Profile
              </Button>
            </Box>
            <Typography color="error" variant="caption">
              If you&apos;re a returning family, or another parent or guardian has already entered
              your family&apos;s info, ask them to make sure the email address above is added to the
              profile they created.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Render error state
  if (error || !family) {
    return (
      <Container>
        <Typography variant="h5" color="error">
          {error || "Family not found"}
        </Typography>
      </Container>
    );
  }

  // Calculate columns for student and guardian display
  const studentCols = Math.max(3, 12 / family.students.length);
  const guardianCols = Math.max(3, 12 / family.guardians.length);

  return (
    <Container>
      {/* EXISTING FAMILY DISPLAY */}
      <Box sx={{ my: 2 }}>
        <Card>
          <Toolbar
            sx={{
              bgcolor: theme.palette.green[900],
              color: "white",
            }}
          >
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              {family.name}
            </Typography>
            <Button
              size="small"
              sx={{
                bgcolor: theme.palette.brown[500],
                color: "white",
                "&:hover": { bgcolor: theme.palette.brown[700] },
              }}
              onClick={() => setEditDialogOpen(true)}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          </Toolbar>

          <CardContent sx={{ p: 3 }}>
            {/* Students */}
            <Grid container spacing={2}>
              {family.students.map((student, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Student objects are read-only in this view
                <Grid size={{ xs: 12, sm: studentCols }} key={`student-${i}`}>
                  <Card variant="outlined">
                    <CardContent>
                      <Student student={student} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {/* End Students */}

            <Divider sx={{ my: 2 }} />

            {/* Parents and Guardians */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">Parents and Guardians</Typography>
              </Grid>
              {family.guardians.map((guardian, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Guardian objects are read-only in this view
                <Grid size={{ xs: 12, sm: guardianCols }} key={`guardian-${i}`}>
                  <Card variant="outlined">
                    <CardContent>
                      <Guardian guardian={guardian} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {/* End Parents and Guardians */}

            <Divider sx={{ my: 2 }} />

            {/* Emergency Contacts */}
            {family.emergencyContacts && family.emergencyContacts.length > 0 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6">Emergency Contacts</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {emergencyContactHeaders.map((header) => (
                            <TableCell key={header.field}>{header.text}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {emergencyContacts.map((contact, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: Contact objects are read-only in this view
                          <TableRow key={index}>
                            <TableCell>{contact.order}</TableCell>
                            <TableCell>{contact.name}</TableCell>
                            <TableCell>{contact.relationship}</TableCell>
                            <TableCell>{contact.cellPhone}</TableCell>
                            <TableCell>{contact.workPhone}</TableCell>
                            <TableCell>{contact.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
              </Grid>
            )}
            {/* End Emergency Contacts */}

            {/* Pickup List */}
            {family.pickupList && (
              <>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">Pick Up List</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography sx={{ whiteSpace: "pre" }} variant="body-sm">
                          {family.pickupList}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />
              </>
            )}
            {/* End Pickup List */}

            {/* Medical Insurance */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">Insurance</Typography>
              </Grid>

              {family.medicalInsuranceProvider && (
                <LabeledData xs={12} sm={6} md={3} label="Insurance Provider">
                  {family.medicalInsuranceProvider}
                </LabeledData>
              )}

              {family.medicalInsuranceNameOfPrimaryInsured && (
                <LabeledData xs={12} sm={6} md={3} label="Name of Primary Insured">
                  {family.medicalInsuranceNameOfPrimaryInsured}
                </LabeledData>
              )}

              {family.medicalInsurancePolicyNumber && (
                <LabeledData xs={12} sm={6} md={3} label="Policy Number">
                  {family.medicalInsurancePolicyNumber}
                </LabeledData>
              )}

              {family.medicalInsuranceGroupNumber && (
                <LabeledData xs={12} sm={6} md={3} label="Group Number">
                  {family.medicalInsuranceGroupNumber}
                </LabeledData>
              )}
            </Grid>
            {/* End Medical Insurance */}

            {/* Medical Providers */}
            {family.medicalProviders && family.medicalProviders.length > 0 && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6">Medical Providers</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {medicalProviderHeaders.map((header) => (
                            <TableCell key={header.field}>{header.text}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {family.medicalProviders.map((provider, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: Provider objects are read-only in this view
                          <TableRow key={index}>
                            <TableCell>{provider.name}</TableCell>
                            <TableCell>{provider.office}</TableCell>
                            <TableCell>{provider.phoneNumber}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )}
            {/* End Medical Providers */}
          </CardContent>
        </Card>
      </Box>

      {/* Delete Family Control for Admins */}
      {family && isAdmin && (
        <Box textAlign="center" sx={{ mb: 3 }}>
          <Button
            color="error"
            variant="contained"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<DeleteIcon />}
          >
            Delete Family
          </Button>
        </Box>
      )}

      {/* Edit Family Dialog */}
      <FamilyDialog
        open={editDialogOpen}
        title={`Edit ${family.name}`}
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
    </Container>
  );
}

export default FamilyShow;
