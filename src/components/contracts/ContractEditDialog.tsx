import EnrollmentTypeSelector from "@components/contracts/EnrollmentTypeSelector";
import { useAuth } from "@contexts/useAuth";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slider,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  deleteContract,
  fetchContract,
  fetchPreviousYearContract,
  saveContract,
} from "@services/firebase/contracts";
import { fetchFamily } from "@services/firebase/families";
import type { Contract, Enrollment, Family, Year } from "@services/firebase/models/types";
import {
  deleteEnrollment,
  fetchEnrollments,
  fetchYear,
  saveEnrollment,
} from "@services/firebase/years";
import {
  calculateTuitionOptions,
  FullTime,
  formatCurrency,
  MaxYearOverYearChange,
  NotAttending,
  PartTime,
  tuitionForIncome,
} from "@services/tuitioncalc";
import { useEffect, useMemo, useState } from "react";

interface ContractEditDialogProps {
  open: boolean;
  yearId: string;
  familyId: string;
  onClose: () => void;
  onSave: (contract: Contract) => void;
}

/**
 * Dialog for editing contract details
 * Includes enrollment selections, sliding scale tuition calculation, and saves related enrollments
 */
function ContractEditDialog({ open, yearId, familyId, onClose, onSave }: ContractEditDialogProps) {
  const theme = useTheme();
  const { currentUser, isAdmin } = useAuth();

  // State
  const [contract, setContract] = useState<Contract | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [year, setYear] = useState<Year | null>(null);
  const [prevYearContract, setPrevYearContract] = useState<Contract | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentDecisions, setStudentDecisions] = useState<Record<string, string>>({});
  const [tuition, setTuition] = useState(0);
  const [assistanceAmount, setAssistanceAmount] = useState(0);
  const [tuitionAssistanceRequested, setTuitionAssistanceRequested] = useState(false);
  const [tuitionAssistanceGranted, setTuitionAssistanceGranted] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load contract and family data when dialog opens
  useEffect(() => {
    if (open && yearId && familyId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, yearId, familyId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We're intentionally only reacting to studentDecisions changes
  useEffect(() => {
    if (allAttendanceDecisionsMade) {
      // If decisions have changed from the saved contract, use suggested tuition
      if (decisionsChangedFromContract) {
        setTuition(suggestedTuition);
      } else if (contract?.tuition) {
        // Otherwise use the existing contract tuition
        setTuition(contract.tuition);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentDecisions]);

  // Update assistance amount when tuition changes
  useEffect(() => {
    if (tuition < minTuition) {
      setAssistanceAmount(minTuition - tuition);
    } else {
      setTuitionAssistanceRequested(false);
      setAssistanceAmount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tuition]);

  // Load contract, family and year data
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch contract, family, year and enrollments in parallel
      const [contractData, familyData, yearData, enrollmentsData] = await Promise.all([
        fetchContract(yearId, familyId),
        fetchFamily(familyId),
        fetchYear(yearId),
        fetchEnrollments(yearId, familyId),
      ]);

      // Set year data
      if (yearData) {
        setYear(yearData);
      } else {
        setError("Year not found");
        setLoading(false);
        return;
      }

      // Set family data
      if (familyData) {
        setFamily(familyData);
      } else {
        setError("Family not found");
        setLoading(false);
        return;
      }

      // Set enrollments
      setEnrollments(enrollmentsData);

      // Initialize or set existing contract data
      if (contractData) {
        setContract(contractData);
        setTuition(contractData.tuition || 0);
        setTuitionAssistanceRequested(contractData.tuitionAssistanceRequested || false);
        setTuitionAssistanceGranted(contractData.tuitionAssistanceGranted || false);
        setIsSigned(contractData.isSigned || false);
        setAssistanceAmount(contractData.assistanceAmount || 0);
        setStudentDecisions(contractData.studentDecisions || {});
      } else {
        // Initialize a new contract
        const newContract: Contract = {
          id: familyId,
          familyID: familyId,
          yearID: yearId,
          studentDecisions: {},
          tuition: 0,
          assistanceAmount: 0,
          tuitionAssistanceRequested: false,
          tuitionAssistanceGranted: false,
          isSigned: false,
        };
        setContract(newContract);

        // Initialize student decisions with existing enrollments or Not Attending
        const initialDecisions: Record<string, string> = {};
        if (familyData.students) {
          for (const student of familyData.students) {
            const enrollment = enrollmentsData.find((e) => e.studentID === student.id);
            initialDecisions[student.id] = enrollment ? enrollment.enrollmentType : NotAttending;
          }
        }
        setStudentDecisions(initialDecisions);
      }

      // Fetch previous year contract for historical comparison
      setPrevYearContract(await fetchPreviousYearContract(yearId, familyId));
    } catch (err) {
      console.error("Error loading contract data:", err);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Handle student attendance selection change
  const handleStudentDecisionChange = (studentId: string, value: string) => {
    setStudentDecisions((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  // Handle tuition slider change
  const handleTuitionChange = (_event: unknown, value: number | number[]) => {
    setTuition(value as number);
  };

  // Increment tuition by $50
  const incrementTuition = () => {
    const quotient = tuition / 50;
    setTuition(Math.round(quotient) * 50 + 50);
  };

  // Decrement tuition by $50
  const decrementTuition = () => {
    const quotient = tuition / 50;
    setTuition(Math.max(0, Math.round(quotient) * 50 - 50));
  };

  // Handle checkbox change
  const handleCheckboxChange = (
    field: "tuitionAssistanceRequested" | "tuitionAssistanceGranted" | "isSigned",
    checked: boolean,
  ) => {
    switch (field) {
      case "tuitionAssistanceRequested":
        setTuitionAssistanceRequested(checked);
        if (!checked) {
          setTuitionAssistanceGranted(false);
        }
        break;
      case "tuitionAssistanceGranted":
        setTuitionAssistanceGranted(checked);
        break;
      case "isSigned":
        setIsSigned(checked);
        break;
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!contract || !family || !year) return;

    setSaving(true);
    setError(null);

    try {
      // Create updated contract
      const updatedContract: Contract = {
        ...contract,
        tuition,
        assistanceAmount,
        tuitionAssistanceRequested,
        tuitionAssistanceGranted,
        isSigned,
        studentDecisions,
        familyName: family.name,
        suggestedTuition: suggestedTuition,
        minTuition: minTuition,
        lastSavedBy: currentUser?.email || "unknown",
        lastSavedAt: new Date().toISOString(),
      };

      // Save contract
      const savedContract = await saveContract(updatedContract);

      // Save enrollments
      await saveEnrollments();

      onSave(savedContract);
      onClose();
    } catch (err) {
      console.error("Error saving contract:", err);
      setError("Error saving contract");
    } finally {
      setSaving(false);
    }
  };

  // Handle clear registration
  const handleClear = async () => {
    if (!yearId || !familyId) return;

    setSaving(true);
    setError(null);

    try {
      // Delete contract
      await deleteContract(yearId, familyId);

      // Delete any enrollments
      if (family?.students) {
        const promises = family.students.map((student) => deleteEnrollment(yearId, student.id));
        await Promise.all(promises);
      }

      // Close dialog
      onClose();
    } catch (err) {
      console.error("Error clearing registration:", err);
      setError("Error clearing registration");
    } finally {
      setSaving(false);
    }
  };

  // Save enrollments for students
  const saveEnrollments = async () => {
    if (!family || !family.students || !year) return;

    const promises = family.students.map(async (student) => {
      const enrollmentType = studentDecisions[student.id];
      const isAttending = enrollmentType === FullTime || enrollmentType === PartTime;

      // Find existing enrollment
      const existingEnrollment = enrollments.find((e) => e.studentID === student.id);

      if (isAttending) {
        // Create or update enrollment
        const enrollmentData: Enrollment = {
          id: student.id,
          yearID: yearId,
          familyID: familyId,
          familyName: family.name,
          studentID: student.id,
          studentName: student.preferredName || student.firstName,
          enrollmentType,
        };
        await saveEnrollment(enrollmentData);
      } else if (existingEnrollment) {
        // Delete enrollment if not attending
        await deleteEnrollment(yearId, student.id);
      }
    });

    return Promise.all(promises);
  };

  // Computed values

  // Check if all attendance decisions are made
  const allAttendanceDecisionsMade = useMemo(() => {
    if (!family || !family.students) return false;

    const students = family.students;
    const decisions = Object.values(studentDecisions).filter(Boolean);
    return students.length > 0 && decisions.length === students.length;
  }, [family, studentDecisions]);

  // Check if decisions changed from saved contract
  const decisionsChangedFromContract = useMemo(() => {
    if (!family || !family.students) return false;
    if (!contract || !contract.studentDecisions) return true;

    const students = family.students;
    const contractDecisions = contract.studentDecisions;

    for (const student of students) {
      if (studentDecisions[student.id] !== contractDecisions[student.id]) {
        return true;
      }
    }

    return false;
  }, [family, contract, studentDecisions]);

  // Check if attendance decisions changed from previous year
  const decisionsChangedFromPreviousYear = useMemo(() => {
    if (!prevYearContract || !prevYearContract.studentDecisions) return true;
    if (!family || !family.students) return false;

    const students = family.students;
    const prevYearDecisions = prevYearContract.studentDecisions;

    for (const student of students) {
      if (studentDecisions[student.id] !== prevYearDecisions[student.id]) {
        return true;
      }
    }

    return false;
  }, [family, prevYearContract, studentDecisions]);

  // Check if contract can be cleared
  const clearable = useMemo(() => {
    if (!contract) return false;
    if (!isAdmin) return false;
    if (!family || !family.students) return false;

    // Can only clear if no students are marked as attending
    for (const student of family.students) {
      if (
        studentDecisions[student.id] &&
        (studentDecisions[student.id] === FullTime || studentDecisions[student.id] === PartTime)
      ) {
        return false;
      }
    }

    return true;
  }, [contract, isAdmin, family, studentDecisions]);

  // Calculate tuition options based on student decisions
  const tuitionOpts = useMemo(() => {
    const opts = calculateTuitionOptions(studentDecisions);
    if (year) {
      opts.year = year;
    }
    return opts;
  }, [studentDecisions, year]);

  // Calculate sliding scale tuition
  const slidingScaleTuition = useMemo(() => {
    if (!family || !year) return 0;
    return tuitionForIncome(family.grossFamilyIncome, tuitionOpts);
  }, [family, year, tuitionOpts]);

  // Calculate minimum tuition
  const minTuition = useMemo(() => {
    if (!family || !year) return 0;

    let t = slidingScaleTuition;

    // If income is above maximum, use maximum income for calculation
    if (family.grossFamilyIncome && family.grossFamilyIncome > year.maximumIncome) {
      t = tuitionForIncome(year.maximumIncome, tuitionOpts);
    }

    // Apply year-over-year limits if there's a previous year contract
    if (prevYearContract?.tuition && !decisionsChangedFromPreviousYear) {
      const maxUp = prevYearContract.tuition * (1 + MaxYearOverYearChange);
      const maxDown = prevYearContract.tuition * (1 - MaxYearOverYearChange);

      if (t > maxUp) {
        return Math.round(maxUp);
      }
      if (t < maxDown) {
        return Math.round(maxDown);
      }
    }

    return t;
  }, [
    family,
    year,
    slidingScaleTuition,
    tuitionOpts,
    prevYearContract,
    decisionsChangedFromPreviousYear,
  ]);

  // Calculate suggested tuition
  const suggestedTuition = useMemo(() => {
    if (slidingScaleTuition < minTuition) {
      return minTuition;
    }
    return slidingScaleTuition;
  }, [slidingScaleTuition, minTuition]);

  // Calculate maximum tuition for slider
  const maxTuition = useMemo(() => {
    return Math.max(slidingScaleTuition, suggestedTuition) * 2;
  }, [slidingScaleTuition, suggestedTuition]);

  // Calculate full time tuition
  const fullTimeTuition = useMemo(() => {
    if (!family || !year) return 0;

    const opts = {
      fullTime: 1,
      partTime: 0,
      siblings: 0,
      year,
    };

    return tuitionForIncome(family.grossFamilyIncome, opts);
  }, [family, year]);

  // Calculate sibling tuition
  const siblingTuition = useMemo(() => {
    if (!family || !year) return 0;

    const opts = {
      fullTime: 1,
      partTime: 0,
      siblings: 1,
      year,
    };

    const total = tuitionForIncome(family.grossFamilyIncome, opts);
    return total - fullTimeTuition;
  }, [family, year, fullTimeTuition]);

  // Calculate part time tuition
  const partTimeTuition = useMemo(() => {
    if (!family || !year) return 0;

    const opts = {
      fullTime: 0,
      partTime: 1,
      siblings: 0,
      year,
    };

    return tuitionForIncome(family.grossFamilyIncome, opts);
  }, [family, year]);

  // Show loading state
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Contract</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state if no contract, family or year
  if (error || !contract || !family || !year) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent dividers>
          <Typography color="error">{error || "Missing required data"}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: theme.palette.green[900], color: "white" }}>
        {`${family.name} ${year.name} Enrollment`}
      </DialogTitle>

      <DialogContent dividers>
        {/* Suggested Tuition Amounts */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: theme.palette.grey[100],
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Sliding Scale Tuition
          </Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Based on your family&apos;s income
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              mt: 1,
              gap: 2,
            }}
          >
            <Box sx={{ flex: "1 1 30%", minWidth: "120px", textAlign: "center" }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {formatCurrency(fullTimeTuition)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Full Time
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 30%", minWidth: "120px", textAlign: "center" }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {formatCurrency(siblingTuition)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Full Time Sibling
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 30%", minWidth: "120px", textAlign: "center" }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {formatCurrency(partTimeTuition)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                Part Time
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Attendance Decisions */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Who&apos;s Attending This Year?
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {family.students?.map((student) => (
              <Box
                sx={{
                  flex:
                    family.students.length > 1 ? `1 1 ${90 / family.students.length}%` : "1 1 100%",
                  minWidth: "200px",
                }}
                key={student.id}
              >
                <EnrollmentTypeSelector
                  value={studentDecisions[student.id] || ""}
                  onChange={(value) => handleStudentDecisionChange(student.id, value)}
                  label={student.preferredName || student.firstName}
                  required
                  error={!studentDecisions[student.id]}
                  helperText={!studentDecisions[student.id] ? "Required" : ""}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Annual Tuition Section */}
        {allAttendanceDecisionsMade && (
          <>
            {/* Tuition Description */}
            <Box mb={3}>
              <Typography variant="body-sm" color="text.secondary" sx={{ px: { sm: 5 }, mb: 2 }}>
                The Village Free School uses a sliding scale to ensure the school remains affordable
                to all. A suggested tuition based on your family&apos;s income and payment history (
                {formatCurrency(suggestedTuition)}) is the default setting below. Please adjust up
                or down as necessary, with awareness that VFS staff depend on tuition for their
                livelihood, and current compensation does not include health insurance.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  textAlign: "center",
                  gap: 2,
                }}
              >
                <Box sx={{ flex: "1 1 20%", minWidth: "100px", textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {formatCurrency(tuition / 10)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.70rem" }}>
                    per month
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontSize: "0.65rem", opacity: 0.8 }}
                  >
                    over 10 months
                  </Typography>
                </Box>

                <Box sx={{ flex: "2 1 50%", minWidth: "200px" }}>
                  <Typography variant="overline" color="text.secondary">
                    Total {year.name} Tuition
                  </Typography>
                  <Typography
                    variant="h3"
                    align="center"
                    color={
                      tuition < minTuition && !tuitionAssistanceRequested
                        ? "error.main"
                        : tuition > slidingScaleTuition && tuition > minTuition
                          ? "success.main"
                          : "inherit"
                    }
                  >
                    {formatCurrency(tuition)}
                  </Typography>
                  {tuition > slidingScaleTuition && (
                    <Typography variant="caption" color="success.main" component="p">
                      Thank you for support of the staff and VFS community!
                    </Typography>
                  )}
                  {prevYearContract && !decisionsChangedFromPreviousYear && (
                    <Typography variant="caption" color="text.secondary">
                      {`Previous year: ${formatCurrency(prevYearContract.tuition || 0)}`}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ flex: "1 1 20%", minWidth: "100px", textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {formatCurrency(tuition / 12)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.70rem" }}>
                    per month
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontSize: "0.65rem", opacity: 0.8 }}
                  >
                    over 12 months
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Slider Interface */}
            <Box sx={{ width: "100%", mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  color="primary"
                  onClick={decrementTuition}
                  sx={{ color: theme.palette.brown[500] }}
                >
                  <RemoveIcon />
                </IconButton>

                <Slider
                  value={tuition}
                  min={500}
                  max={maxTuition}
                  onChange={handleTuitionChange}
                  aria-labelledby="tuition-slider"
                  sx={{
                    mx: 2,
                    "& .MuiSlider-thumb": {
                      color: theme.palette.green[800],
                    },
                    "& .MuiSlider-track": {
                      color: theme.palette.green[700],
                    },
                  }}
                />

                <IconButton
                  color="primary"
                  onClick={incrementTuition}
                  sx={{ color: theme.palette.green[800] }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              {tuition < minTuition && !tuitionAssistanceRequested && (
                <Typography color="error.main" variant="caption">
                  Tuition Assistance Required
                </Typography>
              )}
              {prevYearContract && !decisionsChangedFromPreviousYear && (
                <Typography variant="caption" color="text.secondary">
                  Year-over-year change limited to ±{MaxYearOverYearChange * 100}%
                </Typography>
              )}
            </Box>

            {/* Tuition Assistance Options */}
            {(isAdmin || tuition < minTuition) && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                <Box sx={{ flex: "1 1 45%", minWidth: "200px" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tuitionAssistanceRequested}
                        onChange={(e) =>
                          handleCheckboxChange("tuitionAssistanceRequested", e.target.checked)
                        }
                      />
                    }
                    label="Request Tuition Assistance"
                  />
                </Box>

                <Box sx={{ flex: "1 1 45%", minWidth: "200px" }}>
                  <TextField
                    label="Tuition Assistance Amount"
                    type="number"
                    value={assistanceAmount}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      readOnly: true,
                    }}
                    fullWidth
                  />
                </Box>
              </Box>
            )}

            {/* Admin-only options */}
            {allAttendanceDecisionsMade && isAdmin && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ flex: "1 1 45%", minWidth: "200px" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSigned}
                        onChange={(e) => handleCheckboxChange("isSigned", e.target.checked)}
                      />
                    }
                    label="Signed Contract Received"
                  />
                </Box>

                <Box sx={{ flex: "1 1 45%", minWidth: "200px" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={tuitionAssistanceGranted}
                        onChange={(e) =>
                          handleCheckboxChange("tuitionAssistanceGranted", e.target.checked)
                        }
                        disabled={!tuitionAssistanceRequested}
                      />
                    }
                    label="Tuition Assistance Granted"
                  />
                </Box>
              </Box>
            )}

            {/* Metadata for admins */}
            {isAdmin && contract.lastSavedAt && (
              <Box sx={{ width: "100%" }}>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  {contract.lastSavedBy && (
                    <ListItem>
                      <ListItemText primary="Last Saved By" secondary={contract.lastSavedBy} />
                    </ListItem>
                  )}
                  {contract.lastSavedAt && (
                    <ListItem>
                      <ListItemText
                        primary="Last Saved At"
                        secondary={new Date(contract.lastSavedAt).toLocaleString()}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>

        {isAdmin && clearable && (
          <Button color="error" onClick={handleClear} disabled={saving || !isAdmin}>
            Clear Registration
          </Button>
        )}

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !allAttendanceDecisionsMade}
          sx={{
            bgcolor: theme.palette.brown[500],
            "&:hover": { bgcolor: theme.palette.brown[700] },
          }}
        >
          {saving ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ContractEditDialog;
