import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Link,
  AppBar,
  Toolbar,
  useTheme,
} from '@mui/material';
import { Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
// import CheckIcon from '@mui/icons-material/Check'; // Unused import
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PhotoCameraBackIcon from '@mui/icons-material/PhotoCameraBack';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { Enrollment, Year } from '../services/firebase/models/types';
import { fetchYear, enrolledStudentsInYear } from '../services/firebase/years';
import { contactToString } from '../services/firebase/families';
import { useAuth } from '../contexts/useAuth';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import moment from 'moment';

interface Column {
  id: string;
  label: string;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
}

const columns: Column[] = [
  { id: 'studentName', label: 'Name' },
  { id: 'familyName', label: 'Family' },
  { id: 'enrollmentType', label: 'Enrollment' },
  { id: 'birthdaySort', label: 'Birthday', align: 'right' },
  { id: 'signSelfOut', label: 'Self Sign Out', align: 'center' },
  { id: 'mediaRelease', label: 'Media Release', align: 'center' },
];

/**
 * YearRoster component displays the roster of students enrolled in a specific school year
 * Migrated from Vue YearRoster
 */
function YearRoster() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const theme = useTheme();

  // State variables
  const [year, setYear] = useState<Year | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Load year and enrolled students data
  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  // Load year and enrolled students data
  const loadData = async (yearId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch year and enrolled students data in parallel
      const [yearData, enrolledStudentsData] = await Promise.all([
        fetchYear(yearId),
        enrolledStudentsInYear(yearId),
      ]);

      if (yearData) {
        setYear(yearData);
        setEnrolledStudents(enrolledStudentsData);
      } else {
        setError('Year not found');
      }
    } catch (err) {
      console.error('Error loading year data:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Computed values for enrollment counts
  const partTimeCount = useMemo(() => {
    return enrolledStudents.filter((e) => e.enrollmentType === 'Part Time').length;
  }, [enrolledStudents]);

  const fullTimeCount = useMemo(() => {
    return enrolledStudents.filter((e) => e.enrollmentType === 'Full Time').length;
  }, [enrolledStudents]);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!search) return enrolledStudents;

    const searchLower = search.toLowerCase();
    return enrolledStudents.filter((enrollment) => {
      const studentName = enrollment.studentName?.toLowerCase() || '';
      const familyName = enrollment.familyName?.toLowerCase() || '';
      const enrollmentType = enrollment.enrollmentType?.toLowerCase() || '';

      return (
        studentName.includes(searchLower) ||
        familyName.includes(searchLower) ||
        enrollmentType.includes(searchLower)
      );
    });
  }, [enrolledStudents, search]);

  // Generate Excel file for download
  const downloadExcel = async () => {
    if (!year) return;

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'admin.villagefreeschool.org';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(year.name);

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Family', key: 'family', width: 20 },
      { header: 'Enrollment', key: 'enrollment', width: 12 },
      { header: 'Birthdate', key: 'birthdate', width: 12 },
      { header: 'Pronoun', key: 'pronoun', width: 10 },
      { header: 'Severe Allergies', key: 'severeAllergies', width: 20 },
      { header: 'Non-Severe Allergies', key: 'nonSevereAllergies', width: 20 },
      { header: 'Other Medical Conditions', key: 'otherMedical', width: 20 },
      { header: 'Self Sign Out', key: 'selfSignOut', width: 12 },
      { header: 'Media Release', key: 'mediaRelease', width: 12 },
      { header: 'Emergency Contact #1', key: 'contact1', width: 25 },
      { header: 'Emergency Contact #2', key: 'contact2', width: 25 },
      { header: 'Emergency Contact #3', key: 'contact3', width: 25 },
    ];

    // Add data rows
    enrolledStudents.forEach((enrollment) => {
      worksheet.addRow({
        name: enrollment.student?.preferredName || '',
        family: enrollment.familyName,
        enrollment: enrollment.enrollmentType,
        birthdate: enrollment.student?.birthdate || '',
        pronoun: enrollment.student?.pronoun || '',
        severeAllergies: enrollment.student?.severeAllergies || '',
        nonSevereAllergies: enrollment.student?.nonSevereAllergies || '',
        otherMedical: enrollment.student?.otherMedicalConditions || '',
        selfSignOut: enrollment.student?.signSelfOut ? 'YES' : '',
        mediaRelease: enrollment.student?.mediaRelease ? 'YES' : '',
        contact1: contactToString(enrollment.family?.emergencyContacts?.[0] || null),
        contact2: contactToString(enrollment.family?.emergencyContacts?.[1] || null),
        contact3: contactToString(enrollment.family?.emergencyContacts?.[2] || null),
      });
    });

    // Make the header row bold
    worksheet.getRow(1).font = { bold: true };

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new window.Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const filename = `${year.name} - Roster - ${moment().format()}.xlsx`;
    saveAs(blob, filename);
  };

  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          You don&apos;t have permission to access this page
        </Typography>
      </Paper>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error || !year) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          {error || 'Year not found'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      <AppBar position="relative" sx={{ bgcolor: theme.palette.green[900] }}>
        <Toolbar>
          <Typography variant="h6" component="h1">
            {year.name} Roster
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            size="small"
            sx={{
              ml: 2,
              width: { xs: '120px', sm: '200px' },
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'white' }} />
                </InputAdornment>
              ),
            }}
          />
        </Toolbar>
        <Toolbar variant="dense">
          <Box sx={{ flexGrow: 1 }} />
          <Button size="small" color="inherit" onClick={downloadExcel} startIcon={<DownloadIcon />}>
            Download
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} justifyContent="center" textAlign="center">
              <Grid item xs={4} sm={3}>
                <Typography variant="caption" display="block">
                  Part Time
                </Typography>
                <Typography variant="h4">{partTimeCount}</Typography>
              </Grid>
              <Grid item xs={4} sm={3}>
                <Typography variant="caption" display="block">
                  Full Time
                </Typography>
                <Typography variant="h4">{fullTimeCount}</Typography>
              </Grid>
              <Grid item xs={4} sm={3}>
                <Typography variant="caption" display="block">
                  Total
                </Typography>
                <Typography variant="h4">{enrolledStudents.length}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer>
          <Table size="small" aria-label="roster table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((enrollment) => (
                <TableRow key={enrollment.id} hover>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/families/${enrollment.familyID}`}
                      underline="hover"
                      color="inherit"
                    >
                      {enrollment.student?.preferredName || enrollment.studentName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/families/${enrollment.familyID}`}
                      underline="hover"
                      color="inherit"
                    >
                      {enrollment.familyName}
                    </Link>
                  </TableCell>
                  <TableCell>{enrollment.enrollmentType}</TableCell>
                  <TableCell align="right">
                    {enrollment.birthdaySort ? enrollment.birthdayDisplay : ''}
                  </TableCell>
                  <TableCell align="center">
                    {enrollment.student?.signSelfOut && (
                      <DriveFileRenameOutlineIcon
                        fontSize="small"
                        sx={{ color: theme.palette.green[800] }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {enrollment.student?.mediaRelease ? (
                      <PhotoCameraBackIcon
                        fontSize="small"
                        sx={{ color: theme.palette.green[800] }}
                      />
                    ) : (
                      <DoNotDisturbIcon fontSize="small" color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}

export default YearRoster;
