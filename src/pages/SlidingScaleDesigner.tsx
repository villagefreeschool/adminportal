/* eslint-disable no-undef */
import { useState, useMemo, ChangeEvent, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Slider,
  TextField,
  Grid2,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import Plot from 'react-plotly.js';
import {
  Steepness,
  DefaultMinimumIncome,
  DefaultMaximumIncome,
  DefaultMinimumTuition,
  DefaultMaximumTuition,
  formatCurrency,
} from '../services/tuitioncalc';

// Income steps for the table display
const INCOME_STEPS = [
  0, 5000, 10000, 15000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 120000,
  140000, 160000, 180000, 200000, 250000, 300000, 400000, 500000,
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

  // Additional configuration options
  const [displayMode, setDisplayMode] = useState<'table' | 'graph'>('graph');
  const [scenarioType, setScenarioType] = useState<'new' | 'returning'>('new');

  // Custom exponential transform function for the calculator
  const calculatorExponentTransform = useCallback((x: number, steepnessValue: number): number => {
    const adjustedSteepness = steepnessValue + 0.01; // Needed to avoid exactly equalling 1
    const numerator = Math.pow(adjustedSteepness, x) - 1;
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

  // Generate data for the graph
  const graphData = useMemo(() => {
    const incomes = generateIncomeDataPoints(Math.max(10000, minIncome - 10000), maxIncome + 50000);

    // Calculate tuition for each income using our custom function that respects UI steepness
    const tuitions = incomes.map((income) => customTuitionForIncome(income));

    // For returning families, show what they would pay with max 10% increase
    let returningTuitions: number[] = [];
    if (scenarioType === 'returning') {
      returningTuitions = incomes.map((income, i) => {
        const previousTuition = tuitions[i] * 0.9; // Simulating previous year's tuition
        return Math.min(tuitions[i], previousTuition * 1.1); // Max 10% increase
      });
    }

    return {
      incomes,
      tuitions,
      returningTuitions,
    };
  }, [minIncome, maxIncome, customTuitionForIncome, scenarioType]);

  // Handle input changes
  const handleMinIncomeChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === '') {
      setMinIncome(0);
      return;
    }

    const value = Number(event.target.value);
    if (!isNaN(value) && value >= 0) {
      setMinIncome(value);
    }
  };

  const handleMaxIncomeChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === '') {
      setMaxIncome(0);
      return;
    }

    const value = Number(event.target.value);
    // Don't constrain during typing - only enforce on blur
    if (!isNaN(value) && value >= 0) {
      setMaxIncome(value);
    }
  };

  const handleMinTuitionChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === '') {
      setMinTuition(0);
      return;
    }

    const value = Number(event.target.value);
    if (!isNaN(value) && value >= 0) {
      setMinTuition(value);
    }
  };

  const handleMaxTuitionChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Always allow empty string for input editing
    if (event.target.value === '') {
      setMaxTuition(0);
      return;
    }

    const value = Number(event.target.value);
    // Don't constrain during typing - only enforce on blur
    if (!isNaN(value) && value >= 0) {
      setMaxTuition(value);
    }
  };

  const handleSteepnessChange = (_event: unknown, value: number | number[]) => {
    setSteepness(value as number);
  };

  // Calculate tuition for the table view
  const calculateTuitionTable = () => {
    return INCOME_STEPS.map((income) => {
      const newFamilyTuition = customTuitionForIncome(income);

      // Simulate returning family with previous year's tuition
      const previousTuition = newFamilyTuition * 0.9; // Simulating previous year's tuition
      const returningFamilyTuition = Math.min(newFamilyTuition, previousTuition * 1.1); // Max 10% increase

      // Calculate per month and part-time rates
      const monthlyNewTuition = newFamilyTuition / 12;
      const partTimeNewTuition = newFamilyTuition * 0.625;

      return {
        income,
        newFamilyTuition,
        returningFamilyTuition,
        monthlyNewTuition,
        partTimeNewTuition,
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

        <Box sx={{ width: '100%' }}>
          {/* Two-column layout for Income Range and Tuition Range */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              width: '100%',
              gap: 3,
            }}
          >
            {/* Group 1: Income Range */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography gutterBottom>Income Range</Typography>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  label="Minimum Income"
                  type="text"
                  value={minIncome === 0 ? '' : minIncome}
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
                  value={maxIncome === 0 ? '' : maxIncome}
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
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography gutterBottom>Tuition Range</Typography>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <TextField
                  label="Minimum Tuition"
                  type="text"
                  value={minTuition === 0 ? '' : minTuition}
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
                  value={maxTuition === 0 ? '' : maxTuition}
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
          <Box sx={{ mt: 3, width: '100%' }}>
            <Typography gutterBottom>Curve Steepness: {steepness.toFixed(2)}</Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={steepness}
                onChange={handleSteepnessChange}
                min={1.0}
                max={50.0}
                step={0.1}
                valueLabelDisplay="auto"
                aria-labelledby="steepness-slider"
              />
            </Box>
            <Typography variant="caption" color="textSecondary">
              Higher values make the curve steeper, requiring higher incomes to reach higher tuition
              levels. The default value is 1.56.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Tuition Scale Visualization</Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Family Type</InputLabel>
              <Select
                value={scenarioType}
                label="Family Type"
                onChange={(e) => setScenarioType(e.target.value as 'new' | 'returning')}
              >
                <MenuItem value="new">New Families</MenuItem>
                <MenuItem value="returning">Returning Families</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={displayMode}
                label="View Mode"
                onChange={(e) => setDisplayMode(e.target.value as 'table' | 'graph')}
              >
                <MenuItem value="graph">Graph</MenuItem>
                <MenuItem value="table">Table</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {displayMode === 'graph' ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <Plot
              data={[
                {
                  x: graphData.incomes,
                  y: graphData.tuitions,
                  type: 'scatter',
                  mode: 'lines',
                  name: 'New Family Tuition',
                  line: { color: '#1976d2' },
                },
                ...(scenarioType === 'returning'
                  ? [
                      {
                        x: graphData.incomes,
                        y: graphData.returningTuitions,
                        type: 'scatter',
                        mode: 'lines',
                        name: 'Returning Family Tuition',
                        line: { color: '#4caf50', dash: 'dash' },
                      },
                    ]
                  : []),
              ]}
              layout={{
                title: 'Tuition by Income',
                autosize: true,
                xaxis: {
                  title: 'Annual Income ($)',
                  tickformat: '$,.0f',
                },
                yaxis: {
                  title: 'Annual Tuition ($)',
                  tickformat: '$,.0f',
                },
                legend: {
                  x: 0.05,
                  y: 0.95,
                },
                margin: { l: 70, r: 40, t: 50, b: 50 },
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Annual Income</TableCell>
                  <TableCell>New Family Tuition</TableCell>
                  {scenarioType === 'returning' && <TableCell>Returning Family Tuition</TableCell>}
                  <TableCell>Monthly Payment</TableCell>
                  <TableCell>Part-Time Tuition</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calculateTuitionTable().map((row) => (
                  <TableRow key={row.income}>
                    <TableCell>{formatCurrency(row.income)}</TableCell>
                    <TableCell>{formatCurrency(row.newFamilyTuition)}</TableCell>
                    {scenarioType === 'returning' && (
                      <TableCell>{formatCurrency(row.returningFamilyTuition)}</TableCell>
                    )}
                    <TableCell>{formatCurrency(row.monthlyNewTuition)}</TableCell>
                    <TableCell>{formatCurrency(row.partTimeNewTuition)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default SlidingScaleDesigner;
