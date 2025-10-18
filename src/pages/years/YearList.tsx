import LoadingSpinner from "@components/LoadingSpinner.tsx";
import YearDialog from "@components/years/YearDialog";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  AppBar,
  Box,
  Fab,
  IconButton,
  Link,
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
} from "@mui/material";
import {
  createYear,
  DefaultMaximumIncome,
  DefaultMaximumTuition,
  DefaultMinimumIncome,
  DefaultMinimumTuition,
  fetchYear,
  fetchYears,
  updateYear,
  type Year,
} from "@services/firebase/years";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

type Order = "asc" | "desc";
type OrderBy = keyof Year;

interface HeadCell {
  id: OrderBy;
  label: string;
  numeric: boolean;
  align?: "left" | "right" | "center";
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: "name", label: "Name", numeric: false, align: "left", sortable: true },
  { id: "minimumTuition", label: "Min Tuition", numeric: true, align: "right", sortable: true },
  { id: "maximumTuition", label: "Max Tuition", numeric: true, align: "right", sortable: true },
  {
    id: "isAcceptingRegistrations",
    label: "Registration Open",
    numeric: false,
    align: "center",
    sortable: true,
  },
  { id: "id", label: "Actions", numeric: false, align: "center", sortable: false },
];

function YearList() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [fetchingYear, setFetchingYear] = useState(false);
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("name");

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
      console.error("Error fetching years:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for new year dialog
  const handleNewYear = () => {
    setSelectedYear({
      id: "",
      name: "",
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
      console.error("Error fetching year:", error);
    } finally {
      setFetchingYear(false);
    }
  };

  // Handler for saving a new year
  const handleSaveNewYear = async (yearData: Partial<Year>) => {
    try {
      await createYear(yearData as Omit<Year, "id">);
      await loadYears();
    } catch (error) {
      console.error("Error creating year:", error);
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
      console.error("Error updating year:", error);
      throw error;
    }
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle column sort changes
  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Create sorted data
  const sortedYears = useMemo(() => {
    const sortedData = [...years];
    sortedData.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === undefined || bValue === undefined) {
        return 0;
      }

      // For boolean values
      if (typeof aValue === "boolean") {
        return (order === "asc" ? 1 : -1) * (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      // For string values (case-insensitive comparison)
      if (typeof aValue === "string") {
        return (order === "asc" ? 1 : -1) * aValue.localeCompare(bValue as string);
      }

      // For numeric values
      return (order === "asc" ? 1 : -1) * ((aValue as number) - (bValue as number));
    });
    return sortedData;
  }, [years, order, orderBy]);

  return (
    <>
      <Paper elevation={2} sx={{ overflow: "hidden" }}>
        <AppBar position="relative" sx={{ bgcolor: "green.900" }}>
          <Toolbar>
            <Typography variant="h6" component="h1">
              School Years
            </Typography>
          </Toolbar>
          {/* Toolbar extension with the FAB */}
          <Box sx={{ position: "relative", height: "28px" }}>
            <Tooltip title="Add new school year">
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleNewYear}
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
            <LoadingSpinner
              title={"Loading"}
              description={"Fetching school year information..."}
              minHeight={"200px"}
            />
          ) : (
            <TableContainer>
              <Table size="small" aria-label="school years table">
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell) => (
                      <TableCell
                        key={headCell.id}
                        align={headCell.align || "left"}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {headCell.sortable ? (
                          <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
                            onClick={() => handleRequestSort(headCell.id)}
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
                  {sortedYears.map((year) => (
                    <TableRow key={year.id} hover>
                      <TableCell>{year.name}</TableCell>
                      <TableCell align="right">{formatCurrency(year.minimumTuition)}</TableCell>
                      <TableCell align="right">{formatCurrency(year.maximumTuition)}</TableCell>
                      <TableCell align="center">
                        {year.isAcceptingRegistrations && (
                          <CheckCircleIcon color="success" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="View contracts">
                            <Link
                              component={RouterLink}
                              to={`/years/${year.id}/contracts`}
                              color="inherit"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                textDecoration: "none",
                                "&:hover": {
                                  color: "brown.500",
                                },
                              }}
                            >
                              <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Contracts
                            </Link>
                          </Tooltip>

                          <Tooltip title="View student roster">
                            <Link
                              component={RouterLink}
                              to={`/years/${year.id}/roster`}
                              color="inherit"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                textDecoration: "none",
                                "&:hover": {
                                  color: "brown.500",
                                },
                              }}
                            >
                              <ListAltIcon fontSize="small" sx={{ mr: 0.5 }} />
                              Roster
                            </Link>
                          </Tooltip>

                          <Tooltip title="Edit year">
                            <IconButton
                              size="small"
                              onClick={() => handleEditYear(year.id)}
                              color="primary"
                              sx={{ color: "brown.500", p: 0 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
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
        title={`Edit Year ${selectedYear?.name || ""}`}
        year={selectedYear || {}}
        loading={fetchingYear}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateYear}
      />
    </>
  );
}

export default YearList;
