import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Fab,
  Tooltip,
  AppBar,
  Toolbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DescriptionIcon from '@mui/icons-material/Description';
import YearDialog from '../components/dialogs/YearDialog';
import {
  Year,
  fetchYears,
  fetchYear,
  createYear,
  updateYear,
  DefaultMinimumIncome,
  DefaultMaximumIncome,
  DefaultMinimumTuition,
  DefaultMaximumTuition,
} from '../services/firebase/years';

function YearList() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [fetchingYear, setFetchingYear] = useState(false);

  // Initial data fetch
  useEffect(() => {
    loadYears();
  }, []);

  // Function to load all years
  const loadYears = async () => {
    setLoading(true);
    try {
      const data = await fetchYears();
      setYears(data);
    } catch (error) {
      console.error('Error fetching years:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for new year dialog
  const handleNewYear = () => {
    setSelectedYear({
      id: '',
      name: '',
      minimumTuition: DefaultMinimumTuition,
      maximumTuition: DefaultMaximumTuition,
      minimumIncome: DefaultMinimumIncome,
      maximumIncome: DefaultMaximumIncome,
      isAcceptingRegistrations: false,
    });
    setNewDialogOpen(true);
  };

  // Handler for edit year dialog
  const handleEditYear = async (id: string) => {
    setFetchingYear(true);
    setEditDialogOpen(true);

    try {
      const year = await fetchYear(id);
      if (year) {
        setSelectedYear(year);
      }
    } catch (error) {
      console.error('Error fetching year:', error);
    } finally {
      setFetchingYear(false);
    }
  };

  // Handler for saving a new year
  const handleSaveNewYear = async (yearData: Partial<Year>) => {
    try {
      await createYear(yearData as Omit<Year, 'id'>);
      await loadYears();
    } catch (error) {
      console.error('Error creating year:', error);
      throw error;
    }
  };

  // Handler for updating an existing year
  const handleUpdateYear = async (yearData: Partial<Year>) => {
    if (!yearData.id) return;

    try {
      await updateYear(yearData as Year);
      await loadYears();
    } catch (error) {
      console.error('Error updating year:', error);
      throw error;
    }
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <AppBar position="relative" sx={{ bgcolor: 'green.900' }}>
          <Toolbar>
            <Typography variant="h6" component="h1">
              School Years
            </Typography>
          </Toolbar>
          {/* Toolbar extension with the FAB */}
          <Box sx={{ position: 'relative', height: '36px' }}>
            <Tooltip title="Add new school year">
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleNewYear}
                size="medium"
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: 24,
                  zIndex: 1,
                  bgcolor: 'brown.500',
                  '&:hover': { bgcolor: 'brown.700' },
                }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table aria-label="school years table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Min Tuition</TableCell>
                    <TableCell align="right">Max Tuition</TableCell>
                    <TableCell align="center">Registration Open</TableCell>
                    <TableCell align="center">Contracts</TableCell>
                    <TableCell align="center">Roster</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {years.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell>{year.name}</TableCell>
                      <TableCell align="right">{formatCurrency(year.minimumTuition)}</TableCell>
                      <TableCell align="right">{formatCurrency(year.maximumTuition)}</TableCell>
                      <TableCell align="center">
                        {year.isAcceptingRegistrations && <CheckCircleIcon color="success" />}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          component={RouterLink}
                          to={`/years/${year.id}/contracts`}
                          startIcon={<DescriptionIcon />}
                          color="primary"
                          sx={{ bgcolor: 'brown.500', '&:hover': { bgcolor: 'brown.700' } }}
                        >
                          Contracts
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          component={RouterLink}
                          to={`/years/${year.id}/roster`}
                          startIcon={<ListAltIcon />}
                          color="primary"
                          sx={{ bgcolor: 'brown.500', '&:hover': { bgcolor: 'brown.700' } }}
                        >
                          Roster
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEditYear(year.id)}
                          startIcon={<EditIcon />}
                          color="primary"
                          sx={{ bgcolor: 'brown.500', '&:hover': { bgcolor: 'brown.700' } }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* New Year Dialog */}
      <YearDialog
        open={newDialogOpen}
        title="New School Year"
        year={selectedYear || {}}
        onClose={() => setNewDialogOpen(false)}
        onSave={handleSaveNewYear}
      />

      {/* Edit Year Dialog */}
      <YearDialog
        open={editDialogOpen}
        title={`Edit Year ${selectedYear?.name || ''}`}
        year={selectedYear || {}}
        loading={fetchingYear}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateYear}
      />
    </Container>
  );
}

export default YearList;
