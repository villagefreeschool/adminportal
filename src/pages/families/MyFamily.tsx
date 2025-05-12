import FamilyDialog from "@/components/families/FamilyDialog";
import Guardian from "@components/Guardian";
import LabeledData from "@components/LabeledData";
import Student from "@components/Student";
import { useAuth } from "@contexts/useAuth";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/material";
import { calculatedNameForFamily, fetchFamily, saveFamily } from "@services/firebase/families";
import type { Family } from "@services/firebase/models/types";
import React, { useState, useEffect } from "react";

function MyFamily() {
  const { myFamily: contextFamily, isLoading: authLoading } = useAuth();

  // State variables
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load family data when the component mounts
  useEffect(() => {
    if (contextFamily) {
      loadFamily(contextFamily.id);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [contextFamily, authLoading]);

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
    } catch (err) {
      console.error("Error loading family:", err);
      setError("Error loading family data");
    } finally {
      setLoading(false);
    }
  };

  // Update family
  const handleUpdateFamily = async (updatedFamily: Family) => {
    try {
      await saveFamily(updatedFamily);
      await loadFamily(updatedFamily.id);
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating family:", err);
      throw err;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show not logged in or no family state
  if (!family) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          No Family Profile Found
        </Typography>
        <Typography>
          {authLoading
            ? "Loading your profile..."
            : "You do not have a family profile yet. Please contact the school to set up your account."}
        </Typography>
      </Paper>
    );
  }

  // Calculate the display name for the family
  const familyName = calculatedNameForFamily(family);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {familyName}
          </Typography>
          <Tooltip title="Edit family information">
            <IconButton onClick={() => setEditDialogOpen(true)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Family Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <LabeledData label="Family Name" xs={12}>
                    {family.name}
                  </LabeledData>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Students" />
              <CardContent>
                <Grid container spacing={2}>
                  {family.students.map((student, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Student objects are read-only in this view
                    <Grid size={{ xs: 12, md: 6 }} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Student student={student} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Parents and Guardians" />
              <CardContent>
                <Grid container spacing={2}>
                  {family.guardians.map((guardian, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: Guardian objects are read-only in this view
                    <Grid size={{ xs: 12, md: 6 }} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Guardian guardian={guardian} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {family.emergencyContacts && family.emergencyContacts.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title="Emergency Contacts" />
                <CardContent>
                  <Grid container spacing={2}>
                    {family.emergencyContacts.map((contact, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: Contact objects are read-only in this view
                      <Grid size={{ xs: 12, md: 6 }} key={index}>
                        <LabeledData label={`Contact ${index + 1}`}>
                          {contact.firstName} {contact.lastName}
                          {contact.relationship && <span> ({contact.relationship})</span>}
                          <br />
                          {contact.cellPhone && <span>Cell: {contact.cellPhone}</span>}
                          {contact.workPhone && (
                            <span>
                              <br />
                              Work: {contact.workPhone}
                            </span>
                          )}
                          {contact.notes && (
                            <span>
                              <br />
                              {contact.notes}
                            </span>
                          )}
                        </LabeledData>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {family.medicalProviders && family.medicalProviders.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title="Medical Providers" />
                <CardContent>
                  <Grid container spacing={2}>
                    {family.medicalProviders.map((provider, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: Provider objects are read-only in this view
                      <Grid size={{ xs: 12, md: 6 }} key={index}>
                        <LabeledData
                          label={
                            provider.type
                              ? `${provider.type} (${index + 1})`
                              : `Provider ${index + 1}`
                          }
                        >
                          {provider.name}
                          {provider.phone && (
                            <span>
                              <br />
                              Phone: {provider.phone}
                            </span>
                          )}
                        </LabeledData>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {family.pickupList && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title="Pick Up List" />
                <CardContent>
                  <Typography variant="body-md" component="pre" sx={{ whiteSpace: "pre-wrap" }}>
                    {family.pickupList}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditDialogOpen(true)}
          startIcon={<EditIcon />}
        >
          Edit Family Information
        </Button>
      </Box>

      <FamilyDialog
        open={editDialogOpen}
        title={`Edit ${familyName}`}
        family={family}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateFamily}
        fullScreen
      />
    </Box>
  );
}

export default MyFamily;
