import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  Link,
  TextField,
  InputAdornment,
  CircularProgress,
  Fab,
  Tooltip,
  AppBar,
  Toolbar,
  TableSortLabel,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import FamilyDialog from '../components/dialogs/FamilyDialog';
import FamilyDeleteDialog from '../components/dialogs/FamilyDeleteDialog';
import { 
  Family
} from '../services/firebase/models/types';
import {
  fetchFamilies,
  fetchFamily,
  saveFamily,
  deleteFamily,
  calculatedNameForFamily,
  guardianNamesForFamily,
} from '../services/firebase/families';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc } from 'firebase/firestore';
import { familyDB } from '../services/firebase/collections';

// Sort order type
type Order = 'asc' | 'desc';

// Columns that can be sorted
type OrderBy = 'familyName' | 'studentNames' | 'guardianNames' | 'authorizedEmails';

// Extended family type with calculated fields for display and sorting
interface ExtendedFamily extends Family {
  familyName: string;
  studentNames: string;
  guardianNames: string;
  authorizedEmails: string[];
}

// Column definition
interface HeadCell {
  id: OrderBy | string;
  label: string;
  numeric: boolean;
  sortable: boolean;
}

// Table columns
const headCells: HeadCell[] = [
  { id: 'familyName', label: 'Family Name', numeric: false, sortable: true },
  { id: 'studentNames', label: 'Students', numeric: false, sortable: true },
  { id: 'authorizedEmails', label: 'Authorized Emails', numeric: false, sortable: true },
  { id: 'registrations', label: 'Registrations', numeric: false, sortable: false },
  { id: 'actions', label: 'Actions', numeric: false, sortable: false },
];

