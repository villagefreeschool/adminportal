import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import type { Guardian as GuardianType } from "@services/firebase/models/types";
import type React from "react";
import LabeledData from "./LabeledData";

interface GuardianProps {
  guardian: GuardianType;
}

/**
 * A component for displaying guardian information
 * Migrated from Vue Guardian component
 */
const Guardian: React.FC<GuardianProps> = ({ guardian }) => {
  const hasAddress = guardian.address1 || guardian.city;

  return (
    <Grid container spacing={2}>
      <LabeledData label={guardian.relationship || "Guardian"}>
        {guardian.firstName} {guardian.lastName}
      </LabeledData>

      {guardian.cellPhone && (
        <LabeledData label="Cell Phone" xs={12} sm={6}>
          {guardian.cellPhone}
        </LabeledData>
      )}

      {guardian.workPhone && (
        <LabeledData label="Work Phone" xs={12} sm={6}>
          {guardian.workPhone}
        </LabeledData>
      )}

      <LabeledData label="Email" xs={12} lg={6}>
        <Link href={`mailto:${guardian.email}`}>{guardian.email}</Link>
      </LabeledData>

      {hasAddress && (
        <LabeledData label="Address" xs={12} lg={6}>
          {guardian.address1 && <div>{guardian.address1}</div>}
          {guardian.address2 && <div>{guardian.address2}</div>}
          {guardian.city && (
            <div>
              {guardian.city}, {guardian.state} {guardian.zip}
            </div>
          )}
        </LabeledData>
      )}

      {guardian.notes && (
        <LabeledData label="Notes" xs={12}>
          {guardian.notes}
        </LabeledData>
      )}

      {guardian.occupation && (
        <LabeledData label="Occupation" xs={12} sm={6}>
          {guardian.occupation}
        </LabeledData>
      )}
    </Grid>
  );
};

export default Guardian;
