import PdfIcon from "@mui/icons-material/PictureAsPdf";
import CircularProgress from "@mui/material/CircularProgress";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import _ from "lodash";
import type * as pdfMaketype from "pdfmake/interfaces";
import { useEffect, useState } from "react";

// Initialize dayjs plugins
dayjs.extend(localizedFormat);

// Import the centralized PDFMake loader
import { loadPdfMake } from "@utils/pdfMakeLoader";

import { enrolledFamiliesInYear } from "@services/firebase/families";
import type { Family, Year } from "@services/firebase/models/types";
import { PDF_DEFAULT_STYLE, PDF_STYLES, dataURLFromImagePath } from "@utils/pdfUtil";

interface DirectoryPDFGeneratorProps {
  year: Year;
}

const DirectoryPDFGenerator = ({ year }: DirectoryPDFGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [logo, setLogo] = useState<string>("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoData = await dataURLFromImagePath("/VFSLogo.png");
        setLogo(logoData);
      } catch (error) {
        console.error("Error loading logo:", error);
      }
    };

    fetchLogo();
  }, []);

  const download = async () => {
    setGenerating(true);

    try {
      // Dynamically load pdfMake only when needed
      const pdfMake = await loadPdfMake();

      // Try to generate a full directory with families from Firebase
      let families: Family[] = [];
      let useFallback = false;

      try {
        families = await enrolledFamiliesInYear(year.id);
      } catch (fetchError) {
        console.error("Error fetching families:", fetchError);
        useFallback = true;
      }

      // If no families or we're using fallback, create a simple directory
      if (useFallback || families.length === 0) {
        // Create a simple directory PDF with just the title page and info
        const fileName = `VFS ${year.name} Directory (Empty)`;

        const fallbackContent = [
          ...titlePage(),
          {
            text: "No Student Information Available",
            style: "subtitle",
            alignment: "center",
            margin: [0, 200, 0, 20] as [number, number, number, number],
          },
          {
            text: "This directory was generated without student information either because:",
            margin: [40, 20, 40, 10] as [number, number, number, number],
          },
          {
            ul: [
              "No students are currently enrolled for this year",
              "You do not have permission to access the enrollment data",
              "There was an error connecting to the database",
            ],
            margin: [60, 0, 40, 20] as [number, number, number, number],
          },
          {
            text: "Please contact the VFS administrator if you believe this is an error.",
            margin: [40, 20, 40, 10] as [number, number, number, number],
            style: "caption",
          },
        ];

        pdfMake
          .createPdf({
            content: fallbackContent as unknown as pdfMaketype.Content,
            styles: PDF_STYLES,
            defaultStyle: PDF_DEFAULT_STYLE,
          })
          .download(fileName);

        return;
      }

      // If we have families, process them normally
      // Sort families by guardian's last name
      families = _.sortBy(families, (f) => _.get(f, "guardians[0].lastName"));

      // Validate family data
      const validFamilies = families.filter(
        (family) => family?.guardians && family.guardians.length > 0 && family.students,
      );

      if (validFamilies.length === 0) {
        console.warn("No valid families found after filtering");
        console.error("No valid families found. The directory cannot be generated.");
        setGenerating(false);
        return;
      }

      const familyStacks = validFamilies.map((f) => ({
        stack: familyContent(f),
        unbreakable: true,
      }));

      const fileName = `VFS ${year.name} Family Directory`;

      pdfMake
        .createPdf({
          content: [...titlePage(), ...familyStacks] as unknown as pdfMaketype.Content,
          styles: PDF_STYLES,
          defaultStyle: PDF_DEFAULT_STYLE,
          footer: pdfFooter as unknown as pdfMaketype.DynamicContent,
          // No need to specify fonts here as they're configured in the loader
        })
        .download(fileName);
    } catch (error) {
      console.error("Error generating directory PDF:", error);
      console.error("Failed to generate the directory PDF. Check console for details.");
    } finally {
      setGenerating(false);
    }
  };

  const titlePage = () => [
    {
      image: logo,
      width: 500,
      margin: [0, 200, 0, 0] as [number, number, number, number],
    },
    {
      text: `${year.name} Student Directory`,
      style: "title",
      margin: [110, 20, 0, 200] as [number, number, number, number],
      pageBreak: "after",
    },
  ];

  /**
   * familyContent returns an array of pdfmake content objects for a single
   * family.
   */
  const familyContent = (family: Family) => {
    const content = [];

    // Family Title
    content.push({
      text: `${family.name}`,
      style: "subtitle",
      margin: [0, 20, 0, 0] as [number, number, number, number],
    });

    // Parents Heading
    for (const g of family.guardians) {
      content.push({
        text: `${g.firstName} ${g.lastName} (${g.relationship || ""}) cell: ${g.cellPhone || ""} email: ${g.email}`,
      });
    }

    // Students Columns
    const students = family.students || [];
    content.push({
      margin: [25, 10, 25, 10] as [number, number, number, number],
      columns: students.map((s) => {
        const birthday = s.birthdate ? dayjs(s.birthdate).format("MMM D") : "";
        const age = s.birthdate ? dayjs().diff(dayjs(s.birthdate), "year") : "";
        return {
          stack: [
            {
              text: `${s.preferredName || s.firstName} ${s.lastName} (${age})`,
              bold: true,
            },
            { text: `Birthday: ${birthday}`, fontSize: 9 },
          ],
        };
      }),
    });

    // Line Break After Family
    content.push({
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 5,
          x2: 595 - 2 * 40,
          y2: 5,
          lineWidth: 1,
        },
      ],
    });

    return content;
  };

  /**
   * pdfFooter is a callback which is called during rendering of each page
   * of the PDF. It generates a page-specific footer for the document.
   */
  const pdfFooter = (currentPage: number, pageCount: number) => {
    if (currentPage === 1) {
      return {};
    }
    return {
      margin: [15, 0, 15, 0] as [number, number, number, number],
      columns: [
        {
          text: `VFS ${year.name} Student Directory`,
          style: "caption",
          alignment: "left",
        },
        {
          text: `Generated ${dayjs().format("MMMM D YYYY, h:mm:ssa")}`,
          style: "caption",
          width: "50%",
          alignment: "center",
        },
        {
          text: `${currentPage}/${pageCount}`,
          style: "caption",
          alignment: "right",
        },
      ],
    };
  };

  return (
    <ListItem>
      <ListItemButton onClick={download} disabled={generating}>
        <ListItemIcon>{generating ? <CircularProgress size={24} /> : <PdfIcon />}</ListItemIcon>
        <ListItemText primary={`${year.name} Directory`} />
      </ListItemButton>
    </ListItem>
  );
};

export default DirectoryPDFGenerator;
