import ContractEditDialog from "@/components/contracts/ContractEditDialog";
import ContractPDFGenerator from "@/components/contracts/ContractPDFGenerator";
import LabeledData from "@components/LabeledData";
import { useAuth } from "@contexts/useAuth";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import DownloadIcon from "@mui/icons-material/Download";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import EditIcon from "@mui/icons-material/Edit";
import InboxIcon from "@mui/icons-material/Inbox";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  fetchContracts,
  prepareContractsForDisplay,
  studentCountForContract,
} from "@services/firebase/contracts";
import type { Contract, Enrollment, Family, Year } from "@services/firebase/models/types";
import { enrolledStudentsInYear, fetchYear } from "@services/firebase/years";
import { enrolledFamiliesInYear } from "@services/firebase/years";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import _ from "lodash";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

// Format currency values
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

// Format per-student averages
const formatAverage = (total: number, count: number): string => {
  if (count === 0) return formatCurrency(0);
  return formatCurrency(total / count);
};

// Column definition
interface Column {
  id: string;
  label: string;
  align?: "inherit" | "left" | "center" | "right" | "justify";
  sortable?: boolean;
}

// Define table columns
const columns: Column[] = [
  { id: "familyNameAndGuardians", label: "Family", align: "left" },
  { id: "tuition", label: "Tuition", align: "right" },
  { id: "fullTimeNames", label: "Full Time", align: "left" },
  { id: "partTimeNames", label: "Part Time", align: "left" },
  { id: "tuitionAssistance", label: "Tuition Assistance", align: "center" },
  { id: "isSigned", label: "Signed", align: "center" },
  { id: "actions", label: "Actions", align: "center", sortable: false },
];

/**
 * YearContracts component displays contracts for a specific school year
 * Migrated from Vue YearContracts
 */
