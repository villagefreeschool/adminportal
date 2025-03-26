import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  TextField,
  Divider,
  Box,
  FormControlLabel,
  Checkbox,
  IconButton,
  useTheme,
} from '@mui/material';
import { Grid2 } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import StudentForm from './StudentForm';
import GuardianForm from './GuardianForm';
import EmergencyContactForm from './EmergencyContactForm';
import MedicalProviderForm from './MedicalProviderForm';
import IncomeField from './IncomeField';
import {
  Family,
  Student,
  Guardian,
  EmergencyContact,
  MedicalProvider,
} from '../services/firebase/models/types';

interface FamilyFormProps {
  family: Family;
  onChange: (family: Family) => void;
}

/**
 * Main family form component
 * Migrated from Vue FamilyForm
 */
const FamilyForm: React.FC<FamilyFormProps> = ({ family, onChange }) => {
  const theme = useTheme();
  // Minimums for collections
  const MIN_STUDENTS = 1;
  const MIN_GUARDIANS = 1;
  const MIN_EMERGENCY_CONTACTS = 2;
  const MIN_MEDICAL_PROVIDERS = 1;

  // Update a specific field in the family object
  const handleChange = (field: keyof Family, value: unknown) => {
    onChange({
      ...family,
      [field]: value,
    });
  };

  // Student handlers
  const handleStudentChange = (index: number, student: Student) => {
    const students = [...family.students];
    students[index] = student;
    handleChange('students', students);
  };

  const addStudent = () => {
    const students = [...family.students];
    students.push({
      id: '',
      familyID: family.id || '',
      firstName: '',
      lastName: '',
      mediaRelease: true,
    });
    handleChange('students', students);
  };

  const removeStudent = (index: number) => {
    const students = [...family.students];
    students.splice(index, 1);
    handleChange('students', students);
  };

  // Guardian handlers
  const handleGuardianChange = (index: number, guardian: Guardian) => {
    const guardians = [...family.guardians];
    guardians[index] = guardian;
    handleChange('guardians', guardians);
  };

  const addGuardian = () => {
    const guardians = [...family.guardians];
    guardians.push({
      firstName: '',
      lastName: '',
      email: '',
      atSameAddress: true,
    });
    handleChange('guardians', guardians);
  };

  const removeGuardian = (index: number) => {
    const guardians = [...family.guardians];
    guardians.splice(index, 1);
    handleChange('guardians', guardians);
  };

  // Emergency contact handlers
  const handleEmergencyContactChange = (index: number, contact: EmergencyContact) => {
    const contacts = [...(family.emergencyContacts || [])];
    contacts[index] = contact;
    handleChange('emergencyContacts', contacts);
  };

  const addEmergencyContact = () => {
    const contacts = [...(family.emergencyContacts || [])];
    contacts.push({ firstName: '' });
    handleChange('emergencyContacts', contacts);
  };

  const removeEmergencyContact = (index: number) => {
    const contacts = [...(family.emergencyContacts || [])];
    contacts.splice(index, 1);
    handleChange('emergencyContacts', contacts);
  };

  // Medical provider handlers
  const handleMedicalProviderChange = (index: number, provider: MedicalProvider) => {
    const providers = [...(family.medicalProviders || [])];
    providers[index] = provider;
    handleChange('medicalProviders', providers);
  };

  const addMedicalProvider = () => {
    const providers = [...(family.medicalProviders || [])];
    providers.push({ name: '' });
    handleChange('medicalProviders', providers);
  };

  const removeMedicalProvider = (index: number) => {
    const providers = [...(family.medicalProviders || [])];
    providers.splice(index, 1);
    handleChange('medicalProviders', providers);
  };

  // Copy guardian to emergency contact
  const canCopyGuardian = (index: number): boolean => {
    return Boolean(family.guardians[index]?.firstName);
  };

  const copyGuardianToContact = (index: number) => {
    if (family.guardians[index] && (family.emergencyContacts || [])[index]) {
      const src = family.guardians[index];
      const contacts = [...(family.emergencyContacts || [])];

      contacts[index] = {
        firstName: src.firstName,
        lastName: src.lastName,
        relationship: src.relationship,
        cellPhone: src.cellPhone,
        workPhone: src.workPhone,
        notes: src.notes,
      };

      handleChange('emergencyContacts', contacts);
    }
  };

  // Sliding scale opt out handler
  const handleSlidingScaleOptOutChange = (checked: boolean) => {
    handleChange('slidingScaleOptOut', checked);
    if (checked) {
      handleChange('grossFamilyIncome', null);
    }
  };

  // Initialize emergency contacts if not present
  if (!family.emergencyContacts) {
    family.emergencyContacts = [];
  }

  // Initialize medical providers if not present
  if (!family.medicalProviders) {
    family.medicalProviders = [];
  }

  // Ensure minimum number of items in collections
  while (family.students.length < MIN_STUDENTS) {
    family.students.push({
      id: '',
      familyID: family.id || '',
      firstName: '',
      lastName: '',
      mediaRelease: true,
    });
  }

  while (family.guardians.length < MIN_GUARDIANS) {
    family.guardians.push({
      firstName: '',
      lastName: '',
      email: '',
    });
  }

  while (family.emergencyContacts.length < MIN_EMERGENCY_CONTACTS) {
    family.emergencyContacts.push({ firstName: '' });
  }

  while (family.medicalProviders.length < MIN_MEDICAL_PROVIDERS) {
    family.medicalProviders.push({ name: '' });
  }

  return (
    <Grid2 container spacing={3}>
      {/* Family Nickname */}
      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title="Family Nickname"
            sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
          />
          <CardContent>
            <TextField
              label="What Should We Call Your Family?"
              value={family.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              helperText="Examples: 'Smith Family' or 'The Smiths'"
              fullWidth
              required
            />
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Divider />
      </Grid2>

      {/* Students */}
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6">Students</Typography>
        <Typography variant="body2">
          <strong>Instructions</strong>: Enter at least the children who are planning to attend
          Village Free School. It is helpful for the staff to know the names of siblings, so
          consider entering children who are not attending as well.
        </Typography>
      </Grid2>

      {family.students.map((student, index) => (
        <Grid2 size={{ xs: 12 }} key={`student-${index}`}>
          <Card>
            <CardHeader
              title={`Student #${index + 1}`}
              sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
              action={
                index >= MIN_STUDENTS && (
                  <IconButton onClick={() => removeStudent(index)} color="inherit">
                    <DeleteIcon />
                  </IconButton>
                )
              }
            />
            <CardContent>
              <StudentForm
                student={student}
                onChange={(updatedStudent) => handleStudentChange(index, updatedStudent)}
              />
            </CardContent>
          </Card>
        </Grid2>
      ))}

      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title={`Student #${family.students.length + 1}`}
            sx={{ bgcolor: theme.palette.grey[500], color: 'white' }}
          />
          <CardContent>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={addStudent}
                sx={{ bgcolor: theme.palette.green[900] }}
              >
                Enter Student / Child #{family.students.length + 1}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Divider />
      </Grid2>

      {/* Parents and Guardians */}
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6">Parents and Guardians</Typography>
        <Typography variant="body2">Enter all parents and legal guardians.</Typography>
      </Grid2>

      {family.guardians.map((guardian, index) => (
        <Grid2 size={{ xs: 12, md: 6 }} key={`guardian-${index}`}>
          <Card>
            <CardHeader
              title={`Parent / Guardian #${index + 1}`}
              sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
              action={
                index >= MIN_GUARDIANS && (
                  <IconButton onClick={() => removeGuardian(index)} color="inherit">
                    <DeleteIcon />
                  </IconButton>
                )
              }
            />
            <CardContent>
              <GuardianForm
                guardian={guardian}
                onChange={(updatedGuardian) => handleGuardianChange(index, updatedGuardian)}
                index={index}
              />
            </CardContent>
          </Card>
        </Grid2>
      ))}

      <Grid2 size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={`Parent / Guardian #${family.guardians.length + 1}`}
            sx={{ bgcolor: theme.palette.grey[500], color: 'white' }}
          />
          <CardContent>
            <Box display="flex" justifyContent="center" height="100%" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={addGuardian}
                sx={{ bgcolor: theme.palette.green[900] }}
              >
                Enter Parent / Guardian #{family.guardians.length + 1}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Divider />
      </Grid2>

      {/* Pick Up List */}
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6">Pick Up List</Typography>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title="Additional Adults Authorized to Pick Up"
            sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
          />
          <CardContent>
            <Typography variant="body2" paragraph>
              In addition to the parents/guardians listed above, please name all other adults who
              are authorized to pick children up from school.
            </Typography>
            <TextField
              label="Pick Up List"
              value={family.pickupList || ''}
              onChange={(e) => handleChange('pickupList', e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Divider />
      </Grid2>

      {/* Emergency Contacts */}
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6">Emergency Contacts</Typography>
        <Typography variant="body2">
          Please enter at least {MIN_EMERGENCY_CONTACTS} emergency contacts.
        </Typography>
      </Grid2>

      {family.emergencyContacts.map((contact, index) => (
        <Grid2 size={{ xs: 12, md: 6 }} key={`emergency-contact-${index}`}>
          <Card>
            <CardHeader
              title={`Emergency Contact #${index + 1}`}
              sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
              action={
                index >= MIN_EMERGENCY_CONTACTS && (
                  <IconButton onClick={() => removeEmergencyContact(index)} color="inherit">
                    <DeleteIcon />
                  </IconButton>
                )
              }
            />
            <CardContent>
              {canCopyGuardian(index) && (
                <Box display="flex" justifyContent="center" mb={2}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyGuardianToContact(index)}
                    sx={{ bgcolor: theme.palette.brown[500] }}
                  >
                    Copy from Parent / Guardian #{index + 1}
                  </Button>
                </Box>
              )}
              <EmergencyContactForm
                contact={contact}
                onChange={(updatedContact) => handleEmergencyContactChange(index, updatedContact)}
              />
            </CardContent>
          </Card>
        </Grid2>
      ))}

      <Grid2 size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={`Emergency Contact #${family.emergencyContacts.length + 1}`}
            sx={{ bgcolor: theme.palette.grey[500], color: 'white' }}
          />
          <CardContent>
            <Box display="flex" justifyContent="center" height="100%" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={addEmergencyContact}
                sx={{ bgcolor: theme.palette.green[900] }}
              >
                Enter Emergency Contact #{family.emergencyContacts.length + 1}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Divider />
      </Grid2>

      {/* Medical and Insurance */}
      <Grid2 size={{ xs: 12 }}>
        <Typography variant="h6">Medical and Insurance</Typography>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title="Medical Insurance"
            sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
          />
          <CardContent>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Insurance Provider"
                  value={family.medicalInsuranceProvider || ''}
                  onChange={(e) => handleChange('medicalInsuranceProvider', e.target.value)}
                  fullWidth
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Name of Primary Insured"
                  value={family.medicalInsuranceNameOfPrimaryInsured || ''}
                  onChange={(e) =>
                    handleChange('medicalInsuranceNameOfPrimaryInsured', e.target.value)
                  }
                  fullWidth
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Policy Number"
                  value={family.medicalInsurancePolicyNumber || ''}
                  onChange={(e) => handleChange('medicalInsurancePolicyNumber', e.target.value)}
                  fullWidth
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Group Number"
                  value={family.medicalInsuranceGroupNumber || ''}
                  onChange={(e) => handleChange('medicalInsuranceGroupNumber', e.target.value)}
                  fullWidth
                />
              </Grid2>
            </Grid2>
          </CardContent>
        </Card>
      </Grid2>

      {family.medicalProviders.map((provider, index) => (
        <Grid2 size={{ xs: 12, md: 6 }} key={`medical-provider-${index}`}>
          <Card>
            <CardHeader
              title={`Medical Provider #${index + 1}`}
              sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
              action={
                index >= MIN_MEDICAL_PROVIDERS && (
                  <IconButton onClick={() => removeMedicalProvider(index)} color="inherit">
                    <DeleteIcon />
                  </IconButton>
                )
              }
            />
            <CardContent>
              <MedicalProviderForm
                provider={provider}
                onChange={(updatedProvider) => handleMedicalProviderChange(index, updatedProvider)}
              />
            </CardContent>
          </Card>
        </Grid2>
      ))}

      <Grid2 size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={`Medical Provider #${family.medicalProviders.length + 1}`}
            sx={{ bgcolor: theme.palette.grey[500], color: 'white' }}
          />
          <CardContent>
            <Box display="flex" justifyContent="center" height="100%" alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={addMedicalProvider}
                sx={{ bgcolor: theme.palette.green[900] }}
              >
                Enter Additional Medical Provider
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12 }}>
        <Divider />
      </Grid2>

      {/* Sliding Scale */}
      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader
            title="Sliding Scale"
            sx={{ bgcolor: theme.palette.green[900], color: 'white' }}
          />
          <CardContent>
            <Grid2 container justifyContent="center">
              <Grid2 size={{ xs: 12, sm: 8, md: 6 }}>
                <Typography variant="body2" paragraph>
                  To make Village Free School affordable to all families, tuition is based on a
                  percentage of family income. Please enter your family&apos;s annual gross income.
                </Typography>
                <Typography variant="body2" paragraph>
                  If income has changed recently, or if income varies from month to month, enter the
                  average total for the year for the past couple years.
                </Typography>
              </Grid2>
            </Grid2>
            <Grid2 container justifyContent="space-around">
              <Grid2 size={{ xs: 6, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={family.slidingScaleOptOut || false}
                      onChange={(e) => handleSlidingScaleOptOutChange(e.target.checked)}
                    />
                  }
                  label="Opt Out"
                />
              </Grid2>
              <Grid2
                size={{ xs: 6, sm: 4 }}
                style={{ display: family.slidingScaleOptOut ? 'none' : 'block' }}
              >
                <IncomeField
                  value={family.grossFamilyIncome}
                  onChange={(value) => handleChange('grossFamilyIncome', value)}
                  label="Gross Family Income"
                />
              </Grid2>
              <Grid2
                size={{ xs: 6, sm: 4 }}
                style={{ display: family.slidingScaleOptOut ? 'block' : 'none' }}
              >
                <Typography variant="body2">
                  Tuition calculation will use the full tuition rate.
                </Typography>
              </Grid2>
            </Grid2>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default FamilyForm;
