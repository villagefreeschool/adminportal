/* eslint-disable no-undef */
import { useState, useMemo, ChangeEvent, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Slider,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
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

  // No additional configuration options needed

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

    return {
      incomes: combinedIncomes,
      fullTuitions,
      halfTuitions,
      siblingTuitions,
      markerSizes,
    };
  }, [minIncome, maxIncome, customTuitionForIncome]);

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

  // Transform slider value (0-100) to steepness (1-50) with emphasis on lower range
  const sliderToSteepness = (sliderValue: number): number => {
    // Map 0-30 on slider to 1-5 steepness (more precision in lower range)
    if (sliderValue <= 30) {
      return 1 + (sliderValue / 30) * 4;
    }
    // Map 30-100 on slider to 5-50 steepness (faster change in higher range)
    else {
      return 5 + ((sliderValue - 30) / 70) * 45;
    }
  };

  // Inverse function: Transform steepness (1-50) to slider value (0-100)
  const steepnessToSlider = (steepnessValue: number): number => {
    if (steepnessValue <= 5) {
      return ((steepnessValue - 1) / 4) * 30;
    } else {
      return 30 + ((steepnessValue - 5) / 45) * 70;
    }
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
                  { value: 0, label: '1.0' },
                  { value: 30, label: '5.0' },
                  { value: 65, label: '25.0' },
                  { value: 100, label: '50.0' },
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Tuition Scale Visualization</Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="subtitle1">
              Showing full time, half time, and sibling discount tuition rates
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ height: 500, width: '100%', mb: 4 }}>
          <Plot
            data={[
              {
                x: graphData.incomes,
                y: graphData.fullTuitions,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Full Tuition',
                line: { color: '#1976d2' },
                marker: { size: graphData.markerSizes },
                hovertemplate: 'Income: %{x:$,.0f}<br>Tuition: %{y:$,.0f}<extra></extra>',
              },
              {
                x: graphData.incomes,
                y: graphData.halfTuitions,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Half-Time Tuition',
                line: { color: '#4caf50' },
                marker: { size: graphData.markerSizes },
                hovertemplate: 'Income: %{x:$,.0f}<br>Tuition: %{y:$,.0f}<extra></extra>',
              },
              {
                x: graphData.incomes,
                y: graphData.siblingTuitions,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Sibling Discount (85%)',
                line: { color: '#ff9800' },
                marker: { size: graphData.markerSizes },
                hovertemplate: 'Income: %{x:$,.0f}<br>Tuition: %{y:$,.0f}<extra></extra>',
              },
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
              hovermode: 'closest',
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
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
