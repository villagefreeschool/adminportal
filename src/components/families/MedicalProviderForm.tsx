import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import type { MedicalProvider } from "@services/firebase/models/types";

interface MedicalProviderFormProps {
  provider: MedicalProvider;
  onChange: (provider: MedicalProvider) => void;
}

/**
 * Form for entering medical provider information
 * Migrated from Vue MedicalProviderForm
 */
function MedicalProviderForm({ provider, onChange }: MedicalProviderFormProps) {
  // Provider types
  const providerTypes = ["Pediatrician", "Family Doctor", "Dentist", "Specialist", "Other"];

  // Handle field changes
  const handleChange = (field: keyof MedicalProvider, value: string) => {
    onChange({
      ...provider,
      [field]: value,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <TextField
          select
          label="Provider Type"
          value={provider.type || ""}
          onChange={(e) => handleChange("type", e.target.value)}
          fullWidth
          required
        >
          {providerTypes.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Provider Name"
          value={provider.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Phone Number"
          value={provider.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          fullWidth
        />
      </Grid>
    </Grid>
  );
}

export default MedicalProviderForm;
