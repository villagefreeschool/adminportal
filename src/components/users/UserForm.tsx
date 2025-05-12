import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { VFSAdminUser } from "@services/firebase/models/types";
import { useCallback, useEffect } from "react";

interface UserFormProps {
  user: VFSAdminUser;
  onChange: (user: VFSAdminUser) => void;
  allowChangingEmail?: boolean;
  onEnterKeyPressed?: () => void;
}

/**
 * Form for entering user information
 * Migrated from Vue UserForm
 */
function UserForm({ user, onChange, allowChangingEmail = true, onEnterKeyPressed }: UserFormProps) {
  // Handle field changes
  const handleChange = useCallback(
    (field: keyof VFSAdminUser, value: unknown) => {
      onChange({
        ...user,
        [field]: value,
      });
    },
    [user, onChange],
  );

  // Make staff automatically true when admin is true
  useEffect(() => {
    if (user.isAdmin && !user.isStaff) {
      handleChange("isStaff", true);
    }
  }, [user.isAdmin, user.isStaff, handleChange]);

  // Handle key down events for enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onEnterKeyPressed && !e.shiftKey) {
      e.preventDefault();
      onEnterKeyPressed();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Email Address"
        value={user.email || ""}
        onChange={(e) => handleChange("email", e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!allowChangingEmail}
        fullWidth
        required
        helperText="They will log in to the system using this address."
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
          <TextField
            label="First Name"
            value={user.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            required
            autoFocus={!allowChangingEmail}
          />
        </Box>

        <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
          <TextField
            label="Last Name"
            value={user.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            required
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.isAdmin || false}
                  onChange={(e) => handleChange("isAdmin", e.target.checked)}
                  color="primary"
                />
              }
              label="Administrator"
            />
          </Box>
          <Typography variant="caption" color="textSecondary">
            Administrators can see all data and can create new users.
          </Typography>
        </Box>

        <Box sx={{ flex: "1 1 45%", minWidth: "250px" }}>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.isStaff || false}
                  onChange={(e) => handleChange("isStaff", e.target.checked)}
                  color="primary"
                />
              }
              label="Staff"
            />
          </Box>
          <Typography variant="caption" color="textSecondary">
            Staff have access to the backend area.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default UserForm;
