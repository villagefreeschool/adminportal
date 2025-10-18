import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { Contract, Family, Year } from "@services/firebase/models/types";
import { loadPdfMake } from "@utils/pdfMakeLoader";
import {
  dataURLFromImagePath,
  normalizeSignatureForPdf,
  PDF_DEFAULT_STYLE,
  PDF_STYLES,
} from "@utils/pdfUtil";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import React, { useEffect, useState } from "react";

interface ContractPDFGeneratorProps {
  year: Year;
  family: Family;
  contract: Contract;
  color?: string;
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
  children?: React.ReactNode;
  icon?: boolean;
  customButton?: React.ReactElement<{ onClick?: () => void }>;
}

/**
 * Component for generating contract PDFs
 */
function ContractPDFGenerator({
  year,
  family,
  contract,
  color,
  size = "small",
  variant = "contained",
  children,
  icon = false,
  customButton,
}: ContractPDFGeneratorProps) {
  const theme = useTheme();
  const [generating, setGenerating] = useState(false);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    // Load logo on component mount
    const loadLogo = async () => {
      try {
        const logoDataUrl = await dataURLFromImagePath("/VFSLogo.png");
        setLogo(logoDataUrl);
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    };
    loadLogo();
  }, []);

  // Computed values
  const allKids = family.students
    .map((s) => `${s.firstName} ${s.middleName} ${s.lastName}`)
    .join("\n");

  const allKidsOneLine = family.students
    .map((s) => `${s.firstName} ${s.middleName} ${s.lastName}`)
    .join(" and ");

  const needMediaReleasePage = family.students.filter((s) => s.mediaRelease).length > 0;

  const mediaReleaseKids = family.students
    .filter((s) => s.mediaRelease)
    .map((s) => `${s.firstName} ${s.middleName} ${s.lastName}`)
    .join("\n");

  const needSelfSignoutPage = family.students.filter((s) => s.signSelfOut).length > 0;

  const selfSignoutKids = family.students
    .filter((s) => s.signSelfOut)
    .map((s) => `${s.firstName} ${s.middleName} ${s.lastName}`)
    .join("\n");

  // PDF generation functions
  const titlePage = (): Content[] => {
    const parts: Content[] = [];
    if (logo !== "") {
      parts.push({
        image: logo,
        width: 500,
        margin: [0, 200, 0, 0] as [number, number, number, number],
      });
    }

    // Title
    parts.push({
      text: `${year.name} Enrollment Contract`,
      style: "title",
      margin: [100, 20, 0, 0] as [number, number, number, number],
    });

    // Subtitle
    parts.push({
      text: family.name,
      margin: [100, 0, 0, 0] as [number, number, number, number],
      style: "subtitle",
    });

    return parts;
  };

  const terms = (): Content[] => {
    return [
      {
        text: `Village Free School Enrollment Contract\n${year.name}`,
        style: "header",
        alignment: "center",
        pageBreak: "before",
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          'I/We are the parent(s) and/or legal guardian(s) (the "Family") of ',
          { text: allKidsOneLine, bold: true },
          ` (the "Student" or "Students") intending to enroll at The Village Free School for the ${year.name} school year. By signing this agreement to enroll Student at The Village Free School (the "School") for the ${year.name} school year (the "Enrollment Contract"), Family acknowledges that Family is financially responsible for Student and agrees to pay the rate of, and meet all obligations associated with Tuition, as defined below, and agrees to pay any fees or fines. The term "School" shall include all employees and/or staff of School.`,
        ],
      },
      // ... rest of the terms content
    ];
  };

  const signSelfOut = (): Content[] => {
    if (!needSelfSignoutPage) {
      return [];
    }

    return [
      {
        text: "Permission to Sign Self Out",
        style: "subheader",
        pageBreak: "before",
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text:
          "By signing this section, I give my Student permission to sign themself " +
          "out of school for the day. I understand Students who have signed out " +
          "for the day are not considered to be in the care of the School after " +
          "they sign out, and may do so at any time. " +
          "I and my Student understand that self sign out is not a " +
          'substitute for "off campus certification."',
      },
      signatureTable(selfSignoutKids),
    ];
  };

  const mediaRelease = (): Content[] => {
    if (!needMediaReleasePage) {
      return [];
    }

    return [
      {
        text: "General Media Release",
        style: "subheader",
        pageBreak: "before",
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text:
          "We often have visitors, media opportunities, and outreach efforts " +
          "going on, including the use of social media. Signing " +
          "this general release " +
          "allows us to utilize pictures, video, or sound recordings of your " +
          "child on our web site, marketing materials, etc., without needing to " +
          "check with you each time.",
      },
      signatureTable(mediaReleaseKids),
    ];
  };

  const liabilityRelease = (): Content[] => {
    return [
      {
        text: "General Assumption of Risk and Release from Liability",
        style: "header",
        pageBreak: "before",
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text:
          "Given the nature of the services offered by The Village Free School, it is " +
          "important that all parties are clear about the frequency students will " +
          "travel off the school premises using several modes of transportation (foot, " +
          "bike, bus, car, etc). While activity-specific waivers may be utilized for " +
          "certain events, it is vital to the daily operations of the school that " +
          "students and guardians be informed of the potential risks involved.",
      },
      // ... rest of the liability release content
    ];
  };

  const signatureTable = (kids: string): Content => {
    const widths = ["*", 200];
    const heights: (number | "auto")[] = [];
    const lines = [];

    if (kids && kids.length > 0) {
      lines.push([{ text: "Students", bold: true, colSpan: 2 }, {}]);
      heights.push("auto");
      lines.push([
        {
          text: `\n${kids || allKids}\n\n`,
          colSpan: 2,
          alignment: "center",
        },
        {},
      ]);
      heights.push("auto");
    }

    lines.push([{ text: "Signature", bold: true, colSpan: 2 }, {}]);
    heights.push("auto");

    for (const g of family.guardians) {
      // Check if this guardian has a digital signature
      const guardianId = g.id || "";
      const signature = contract.signatures?.[guardianId];

      // Try alternative guardian ID formats
      const possibleIds = [
        guardianId,
        `guardian-${family.guardians.indexOf(g)}`,
        `${family.id}-${guardianId}`,
        `${g.firstName.toLowerCase()}-${g.lastName.toLowerCase()}`,
      ];

      // Look for a matching signature using all possible ID formats
      let matchedSignature = signature;

      if (!matchedSignature) {
        // Try alternative ID formats if the primary one doesn't work
        for (const altId of possibleIds) {
          if (altId === guardianId) continue; // Skip the one we already tried

          const altSignature = contract.signatures?.[altId];
          if (altSignature?.data) {
            matchedSignature = altSignature;
            break;
          }
        }
      }

      if (matchedSignature?.data) {
        try {
          // Try to normalize the signature data
          const normalizedSignature = normalizeSignatureForPdf(matchedSignature);

          if (normalizedSignature) {
            // Use the normalized signature image
            try {
              lines.push([
                {
                  image: normalizedSignature,
                  width: 150,
                  height: 70,
                },
                "",
              ]);
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (_) {
              lines.push(["", ""]);
            }
          } else {
            // Try using the signature data directly as a last resort
            if (typeof matchedSignature.data === "string" && matchedSignature.data.length > 100) {
              try {
                lines.push([
                  {
                    image: matchedSignature.data,
                    width: 150,
                    height: 70,
                  },
                  "",
                ]);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
              } catch (_) {
                lines.push(["", ""]);
              }
            } else {
              lines.push(["", ""]);
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          // Use empty cell as fallback
          lines.push(["", ""]);
        }
      } else {
        // Otherwise show an empty box for manual signing
        lines.push(["", ""]);
      }
      heights.push(70);

      // Add name and date line (show actual date if signed digitally)
      const dateText = matchedSignature ? new Date(matchedSignature.date).toLocaleDateString() : "";

      lines.push([`${g.firstName} ${g.lastName}`, { text: dateText, bold: true }]);
      heights.push("auto");
    }

    return {
      margin: [10, 5, 15, 5] as [number, number, number, number],
      table: {
        widths,
        heights,
        body: lines,
      },
    };
  };

  // PDF footer function
  const pdfFooter = (currentPage: number, pageCount: number): Content => {
    if (currentPage === 1) {
      return { text: "" };
    }
    return {
      margin: [15, 0, 15, 0] as [number, number, number, number],
      columns: [
        {
          text: `\nGenerated ${new Date().toString()}`,
          style: {
            fontSize: 7,
            color: "#8a8a8a",
          },
        },
        {
          alignment: "right",
          text: `${family.name} ${year.name} Contract (${currentPage}/${pageCount})`,
        },
      ],
    };
  };

  // Function to generate and download the PDF
  const download = async () => {
    try {
      setGenerating(true);

      // Dynamically load pdfMake
      const pdfMake = await loadPdfMake();

      const content: Content[] = [
        ...titlePage(),
        ...terms(),
        signatureTable(""),
        ...liabilityRelease(),
        ...signSelfOut(),
        ...mediaRelease(),
      ];
      const fileName = `${family.name} ${year.name} Contract.pdf`;

      pdfMake
        .createPdf({
          content,
          styles: PDF_STYLES,
          defaultStyle: PDF_DEFAULT_STYLE,
          footer: pdfFooter,
          // No need to specify fonts here as they're configured in the loader
        } as TDocumentDefinitions)
        .download(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      window.alert("Failed to generate PDF. Please try again or contact support.");
    } finally {
      setGenerating(false);
    }
  };

  // If custom button is provided, clone it with onClick handler
  if (customButton) {
    return React.cloneElement(customButton, { onClick: download });
  }

  // Render as an icon button
  if (icon) {
    return (
      <IconButton
        onClick={download}
        size={size}
        color={(color as React.ComponentProps<typeof IconButton>["color"]) || "primary"}
        disabled={generating}
        sx={{
          color: color ? color : theme.palette.green[900],
          ml: 1,
        }}
      >
        {children || <PictureAsPdfIcon fontSize="inherit" />}
      </IconButton>
    );
  }

  // Render as a regular button
  return (
    <Button
      onClick={download}
      size={size}
      variant={variant}
      disabled={generating}
      startIcon={<PictureAsPdfIcon />}
      sx={{
        bgcolor: color ? color : theme.palette.green[900],
        color: "white",
        "&:hover": {
          bgcolor: color ? color : theme.palette.green[800],
        },
      }}
    >
      {children || "Download Contract"}
    </Button>
  );
}

export default ContractPDFGenerator;
