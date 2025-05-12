import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { Student as StudentType } from "@services/firebase/models/types";
import LabeledData from "./LabeledData";

interface StudentProps {
  student: StudentType;
}

/**
 * A component for displaying student information
 * Migrated from Vue Student component
 */
function Student({ student }: StudentProps) {
  return (
    <Box sx={{ width: "100%" }}>
      {/* Student Name Header */}
      <Grid container>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" component="div">
            {student.preferredName || student.firstName}
            {student.pronoun && (
              <Typography variant="subtitle1" component="span" sx={{ ml: 1 }}>
                ({student.pronoun})
              </Typography>
            )}
          </Typography>
        </Grid>
      </Grid>

      {/* Name Fields - Split into thirds */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 4 }}>
          <Box>
            <LabeledData label="First">{student.firstName}</LabeledData>
          </Box>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <LabeledData label="Middle">{student.middleName || "-"}</LabeledData>
          </Box>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Box sx={{ textAlign: "right" }}>
            <LabeledData label="Last">{student.lastName}</LabeledData>
          </Box>
        </Grid>
      </Grid>

      {/* Other Student Information */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {student.email && (
          <Grid size={{ xs: 12 }}>
            <LabeledData label="Email Address">{student.email}</LabeledData>
          </Grid>
        )}

        {student.severeAllergies && (
          <Grid size={{ xs: 12, md: 6 }}>
            <LabeledData label="Severe Allergies" error>
              {student.severeAllergies}
            </LabeledData>
          </Grid>
        )}

        {student.nonSevereAllergies && (
          <Grid size={{ xs: 12, md: 6 }}>
            <LabeledData label="Non-Severe Allergies">{student.nonSevereAllergies}</LabeledData>
          </Grid>
        )}

        {student.priorSchool && (
          <Grid size={{ xs: 12, md: 6 }}>
            <LabeledData label="Prior School">{student.priorSchool}</LabeledData>
          </Grid>
        )}

        {student.learningDisabilities && (
          <Grid size={{ xs: 12, md: 6 }}>
            <LabeledData label="Learning Disabilities">{student.learningDisabilities}</LabeledData>
          </Grid>
        )}

        {student.additionalInfo && (
          <Grid size={{ xs: 12, md: 6 }}>
            <LabeledData label="Additional Information">{student.additionalInfo}</LabeledData>
          </Grid>
        )}

        {student.otherMedicalConditions && (
          <Grid size={{ xs: 12, md: 6 }}>
            <LabeledData label="Other Medical Conditions">
              {student.otherMedicalConditions}
            </LabeledData>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default Student;
