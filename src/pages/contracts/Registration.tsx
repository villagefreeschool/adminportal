import { useAuth } from "@contexts/useAuth";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import { fetchFamily } from "@services/firebase/families";
import type { Family, Year } from "@services/firebase/models/types";
import { fetchYears } from "@services/firebase/years";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Contract from "@/components/contracts/Contract";

/**
 * Registration page shows contract information for family registration
 */
function Registration() {
  const { id } = useParams<{ id?: string }>();
  const { isAdmin, myFamily } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<Family | null>(null);
  const [years, setYears] = useState<Year[]>([]);

  // Load family data if given an ID, otherwise use the current user's family
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // Load years first
        const fetchedYears = await fetchYears();
        setYears(fetchedYears);

        // Load family data if ID is provided
        if (id) {
          const fetchedFamily = await fetchFamily(id);
          setFamily(fetchedFamily);
        } else {
          // Use the user's own family if no ID provided (for /register path)
          setFamily(myFamily);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, myFamily]);

  // Filter years to only show those accepting registrations (or all for admins)
  const displayedYears = years.filter((year) => year.isAcceptingRegistrations || isAdmin);

  // Show loading state
  if (loading) {
    return (
      <Container>
        <LinearProgress />
      </Container>
    );
  }

  // Show error if no family found
  if (!family) {
    return (
      <Container>
        <Typography variant="h5" color="error" gutterBottom>
          Family not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={2}>
        {displayedYears.map((year) => (
          <Grid size={{ xs: 12 }} key={year.id}>
            <Card>
              <CardHeader
                title={`${family.name} Registration For ${year.name}`}
                sx={{ bgcolor: "green.900", color: "white" }}
              />
              <CardContent>
                {!family.students ? (
                  <Typography>No students in your family.</Typography>
                ) : (
                  <>
                    {!year.isAcceptingRegistrations && (
                      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                        NOTE: This is only visible to administrators because registrations are not
                        being accepted for {year.name}.
                      </Alert>
                    )}
                    <Contract familyId={family.id} yearId={year.id} />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Registration;
