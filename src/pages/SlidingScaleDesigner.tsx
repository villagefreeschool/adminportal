import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
/* eslint-disable no-undef */
import { type ChangeEvent, Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";

// Lazy load the Plot component to reduce initial bundle size
const Plot = lazy(() => import("../components/PlotlySetup"));
import { fetchContracts } from "../services/firebase/contracts";
import type { Contract, Family, Year } from "../services/firebase/models/types";
import { enrolledFamiliesInYear, fetchYears } from "../services/firebase/years";
import {
  DefaultMaximumIncome,
  DefaultMaximumTuition,
  DefaultMinimumIncome,
  DefaultMinimumTuition,
  Steepness,
  formatCurrency,
} from "../services/tuitioncalc";

// Income steps for the table display
const INCOME_STEPS = [
  0, 5000, 10000, 15000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 120000,
  140000, 160000, 180000, 200000, 225000, 250000,
];

// Generate income data points for the graph visualization
const generateIncomeDataPoints = (min: number, max: number, count = 100): number[] => {
  const points: number[] = [];
  const step = (max - min) / (count - 1);

  for (let i = 0; i < count; i++) {
    points.push(min + i * step);
  }

  return points;
};

function SlidingScaleDesigner() {
  // State for the tuition calculation parameters
  const [minIncome, setMinIncome] = useState(DefaultMinimumIncome);
  const [maxIncome, setMaxIncome] = useState(DefaultMaximumIncome);
  const [minTuition, setMinTuition] = useState(DefaultMinimumTuition);
  const [maxTuition, setMaxTuition] = useState(DefaultMaximumTuition);
  const [steepness, setSteepness] = useState(Steepness);

  // State for year selection and family data
  const [years, setYears] = useState<Year[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [families, setFamilies] = useState<Family[]>([]);
  const [contractsData, setContractsData] = useState<Contract[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch available years on component mount
  useEffect(() => {
    const loadYears = async () => {
      try {
        const yearsData = await fetchYears();
        setYears(yearsData);

        // Select the first year by default if available
        if (yearsData.length > 0) {
          setSelectedYearId(yearsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    loadYears();
  }, []);

  // Fetch families and contracts when selected year changes
  useEffect(() => {
    const loadFamilyData = async () => {
      if (!selectedYearId) return;

      setLoading(true);
      try {
        // Fetch both families and contracts in parallel
        const [familiesData, contractsData] = await Promise.all([
          enrolledFamiliesInYear(selectedYearId),
          fetchContracts(selectedYearId),
        ]);

        setFamilies(familiesData);
        setContractsData(contractsData);
      } catch (error) {
        console.error("Error fetching family data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFamilyData();
  }, [selectedYearId]);

  // Handle year selection change
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYearId(event.target.value);
  };

  // Custom exponential transform function for the calculator
  const calculatorExponentTransform = useCallback((x: number, steepnessValue: number): number => {
    const adjustedSteepness = steepnessValue + 0.01; // Needed to avoid exactly equalling 1
    const numerator = adjustedSteepness ** x - 1;
    const denominator = adjustedSteepness - 1;
    return numerator / denominator;
  }, []);

  // Custom tuition calculation function that respects the UI steepness
  const customTuitionForIncome = useCallback(
    (income: number): number => {
      if (income <= minIncome) {
        return minTuition;
      }
      if (income >= maxIncome) {
        return maxTuition;
      }

      // x is a value between 0 and 1 representing where the income
      // falls between max and min
      const x = (income - minIncome) / (maxIncome - minIncome);

      // y is a value between 0 and 1 representing where the
      // tuition should fall between max and min
      const y = calculatorExponentTransform(x, steepness);

      return minTuition + (maxTuition - minTuition) * y;
    },
    [minIncome, maxIncome, minTuition, maxTuition, steepness, calculatorExponentTransform],
  );

  // Function to create histogram bins for family incomes
  const generateHistogramData = useCallback(() => {
    if (!families.length) return { x: [], y: [], bins: [] };

    // Define bin width (e.g., $5,000 or $10,000 increments)
    const binWidth = 10000;
    const minBin = 0;
    const maxBin = Math.max(maxIncome + 50000, 300000); // Ensure we cover high incomes

    // Create histogram bins
    const bins: number[] = [];
    for (let i = minBin; i <= maxBin; i += binWidth) {
      bins.push(i);
    }

    // Initialize counts for each bin
    const binCounts = new Array(bins.length).fill(0);

    // Count families in each income bin
    families.forEach((family) => {
      let income = family.grossFamilyIncome;

      // Handle families that opted out or didn't provide income
      if (income === null || income === undefined || family.slidingScaleOptOut) {
        // Place them in the bin that includes maxTuition
        income = maxIncome;
      }

      // Find the appropriate bin
      const binIndex = Math.min(Math.floor((income - minBin) / binWidth), binCounts.length - 1);

      // Increment the bin count
      if (binIndex >= 0 && binIndex < binCounts.length) {
        binCounts[binIndex]++;
      }
    });

    // Filter out empty bins to make the visualization cleaner
    const filteredBins = [];
    const filteredCounts = [];
    const centerPoints = [];

    for (let i = 0; i < bins.length - 1; i++) {
      if (binCounts[i] > 0) {
        filteredBins.push(bins[i]);
        filteredCounts.push(binCounts[i]);
        centerPoints.push(bins[i] + binWidth / 2); // Center of the bin for x position
      }
    }

    return {
      x: centerPoints,
      y: filteredCounts,
      bins: filteredBins,
    };
  }, [families, maxIncome]);

  // Calculate estimated revenue based on current tuition parameters
  const estimatedRevenue = useMemo(() => {
    if (!contractsData.length) return 0;

    let totalRevenue = 0;

    contractsData.forEach((contract) => {
      if (!contract.studentDecisions) return;

      // Get the family that corresponds to this contract
      const family = families.find((f) => f.id === contract.familyID);
      if (!family) return;

      let income = family.grossFamilyIncome;

      // Handle families that opted out or didn't provide income
      if (income === null || income === undefined || family.slidingScaleOptOut) {
        income = maxIncome;
      }

      // Count full-time, part-time students
      let fullTimeCount = 0;
      let partTimeCount = 0;
      let siblingCount = 0;

      for (const studentID in contract.studentDecisions) {
        const decision = contract.studentDecisions[studentID];

        if (decision === "Full Time") {
          if (fullTimeCount === 0) {
            fullTimeCount = 1;
          } else {
            siblingCount++;
          }
        } else if (decision === "Part Time") {
          partTimeCount++;
        }
      }

      // Calculate base tuition for this family
      const baseTuition = customTuitionForIncome(income);

      // Calculate tuition factoring in full-time, part-time, and siblings
      const fullTimeFactor = fullTimeCount;
      const partTimeFactor = partTimeCount * 0.625; // Part-time discount
      const siblingFactor = siblingCount * 0.85; // Sibling discount

      const familyTuition = Math.round(
        baseTuition * (fullTimeFactor + partTimeFactor + siblingFactor),
      );
      totalRevenue += familyTuition;
    });

    return totalRevenue;
  }, [contractsData, families, maxIncome, customTuitionForIncome]);

  // Generate data for the graph
  const graphData = useMemo(() => {
    // Create a combined set of income points
    // Start with the table income steps
    const tableIncomes = [...INCOME_STEPS];

    // Add additional points for a smooth curve, focusing on the minIncome to maxIncome range
    const additionalIncomes = generateIncomeDataPoints(
      Math.max(10000, minIncome - 10000),
      maxIncome + 50000,
    );

    // Combine and remove duplicates
    const combinedIncomes = [...new Set([...tableIncomes, ...additionalIncomes])].sort(
      (a, b) => a - b,
    );

    // Calculate tuition for each income using our custom function that respects UI steepness
    const fullTuitions = combinedIncomes.map((income) => customTuitionForIncome(income));

    // Calculate half-time tuition (62.5% of full tuition)
    const halfTuitions = fullTuitions.map((tuition) => tuition * 0.625);

    // Calculate sibling discount tuition (15% discount)
    const siblingTuitions = fullTuitions.map((tuition) => tuition * 0.85);

    // Create marker sizes array - only show markers for table income values
    const markerSizes = combinedIncomes.map((income) => (INCOME_STEPS.includes(income) ? 6 : 0));

    // Generate histogram data
    const histogramData = generateHistogramData();

    return {
      incomes: combinedIncomes,
      fullTuitions,
      halfTuitions,
      siblingTuitions,
      markerSizes,
      histogramData,
    };
  }, [minIncome, maxIncome, customTuitionForIncome, generateHistogramData]);

  // Handle input changes
  const handleMinIncomeChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === "") {
      setMinIncome(0);
      return;
    }

    const value = Number(event.target.value);
    if (!Number.isNaN(value) && value >= 0) {
      setMinIncome(value);
    }
  };

  const handleMaxIncomeChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === "") {
      setMaxIncome(0);
      return;
    }

    const value = Number(event.target.value);
    // Don't constrain during typing - only enforce on blur
    if (!Number.isNaN(value) && value >= 0) {
      setMaxIncome(value);
    }
  };

  const handleMinTuitionChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === "") {
      setMinTuition(0);
      return;
    }

    const value = Number(event.target.value);
    if (!Number.isNaN(value) && value >= 0) {
      setMinTuition(value);
    }
  };

  const handleMaxTuitionChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === "") {
      setMaxTuition(0);
      return;
    }

    const value = Number(event.target.value);
    // Don't constrain during typing - only enforce on blur
    if (!Number.isNaN(value) && value >= 0) {
      setMaxTuition(value);
    }
  };

  // Transform slider value (0-100) to steepness (1-50) with emphasis on lower range
  const sliderToSteepness = (sliderValue: number): number => {
    // Map 0-30 on slider to 1-5 steepness (more precision in lower range)
    if (sliderValue <= 30) {
      return 1 + (sliderValue / 30) * 4;
    }
    // Map 30-100 on slider to 5-50 steepness (faster change in higher range)

    return 5 + ((sliderValue - 30) / 70) * 45;
  };

  // Inverse function: Transform steepness (1-50) to slider value (0-100)
  const steepnessToSlider = (steepnessValue: number): number => {
    if (steepnessValue <= 5) {
      return ((steepnessValue - 1) / 4) * 30;
    }
    return 30 + ((steepnessValue - 5) / 45) * 70;
  };

  // The current position of the slider (0-100)
  const [sliderPosition, setSliderPosition] = useState(steepnessToSlider(steepness));

  const handleSteepnessChange = (_event: unknown, value: number | number[]) => {
    const sliderValue = value as number;
    setSliderPosition(sliderValue);
    setSteepness(sliderToSteepness(sliderValue));
  };

  // Calculate tuition for the table view
  const calculateTuitionTable = () => {
    return INCOME_STEPS.map((income) => {
      const fullTuition = customTuitionForIncome(income);

      // Calculate per month and part-time rates
      const monthlyTuition = fullTuition / 12;
      const halfTimeTuition = fullTuition * 0.625;
      const siblingDiscountTuition = fullTuition * 0.85;

      return {
        income,
        fullTuition,
        halfTimeTuition,
        siblingDiscountTuition,
        monthlyTuition,
      };
    });
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Sliding Scale Designer
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tuition Scale Parameters
        </Typography>

        <Box sx={{ width: "100%" }}>
          {/* Two-column layout for Income Range and Tuition Range */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              width: "100%",
              gap: 3,
            }}
          >
            {/* Group 1: Income Range */}
            <Box sx={{ flex: 1, width: "100%" }}>
              <Typography gutterBottom>Income Range</Typography>
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <TextField
                  label="Minimum Income"
                  type="text"
                  value={minIncome === 0 ? "" : minIncome}
                  onChange={handleMinIncomeChange}
                  onBlur={() => {
                    if (minIncome <= 0) setMinIncome(DefaultMinimumIncome);
                  }}
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography>$</Typography>,
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Maximum Income"
                  type="text"
                  value={maxIncome === 0 ? "" : maxIncome}
                  onChange={handleMaxIncomeChange}
                  onBlur={() => {
                    if (maxIncome <= minIncome) setMaxIncome(DefaultMaximumIncome);
                  }}
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography>$</Typography>,
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            {/* Group 2: Tuition Range */}
            <Box sx={{ flex: 1, width: "100%" }}>
              <Typography gutterBottom>Tuition Range</Typography>
              <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <TextField
                  label="Minimum Tuition"
                  type="text"
                  value={minTuition === 0 ? "" : minTuition}
                  onChange={handleMinTuitionChange}
                  onBlur={() => {
                    if (minTuition <= 0) setMinTuition(DefaultMinimumTuition);
                  }}
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography>$</Typography>,
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Maximum Tuition"
                  type="text"
                  value={maxTuition === 0 ? "" : maxTuition}
                  onChange={handleMaxTuitionChange}
                  onBlur={() => {
                    if (maxTuition <= minTuition) setMaxTuition(DefaultMaximumTuition);
                  }}
                  fullWidth
                  InputProps={{
                    startAdornment: <Typography>$</Typography>,
                  }}
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Steepness slider (full width) */}
          <Box sx={{ mt: 3, width: "100%" }}>
            <Typography gutterBottom>Curve Steepness Factor: {steepness.toFixed(2)}</Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={sliderPosition}
                onChange={handleSteepnessChange}
                min={0}
                max={100}
                step={1}
                aria-labelledby="steepness-slider"
                marks={[
                  { value: 0, label: "1.0" },
                  { value: 30, label: "5.0" },
                  { value: 65, label: "25.0" },
                  { value: 100, label: "50.0" },
                ]}
              />
            </Box>
            <Typography variant="caption" color="textSecondary">
              Higher values make the curve steeper, requiring higher incomes to reach higher tuition
              levels. The slider provides finer control in the 1-5 range where small changes have
              the most impact. The default value is 1.56.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Tuition Scale Visualization</Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="year-select-label">Show Families from Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYearId}
                label="Show Families from Year"
                onChange={handleYearChange}
                disabled={loading}
              >
                {years.map((year) => (
                  <MenuItem key={year.id} value={year.id}>
                    {year.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {estimatedRevenue > 0 && (
              <Typography variant="body-md">
                Estimated Revenue: {formatCurrency(estimatedRevenue)}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ height: 500, width: "100%", mb: 4 }}>
          <Suspense
            fallback={
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "500px",
                }}
              >
                <CircularProgress />
              </Box>
            }
          >
            <Plot
              data={[
                {
                  x: graphData.incomes,
                  y: graphData.fullTuitions,
                  type: "scatter",
                  mode: "lines+markers",
                  name: "Full Tuition",
                  line: { color: "#1976d2" },
                  marker: { size: graphData.markerSizes },
                  hovertemplate: "Income: %{x:$,.0f}<br>Tuition: %{y:$,.0f}<extra></extra>",
                  yaxis: "y",
                },
                {
                  x: graphData.incomes,
                  y: graphData.halfTuitions,
                  type: "scatter",
                  mode: "lines+markers",
                  name: "Half-Time Tuition",
                  line: { color: "#4caf50" },
                  marker: { size: graphData.markerSizes },
                  hovertemplate: "Income: %{x:$,.0f}<br>Tuition: %{y:$,.0f}<extra></extra>",
                  yaxis: "y",
                },
                {
                  x: graphData.incomes,
                  y: graphData.siblingTuitions,
                  type: "scatter",
                  mode: "lines+markers",
                  name: "Sibling Discount (85%)",
                  line: { color: "#ff9800" },
                  marker: { size: graphData.markerSizes },
                  hovertemplate: "Income: %{x:$,.0f}<br>Tuition: %{y:$,.0f}<extra></extra>",
                  yaxis: "y",
                },
                {
                  x: graphData.histogramData.x,
                  y: graphData.histogramData.y,
                  type: "bar",
                  name: "Family Count",
                  marker: {
                    color: "rgba(180, 180, 180, 0.6)",
                    line: {
                      color: "rgba(150, 150, 150, 1.0)",
                      width: 1,
                    },
                  },
                  yaxis: "y2",
                  hovertemplate: "Income Bin: %{x:$,.0f}<br>Families: %{y}<extra></extra>",
                  opacity: 0.7,
                },
              ]}
              layout={{
                title: "Tuition by Income",
                autosize: true,
                xaxis: {
                  title: "Annual Income ($)",
                  tickformat: "$,.0f",
                },
                yaxis: {
                  title: "Annual Tuition ($)",
                  tickformat: "$,.0f",
                },
                yaxis2: {
                  title: "Number of Families",
                  titlefont: { color: "rgb(148, 148, 148)" },
                  tickfont: { color: "rgb(148, 148, 148)" },
                  overlaying: "y",
                  side: "right",
                  showgrid: false,
                },
                legend: {
                  x: 0.07,
                  y: 0.95,
                },
                margin: { l: 70, r: 70, t: 50, b: 50 },
                hovermode: "closest",
                barmode: "group",
              }}
              useResizeHandler={true}
              style={{ width: "100%", height: "100%" }}
            />
          </Suspense>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Annual Income</TableCell>
                <TableCell>Full Tuition</TableCell>
                <TableCell>Half-Time Tuition</TableCell>
                <TableCell>Sibling Discount</TableCell>
                <TableCell>Monthly Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calculateTuitionTable().map((row) => (
                <TableRow key={row.income}>
                  <TableCell>{formatCurrency(row.income)}</TableCell>
                  <TableCell>{formatCurrency(row.fullTuition)}</TableCell>
                  <TableCell>{formatCurrency(row.halfTimeTuition)}</TableCell>
                  <TableCell>{formatCurrency(row.siblingDiscountTuition)}</TableCell>
                  <TableCell>{formatCurrency(row.monthlyTuition)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Container>
  );
}

export default SlidingScaleDesigner;
