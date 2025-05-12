import UserDialog from "@components/users/UserDialog";
import { useAuth } from "@contexts/useAuth";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import {
  AppBar,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { VFSAdminUser } from "@services/firebase/models/types";
import { fetchUsers } from "@services/firebase/users";
import React, { useState, useEffect } from "react";

// Sort direction type
type Order = "asc" | "desc";

// Column definition
interface Column {
  id: keyof VFSAdminUser | "actions";
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

const columns: Column[] = [
  { id: "email", label: "Email", sortable: true },
  { id: "firstName", label: "Name", sortable: true },
  { id: "isAdmin", label: "Admin", align: "center", sortable: true },
  { id: "isStaff", label: "Staff", align: "center", sortable: true },
  { id: "actions", label: "Edit", align: "center", sortable: false },
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
  const [orderBy, setOrderBy] = useState<keyof VFSAdminUser>("email");
  const [order, setOrder] = useState<Order>("asc");

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

      if (data.length === 0) {
        // If no users found, don't show an error - just display an empty table
        setUsers([]);
      } else {
        // Initial sort is handled by the sortData function
        setUsers(data);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle column header click for sorting
  const handleRequestSort = (property: keyof VFSAdminUser) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Generic comparison function for sorting
  const compareValues = (a: unknown, b: unknown, orderDirection: Order): number => {
    // Handle null/undefined values
    if (a == null) return orderDirection === "asc" ? -1 : 1;
    if (b == null) return orderDirection === "asc" ? 1 : -1;

    // Handle booleans
    if (typeof a === "boolean" && typeof b === "boolean") {
      return orderDirection === "asc" ? (a === b ? 0 : a ? -1 : 1) : a === b ? 0 : a ? 1 : -1;
    }

    // Handle strings and other values
    if (typeof a === "string" && typeof b === "string") {
      return orderDirection === "asc" ? a.localeCompare(b) : b.localeCompare(a);
    }

    // Handle numbers
    if (typeof a === "number" && typeof b === "number") {
      return orderDirection === "asc" ? a - b : b - a;
    }

    // Convert to strings as fallback for other types
    const aStr = String(a);
    const bStr = String(b);
    return orderDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  };

  // Get sorted data based on current order and orderBy
  const getSortedData = () => {
    return [...users].sort((a, b) => {
      return compareValues(a[orderBy], b[orderBy], order);
    });
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
      setUsers([...users, user]);
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
      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        <AppBar position="relative" sx={{ bgcolor: theme.palette.green[900] }}>
          <Toolbar>
            <Typography variant="h6" component="h1">
              Users
            </Typography>
            <Box flexGrow={1} />
          </Toolbar>

          {/* Toolbar extension with the FAB */}
          <Box sx={{ position: "relative", height: "28px" }}>
            <Tooltip title="Add new user">
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleNewUser}
                size="large"
                sx={{
                  position: "absolute",
                  bottom: -21,
                  left: 24,
                  zIndex: 1,
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
                        sortDirection={orderBy === column.id ? order : false}
                        sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                      >
                        {column.sortable ? (
                          <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : "asc"}
                            onClick={() =>
                              column.id !== "actions" &&
                              handleRequestSort(column.id as keyof VFSAdminUser)
                            }
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getSortedData().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">
                          No users found. Click the + button to add your first user.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    getSortedData().map((user) => (
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
                    ))
                  )}
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