function FamilyList() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate(); // Kept for future use
  
  // State variables
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('familyName');
  
  // Dialog states
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [fetchingFamily, setFetchingFamily] = useState(false);

  // Fetch families on mount
  useEffect(() => {
    loadFamilies();
  }, []);

  // Load all families
  const loadFamilies = async () => {
    setLoading(true);
    try {
      const data = await fetchFamilies();
      setFamilies(data);
    } catch (error) {
      console.error('Error fetching families:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new family
  const handleNewFamily = () => {
    const newFamily: Family = {
      id: '',
      name: '',
      guardians: [],
      students: [],
      emergencyContacts: [],
      medicalProviders: [],
    };
    setSelectedFamily(newFamily);
    setNewDialogOpen(true);
  };

  // Handle edit family dialog
  const handleEditFamily = async (id: string) => {
    setFetchingFamily(true);
    setEditDialogOpen(true);

    try {
      const family = await fetchFamily(id);
      if (family) {
        setSelectedFamily(family);
      }
    } catch (error) {
      console.error('Error fetching family:', error);
    } finally {
      setFetchingFamily(false);
    }
  };

  // Open delete confirmation dialog
  const handleDeletePrompt = async (id: string) => {
    setFetchingFamily(true);
    setDeleteDialogOpen(true);

    try {
      const family = await fetchFamily(id);
      if (family) {
        setSelectedFamily(family);
      }
    } catch (error) {
      console.error('Error fetching family:', error);
    } finally {
      setFetchingFamily(false);
    }
  };

  // Save new family
  const handleSaveNewFamily = async (familyData: Family) => {
    try {
      if (!familyData.id) {
        familyData.id = doc(familyDB).id;
      }
      await saveFamily(familyData);
      await loadFamilies();
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  };

  // Update existing family
  const handleUpdateFamily = async (familyData: Family) => {
    try {
      await saveFamily(familyData);
      await loadFamilies();
    } catch (error) {
      console.error('Error updating family:', error);
      throw error;
    }
  };

  // Delete family
  const handleDeleteFamily = async (familyData: Family) => {
    try {
      await deleteFamily(familyData);
      await loadFamilies();
    } catch (error) {
      console.error('Error deleting family:', error);
      throw error;
    }
  };

  // Handle column sort
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Transform families with additional display fields
  const extendedFamilies: ExtendedFamily[] = useMemo(() => {
    return families.map(family => {
      const calculatedName = calculatedNameForFamily(family);
      const guardianNames = guardianNamesForFamily(family);
      const studentNames = family.students.map(student => 
        student.preferredName || student.firstName
      ).join(', ');
      
      // Get authorized emails from guardians and otherEmails
      let authorizedEmails: string[] = [];
      
      // Add guardian emails
      authorizedEmails.push(...family.guardians.map(g => g.email));
      
      // Add other emails from guardians
      family.guardians.forEach(guardian => {
        if (guardian.otherEmails) {
          const otherEmails = guardian.otherEmails.split(',').map(e => e.trim());
          authorizedEmails.push(...otherEmails);
        }
      });
      
      // Add student emails
      family.students.forEach(student => {
        if (student.email) {
          authorizedEmails.push(student.email);
        }
      });
      
      // Clean up emails - remove duplicates and empty values
      authorizedEmails = [...new Set(authorizedEmails.filter(Boolean))];
      
      return {
        ...family,
        familyName: calculatedName,
        studentNames,
        guardianNames,
        authorizedEmails,
      };
    });
  }, [families]);

  // Sort families based on current sort settings
  const sortedFamilies = useMemo(() => {
    // Filter based on search term
    const filtered = extendedFamilies.filter(family => {
      if (!search) return true;
      
      const searchLower = search.toLowerCase();
      return (
        family.familyName.toLowerCase().includes(searchLower) ||
        family.studentNames.toLowerCase().includes(searchLower) ||
        family.guardianNames.toLowerCase().includes(searchLower) ||
        family.authorizedEmails.some(email => 
          email.toLowerCase().includes(searchLower)
        )
      );
    });
    
    // Sort filtered results
    return [...filtered].sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';
      
      // Handle email array for authorizedEmails
      if (orderBy === 'authorizedEmails') {
        aValue = a.authorizedEmails.join(', ');
        bValue = b.authorizedEmails.join(', ');
      } else {
        aValue = String(a[orderBy] || '');
        bValue = String(b[orderBy] || '');
      }
      
      // Compare values based on sort direction
      const result = aValue.localeCompare(bValue);
      return order === 'asc' ? result : -result;
    });
  }, [extendedFamilies, search, order, orderBy]);

  return (
    <>
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <AppBar position="relative" sx={{ bgcolor: 'green.900' }}>
          <Toolbar>
            <Typography variant="h6" component="h1">
              Families
            </Typography>
            <Box flexGrow={1} />
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
          
          {/* Toolbar extension with the FAB */}
          {isAdmin && (
            <Box sx={{ position: 'relative', height: '28px' }}>
              <Tooltip title="Add new family">
                <Fab
                  color="primary"
                  aria-label="add"
                  onClick={handleNewFamily}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: -16,
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
          )}
        </AppBar>

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" aria-label="families table">
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                      >
                        {headCell.sortable ? (
                          <TableSortLabel
                            active={orderBy === headCell.id as OrderBy}
                            direction={orderBy === headCell.id as OrderBy ? order : 'asc'}
                            onClick={() => handleRequestSort(headCell.id as OrderBy)}
                          >
                            {headCell.label}
                          </TableSortLabel>
                        ) : (
                          headCell.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedFamilies.map((family) => (
                    <TableRow key={family.id} hover>
                      <TableCell>
                        <Link
                          component={RouterLink}
                          to={`/families/${family.id}`}
                          sx={{ textDecoration: 'none' }}
                        >
                          {family.familyName}
                        </Link>
                      </TableCell>
                      <TableCell>{family.studentNames}</TableCell>
                      <TableCell>{family.authorizedEmails.join(', ')}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          component={RouterLink}
                          to={`/families/${family.id}/registrations`}
                          startIcon={<DescriptionIcon />}
                          sx={{ 
                            bgcolor: 'brown.500', 
                            '&:hover': { bgcolor: 'brown.700' },
                            fontSize: '0.75rem',
                          }}
                        >
                          Registrations
                        </Button>
                      </TableCell>
                      <TableCell>
                        {isAdmin && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit Family">
                              <IconButton
                                size="small"
                                onClick={() => handleEditFamily(family.id)}
                                sx={{ color: 'brown.500' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Family">
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePrompt(family.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* New Family Dialog */}
      <FamilyDialog
        open={newDialogOpen}
        title="New Family"
        family={selectedFamily || {
          id: '',
          name: '',
          guardians: [],
          students: [],
          emergencyContacts: [],
          medicalProviders: [],
        }}
        onClose={() => setNewDialogOpen(false)}
        onSave={handleSaveNewFamily}
      />

      {/* Edit Family Dialog */}
      <FamilyDialog
        open={editDialogOpen}
        title={`Edit Family ${selectedFamily?.name || ''}`}
        family={selectedFamily || {
          id: '',
          name: '',
          guardians: [],
          students: [],
          emergencyContacts: [],
          medicalProviders: [],
        }}
        loading={fetchingFamily}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateFamily}
      />

      {/* Delete Family Dialog */}
      <FamilyDeleteDialog
        open={deleteDialogOpen}
        family={selectedFamily}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteFamily}
      />
    </>
  );
}

export default FamilyList;