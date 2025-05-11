import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import type { Year } from "../services/firebase/years";
import { formatCurrency, tuitionForIncome } from "../services/tuitioncalc";

interface YearTuitionChartProps {
  year: Year;
}

export default function YearTuitionChart({ year }: YearTuitionChartProps) {
  const incomeAmounts = useMemo(() => {
    const increment = 5000;
    const amounts: number[] = [];
    const maxIncome = (year?.maximumIncome || 150000) * 2;

    for (let income = 10000; income < maxIncome + increment; income = income + increment) {
      amounts.push(income);
    }

    return amounts;
  }, [year?.maximumIncome]);

  const calculateTuition = (
    income: number,
    opts: { fullTime?: number; partTime?: number; siblings?: number },
  ) => {
    return tuitionForIncome(income, { ...opts, year });
  };

  return (
    <Paper sx={{ bgcolor: "grey.100", p: 3, mt: 3 }} elevation={0}>
      <Typography variant="h5" component="h3" gutterBottom>
        Sliding Scale
      </Typography>

      <TableContainer component={Paper} elevation={0}>
        <Table size="small" aria-label="tuition sliding scale">
          <TableHead>
            <TableRow sx={{ "& .MuiTableCell-root": { fontWeight: "bold" } }}>
              <TableCell align="right">Income</TableCell>
              <TableCell align="right">Full Time</TableCell>
              <TableCell align="right">Part Time</TableCell>
              <TableCell align="right">2 Siblings Full Time</TableCell>
              <TableCell align="right">3 Siblings Full Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomeAmounts.map((income) => (
              <TableRow key={income} hover>
                <TableCell align="right">{formatCurrency(income)}</TableCell>
                <TableCell align="right">
                  {formatCurrency(calculateTuition(income, { fullTime: 1 }))}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(calculateTuition(income, { partTime: 1 }))}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(calculateTuition(income, { fullTime: 1, siblings: 1 }))}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(calculateTuition(income, { fullTime: 1, siblings: 2 }))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
