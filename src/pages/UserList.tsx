import React, { useState, useEffect } from 'react';
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
  AppBar,
  Toolbar,
  Fab,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import { fetchUsers } from '../services/firebase/users';
import { VFSAdminUser } from '../services/firebase/models/types';
import UserDialog from '../components/dialogs/UserDialog';
import { useAuth } from '../contexts/useAuth';

// Column definition
interface Column {
  id: keyof VFSAdminUser | 'actions';
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

const columns: Column[] = [
  { id: 'email', label: 'Email' },
  { id: 'firstName', label: 'Name' },
  { id: 'isAdmin', label: 'Admin', align: 'center' },
  { id: 'isStaff', label: 'Staff', align: 'center' },
  { id: 'actions', label: 'Edit', align: 'center', sortable: false },
];

/**
 * UserList component for displaying and managing users
 * Migrated from Vue UserList
 */
function UserList() {
  const theme = useTheme();
  const { isAdmin } = useAuth();

  // State
  const [users, setUsers] = useState<VFSAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>(undefined);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Fetch all users
  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchUsers();
      // Sort users by firstName
      setUsers(data.sort((a, b) => a.firstName.localeCompare(b.firstName)));
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const handleEditUser = (email: string) => {
    setSelectedEmail(email);
    setDialogOpen(true);
  };

  // Open new user dialog
  const handleNewUser = () => {
    setSelectedEmail(undefined);
    setDialogOpen(true);
  };

  // Handle dialog save
  const handleSave = (user: VFSAdminUser) => {
    // If editing an existing user, replace it in the list
    if (selectedEmail) {
      setUsers(users.map((u) => (u.email === selectedEmail ? user : u)));
    } else {
      // If creating a new user, add it to the list
      setUsers([...users, user].sort((a, b) => a.firstName.localeCompare(b.firstName)));
    }
  };

  // Display a user's name
  const displayName = (user: VFSAdminUser) => {
    return `${user.firstName} ${user.lastName}`;
  };

  if (!isAdmin) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          You don&apos;t have permission to access this page
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <AppBar position="relative" sx={{ bgcolor: theme.palette.green[900] }}>
          <Toolbar>
            <Typography variant="h6" component="h1">
              Users
            </Typography>
            <Box flexGrow={1} />
          </Toolbar>

          {/* Toolbar extension with the FAB */}
          <Box sx={{ position: 'relative', height: '28px' }}>
            <Tooltip title="Add new user">
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleNewUser}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: -16,
                  left: 24,
                  zIndex: 1,
                  bgcolor: theme.palette.brown[500],
                  '&:hover': { bgcolor: theme.palette.brown[700] },
                }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>
        </AppBar>

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ my: 2 }}>
              {error}
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small" aria-label="users table">
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
                  {users.map((user) => (
                    <TableRow key={user.email} hover>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{displayName(user)}</TableCell>
                      <TableCell align="center">
                        {user.isAdmin && <CheckIcon color="success" fontSize="small" />}
                      </TableCell>
                      <TableCell align="center">
                        {user.isStaff && <CheckIcon color="success" fontSize="small" />}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user.email)}
                          sx={{ color: theme.palette.brown[500] }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* User Dialog (edit or new) */}
      <UserDialog
        open={dialogOpen}
        email={selectedEmail}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

export default UserList;
