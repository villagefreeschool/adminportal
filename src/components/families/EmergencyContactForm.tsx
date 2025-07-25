import RelationshipDropdown from "@components/families/RelationshipDropdown";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import type { EmergencyContact } from "@services/firebase/models/types";

interface EmergencyContactFormProps {
  contact: EmergencyContact;
  onChange: (contact: EmergencyContact) => void;
}

/**
 * Form for entering emergency contact information
 * Migrated from Vue EmergencyContactForm
 */
function EmergencyContactForm({ contact, onChange }: EmergencyContactFormProps) {
  // Handle field changes
  const handleChange = (field: keyof EmergencyContact, value: string) => {
    onChange({
      ...contact,
      [field]: value,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="First Name"
          value={contact.firstName || ""}
          onChange={(e) => handleChange("firstName", e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Last Name"
          value={contact.lastName || ""}
          onChange={(e) => handleChange("lastName", e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Cell Phone"
          value={contact.cellPhone || ""}
          onChange={(e) => handleChange("cellPhone", e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Work Phone"
          value={contact.workPhone || ""}
          onChange={(e) => handleChange("workPhone", e.target.value)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RelationshipDropdown
          value={contact.relationship || ""}
          onChange={(value) => handleChange("relationship", value)}
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Notes"
          value={contact.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          multiline
          rows={2}
          fullWidth
        />
      </Grid>
    </Grid>
  );
}

export default EmergencyContactForm;