function YearContracts() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const theme = useTheme();

  // State variables
  const [year, setYear] = useState<Year | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  // Need to reference unused state for correct data structure
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [families, setFamilies] = useState<Family[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");

  // Load data when component mounts or ID changes
  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  // Load year and contracts data
  const loadData = async (yearId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Load year data
      const yearData = await fetchYear(yearId);

      if (!yearData) {
        setError("Year not found");
        setLoading(false);
        return;
      }

      setYear(yearData);

      // Load contracts, families, and enrollments in parallel
      const [contractsData, familiesData, enrollmentsData] = await Promise.all([
        fetchContracts(yearId),
        enrolledFamiliesInYear(yearId),
        enrolledStudentsInYear(yearId),
      ]);

      setFamilies(familiesData);
      setEnrollments(enrollmentsData);

      // Prepare contracts with additional display data
      const preparedContracts = await prepareContractsForDisplay(
        contractsData,
        familiesData,
        enrollmentsData,
      );

      setContracts(preparedContracts);
    } catch (err) {
      console.error("Error loading contracts data:", err);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit contract
  const handleEditContract = (familyId: string) => {
    setSelectedFamilyId(familyId);
    setEditDialogOpen(true);
  };

  // Handle contract saved
  const handleContractSaved = (updatedContract: Contract) => {
    // Update the contract in the list
    setContracts((prevContracts) => {
      const index = prevContracts.findIndex((c) => c.id === updatedContract.id);
      if (index >= 0) {
        const newContracts = [...prevContracts];
        newContracts[index] = {
          ...newContracts[index],
          ...updatedContract,
        };
        return newContracts;
      }
      return [...prevContracts, updatedContract];
    });
  };

  // Download contracts as Excel spreadsheet
  const downloadExcel = async () => {
    if (!year) return;

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "admin.villagefreeschool.org";
    workbook.created = new Date();

    const sheetName = `${year.name} Contracts`;
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns
    worksheet.columns = [
      { header: "Family", key: "family", width: 25 },
      { header: "Signed", key: "signed", width: 10 },
      { header: "Tuition", key: "tuition", width: 12 },
      { header: "Full Time", key: "fullTime", width: 20 },
      { header: "Part Time", key: "partTime", width: 20 },
    ];

    // Add data rows
    for (const contract of sortedContracts) {
      worksheet.addRow({
        family: contract.familyName || "",
        signed: contract.isSigned ? "Signed" : "",
        tuition: contract.tuition?.toFixed(2) || "0.00",
        fullTime: contract.fullTimeNames || "",
        partTime: contract.partTimeNames || "",
      });
    }

    // Make the header row bold
    worksheet.getRow(1).font = { bold: true };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new window.Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create safe filename
    const safeName = year.name.replace(/[\W_]+/g, "");
    saveAs(blob, `${safeName}Contracts.xlsx`);
  };

  // Computed values

  // Sorted contracts
  const sortedContracts = useMemo(() => {
    return _.orderBy(contracts, "familyNameAndGuardians", "asc");
  }, [contracts]);

  // Filtered contracts based on search
  const filteredContracts = useMemo(() => {
    if (!search) return sortedContracts;

    const searchLower = search.toLowerCase();
    return sortedContracts.filter((contract) => {
      return (
        String(contract.familyName || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(contract.familyNameAndGuardians || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(contract.fullTimeNames || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(contract.partTimeNames || "")
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [sortedContracts, search]);

  // Signed contracts
  const signedContracts = useMemo(() => {
    return contracts.filter((c) => c.isSigned);
  }, [contracts]);

  // Unsigned contracts
  const unsignedContracts = useMemo(() => {
    return contracts.filter((c) => !c.isSigned);
  }, [contracts]);

  // Total revenue
  const revenue = useMemo(() => {
    return _.sumBy(contracts, "tuition") || 0;
  }, [contracts]);

  // Assistance amount
  const assistance = useMemo(() => {
    return _.sumBy(contracts, "assistanceAmount") || 0;
  }, [contracts]);

  // Signed revenue
  const signedRevenue = useMemo(() => {
    return _.sumBy(signedContracts, "tuition") || 0;
  }, [signedContracts]);

  // Unsigned revenue
  const unsignedRevenue = useMemo(() => {
    return _.sumBy(unsignedContracts, "tuition") || 0;
  }, [unsignedContracts]);

  // Student counts
  const studentCount = useMemo(() => {
    return contracts.reduce((total, contract) => {
      return total + studentCountForContract(contract);
    }, 0);
  }, [contracts]);

  const signedStudentCount = useMemo(() => {
    return signedContracts.reduce((total, contract) => {
      return total + studentCountForContract(contract);
    }, 0);
  }, [signedContracts]);

  const unsignedStudentCount = useMemo(() => {
    return unsignedContracts.reduce((total, contract) => {
      return total + studentCountForContract(contract);
    }, 0);
  }, [unsignedContracts]);

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
          {error || "Year not found"}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: "hidden" }}>
      <AppBar position="relative" sx={{ bgcolor: theme.palette.green[900] }}>
        <Toolbar>
          <Typography variant="h6" component="h1">
            {year.name} Contracts
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            size="small"
            sx={{
              ml: 2,
              width: { xs: "120px", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                },
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "white" }} />
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
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h5">
                  {signedContracts.length} ({formatCurrency(signedRevenue)})
                </Typography>
                <Typography variant="body-md">
                  Signed
                  <Typography variant="caption" display="block">
                    ({formatAverage(signedRevenue, signedStudentCount)} / child)
                  </Typography>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h5">
                  {unsignedContracts.length} ({formatCurrency(unsignedRevenue)})
                </Typography>
                <Typography variant="body-md">
                  Unsigned
                  <Typography variant="caption" display="block">
                    ({formatAverage(unsignedRevenue, unsignedStudentCount)} / child)
                  </Typography>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="h5">
                  {contracts.length} ({formatCurrency(revenue)})
                </Typography>
                <Typography variant="body-md">
                  Total
                  <Typography variant="caption" display="block">
                    ({formatAverage(revenue, studentCount)} / child)
                  </Typography>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="contracts table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} hover>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={`/families/${contract.familyID}`}
                        underline="hover"
                        color="inherit"
                      >
                        {contract.familyName}
                      </Link>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(contract.tuition)}</TableCell>
                    <TableCell>{contract.fullTimeNames || ""}</TableCell>
                    <TableCell>{contract.partTimeNames || ""}</TableCell>
                    <TableCell align="center">
                      {contract.tuitionAssistanceRequested &&
                        !contract.tuitionAssistanceGranted && (
                          <InboxIcon sx={{ color: theme.palette.error.main }} fontSize="small" />
                        )}
                      {contract.tuitionAssistanceRequested && contract.tuitionAssistanceGranted && (
                        <CardGiftcardIcon
                          sx={{ color: theme.palette.green[900] }}
                          fontSize="small"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {contract.isSigned && (
                        <DriveFileRenameOutlineIcon
                          sx={{ color: theme.palette.green[900] }}
                          fontSize="small"
                        />
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
                        <Tooltip title="Edit contract">
                          <IconButton
                            size="small"
                            onClick={() => handleEditContract(contract.familyID)}
                            sx={{
                              color: "white",
                              bgcolor: theme.palette.brown[500],
                              "&:hover": { bgcolor: theme.palette.brown[700] },
                              p: "3px",
                              width: "24px",
                              height: "24px",
                            }}
                          >
                            <EditIcon sx={{ fontSize: "16px" }} />
                          </IconButton>
                        </Tooltip>

                        {contract.family && (
                          <ContractPDFGenerator
                            year={year}
                            family={contract.family}
                            contract={contract}
                            customButton={
                              <IconButton
                                sx={{
                                  color: "white",
                                  bgcolor: theme.palette.green[800],
                                  "&:hover": { bgcolor: theme.palette.green[900] },
                                  p: "3px",
                                  width: "24px",
                                  height: "24px",
                                }}
                              >
                                <PictureAsPdfIcon sx={{ fontSize: "16px" }} />
                              </IconButton>
                            }
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box mt={4}>
          <Grid container justifyContent="center" textAlign="center">
            <LabeledData label="Assistance Given" xs={12} sm={4}>
              <Typography variant="h5">{formatCurrency(assistance)}</Typography>
            </LabeledData>
          </Grid>
        </Box>
      </Box>

      {/* Contract Edit Dialog */}
      <ContractEditDialog
        open={editDialogOpen}
        yearId={id || ""}
        familyId={selectedFamilyId}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleContractSaved}
      />
    </Paper>
  );
}

export default YearContracts;
