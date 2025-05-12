import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { Contract, Family, Year } from "@services/firebase/models/types";
import { loadPdfMake } from "@utils/pdfMakeLoader";
import {
  PDF_DEFAULT_STYLE,
  PDF_STYLES,
  dataURLFromImagePath,
  normalizeSignatureForPdf,
} from "@utils/pdfUtil";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import React, { useEffect, useState } from "react";

// Currency formatter
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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
const ContractPDFGenerator: React.FC<ContractPDFGeneratorProps> = ({
  year,
  family,
  contract,
  color,
  size = "small",
  variant = "contained",
  children,
  icon = false,
  customButton,
}) => {
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
      {
        text: "Enrollment, Tuition and School Policies",
        style: "subheader",
        margin: [0, 5, 0, 5] as [number, number, number, number],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "1.0 Term. ", bold: true },
          "The term of the Enrollment Contract is from the first day of the enrollment to the last day of the academic school year as indicated in the School's official calendar (the \"Term\"). Family agrees to make all payments in accordance with Family's Payment Plan, as defined below, even when the Payment Plan exceeds the length of the academic school year.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "2.0 School Hours. ", bold: true },
          "The School will be open from 9:00AM - 3:00PM PST each day during the Term, with additional hours for Teen Time on Tuesdays and Thursdays from 3:00PM - 5:00PM PST. School, at its sole discretion, may extend or reduce these hours upon reasonable notice to Family.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "3.0 Tuition and Other Fees. ", bold: true },
          "Family will pay the amount listed below as tuition to School as determined by School's sliding scale for the opportunity for Student to attend School during the Term (the \"Tuition\"). Payment of Tuition is due and payable in advance and shall be paid to the School's Tuition Payment system. Family must enroll in School's Tuition Payment system and School will provide Family the information necessary to manage Family's account in the School's Tuition Payment system. Student's enrollment at School is contingent on Family's execution of this Enrollment Contract and payment of Tuition including all other fees or fines.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        table: {
          widths: ["*", "*"],
          heights: ["auto"],
          body: [
            [
              {
                text: `Total Tuition for ${year.name}`,
                bold: true,
                fontSize: 12,
                alignment: "center",
              },
              {
                text: formatter.format(contract.tuition || 0),
                bold: true,
                fontSize: 12,
                alignment: "center",
              },
            ],
          ],
        },
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "3.1 Payment Plan. ", bold: true },
          "Family agrees to set up a preferred Payment Plan (payment in full, payment in 10 monthly installments, or payment 12 monthly installments) through the School's Tuition Payment System.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "3.2 Non-Refundable Tuition. ", bold: true },
          "Family acknowledges and agrees that the first such payment made to School under Payment Plan is non-refundable. Family further acknowledges and agrees that any tuition paid to School while Student is under Conditional Enrollment, as defined below, is non-refundable.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "3.3 Tuition Adjustments. ", bold: true },
          "Family may apply for a tuition adjustment by contacting the Council who, on behalf of School, will make a determination based on School's budget and Family's financial hardship. School, at its sole discretion, may adjust tuition, including, but not limited to, early termination of Enrollment Contract.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "4.0 Conditional Enrollment. ", bold: true },
          "If Student has not previously been enrolled at School prior to the Term, Student will enroll in School on a conditional basis (\"Conditional Enrollment\"). Student's Conditional Enrollment will last for a period of five-weeks. School, at its sole discretion, may extend or reduce the time period of Student's Conditional Enrollment.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "5.0 Damages to School Property. ", bold: true },
          "Family shares responsibility for keeping School and School's property clean and well-maintained. Family agrees to pay the actual cost of cleaning and/or repair for any damage Student, or any invitee of Student, causes to School or School's property, normal wear and tear excepted. As used herein, an invitee of Student shall include, but is not limited to, all friends and family members of Student, and any other individual which accompanies Student to School.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "6.0 Disputed Charges and Fees. ", bold: true },
          "Family has the right to dispute charges for Tuition or other fees imposed by School if Family believes such charges or fees are not due to School. Any dispute for charges for Tuition or other fees imposed by School must be made in writing to School within 30 days following the date the charge or fee is imposed.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          {
            text: "7.0 Termination of Enrollment Contract. ",
            bold: true,
          },
          "Family may only terminate this Enrollment Contract in accordance with the following provisions in subparagraph 7.1 and 7.2.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          {
            text: "7.1 Termination During Conditional Enrollment. ",
            bold: true,
          },
          "During Conditional Enrollment, Family may terminate this Enrollment Contract by giving written notice to School. Any tuition paid to School while Student is under Conditional Enrollment is non-refundable.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          {
            text: "7.2 Termination After Conditional Enrollment. ",
            bold: true,
          },
          "If Family terminates this Enrollment Contract after Conditional Enrollment, Family will still be responsible for payment of Tuition through the last day of the Term, regardless of whether Student is enrolled or in attendance at School.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          {
            text: "7.3 Termination After Term. ",
            bold: true,
          },
          "This Enrollment Contract will automatically terminate after the Term.",
        ],
      },
      {
        margin: [20, 5, 0, 2] as [number, number, number, number],
        text: [
          {
            text: "7.4 School's Right to Terminate. ",
            bold: true,
          },
          "School may terminate this Enrollment Contract at any time during the Term for any of the following reasons:",
        ],
      },
      {
        margin: [40, 5, 0, 5] as [number, number, number, number],
        text:
          "a. Family has failed to make any payments required by this Enrollment Contract, including payment of Tuition or other fees or fines, when due; or \n" +
          "b. Family or Student has failed to complete the requirements of Enrollment at School; or Family has violated any term or condition of this Enrollment Contract and has failed to correct the violation to the satisfaction of School; or \n" +
          "c. Family has violated any term or condition of this Enrollment Contract and has failed to correct the violation to the satisfaction of School; or \n" +
          "d. Family or Student commits a serious violation or commits repeated minor violations of School's policies and/or community laws; or\n" +
          "e. School, at its sole discretion, determines that termination of this Enrollment Contact is necessary for the health and safety of any School staff or Students, including termination of this Enrollment Contact in order to complete repairs and/or maintenance of School premises; or \n" +
          "f. School, at its sole discretion, determines that termination of this Enrollment Contact is necessary due to an emergency or as a result of program changes or fiscal needs affecting School; or\n" +
          "g. School, at its sole discretion, determines that Student would be better served in another environment.\n",
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          {
            text: "8.0 Student Privacy and Access to Student's Property. ",
            bold: true,
          },
          "School acknowledges and respects each Student's right to a reasonable expectation of privacy. Student acknowledges and agrees that notwithstanding this expectation of privacy, School, at its sole discretion,  has the right to search, inspect and/or seize any property in possession of Student within School premises in order to maintain health and safety, or to prevent serious disruption, or to prevent property loss or damage. School will not abuse the right to search, inspect, and/or seize or use it to harass Student. If School seizes property of Student on School's premises, School will give Student written notice within 24 hours after such seizure, including the date and time of the act, the nature of the emergency, and the names of the people involved. Student has the right, and is encouraged, to demand identification from any person seeking to inspect or seize Student's property who claims to represent School, and may withhold consent to such actions if reasonably satisfactory identification is not produced.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "9.0 Personal Property. ", bold: true },
          "Student is responsible for all personal property brought on School premises. School is not liable for loss or damage of Student's personal property in School premises, including, all affiliated public areas, parking lots, adjacent property, vehicles, and/or storage rooms.",
        ],
      },
      {
        margin: [0, 5, 0, 2] as [number, number, number, number],
        text: [
          { text: "10.0 Student Responsibilities. ", bold: true },
          "Student and Family, including any invitees of Student or Family, agree to comply at all times with state and federal laws and regulations, and with the rules, policies, and community agreements of School. Student and Family, including any invitees of Student or Family, further agree to conduct themselves in a reasonable manner that does not disturb other students, specifically including but not limited to:",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text:
          "a. Keep the School clean;\n" +
          "b. Prevent damage to School and School's property beyond normal wear and tear;\n" +
          "c. Dispose of all waste in a sanitary and safe manner;\n" +
          "d. Use School facilities and School's property, including all appliances and fixtures, in a reasonable manner and for the purposes that such facility or property was designed and intended to be used;\n" +
          "e. Not intentionally nor negligently destroy or remove School's property or its furnishings, or knowingly permit any others to do so;\n" +
          "f. Report immediately any need for repairs to School;",
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "11.0 School Responsibilities. ", bold: true },
          'School agrees to provide an educational environment consistent with the materials and marketing it provides to the general public. School is not responsible if the services offered by School are interrupted due to an "act of nature," Force Majeure; strikes or lockout of employees or suppliers, interruptions to electric, water, or sewer services; or events beyond the control of School. School is further not responsible for annoyance and/or disruption resulting from external sources (e.g., private businesses, public services, construction, road noise, and community events).',
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "11.1 Academic Testing. ", bold: true },
          "School does not participate in any form of academic testing, standardized or otherwise, unless explicitly part of a class.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "12.0 Immunizations. ", bold: true },
          "Oregon law requires that all children attending school, preschool, or daycare be up-to-date on their immunizations (shots), unless they have a medical or nonmedical exemption on file. In order to be in compliance with Oregon law, School requires the Oregon Certificate of Immunizations Status (CIS) be completed in order to activate enrollment. All CIS forms must be returned with this Enrollment Contract. Once submitted, the CIS form can be updated up to three times as new immunizations are done.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "12.1 Exemptions. ", bold: true },
          "If Family intends to claim a medical or non-medical exemption, Family may contact the Oregon Health Authority to obtain the requirements for exemption. Information on exemptions can be found at: www.healthoregon.org/vaccineexemption. If an immunization exemption is claimed, the CIS form still must be completed and signed, according to Oregon law.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "12.2 Exclusion Day. ", bold: true },
          "School must submit copies of the Certificates of Immunization Status to the Oregon Health Department by mid-January of the Term. The Oregon Health Department reviews the certificates and issues any exclusion orders to families and schools by the first week of February. Immunization Exclusion Day is mid-February and School must send home any students whose exclusion orders are not canceled by that date. The state allows no exceptions.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "12.3 Susceptible Children. ", bold: true },
          "According to Oregon Health Authority guidelines, School must maintain a list of susceptible students in case of an outbreak of disease based on the immunization records. In case of an outbreak, School will notify Family and susceptible students will be unable to attend School while the outbreak is ongoing. Susceptible students include any students whose immunizations are not complete.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "13.0 Fire, Safety and Sanitation.", bold: true },
          "School will conduct a fire, safety, and sanitation inspection of School premises at least annually and more frequently as necessary.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "13.1 Reporting a Fire. ", bold: true },
          "In the event of a fire at School premises, if it can be done without jeopardizing the safety of Student, Student should notify: (1) A School staff member, or if no School Staff member is available, (2) the Fire Department by calling 9-1-1.",
        ],
      },
      {
        margin: [20, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "13.2 Fire Extinguishers. ", bold: true },
          "Fire extinguishers must be used for fires only and must not be removed from their hangers except for fires. Expended extinguishers must be reported to School immediately for replacement.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "13.3 Prohibited Items. ", bold: true },
          "For reasons of health and safety, explosives, internal combustion engines, weapons, firearms, and destructive devices are not permitted at School premises. Cooking appliances with an exposed element or open flame are not permitted inside School premises except in a designated kitchen area. School, at its sole discretion, may approve or limit any electrical or other device for safety reasons. An exception to this policy may be granted only if a proposal outlining how a prohibited item (i.e., an engine or decorative knife) will be brought safely to School Premises is approved by School staff.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "14.0 Smoking. ", bold: true },
          "Smoking is not permitted on School premises.",
        ],
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text: [
          { text: "15.0 Enforcement. ", bold: true },
          "This Enrollment Contract is a binding agreement between Family and School. Family agrees that any violation of the terms and conditions of this Enrollment Contract may subject Family to disciplinary action. Family agrees to pay the collection costs, fees, or court costs incurred by School in obtaining payment of amounts due under this agreement.",
        ],
      },
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
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text:
          "I agree that in order to be able to actively participate in the activities " +
          "that occur at The Village Free School including but not limited " +
          "to: performing science experiments, playing sports, riding bicycles, " +
          "skateboarding, utilizing tools, using park and playground equipment, " +
          "using sewing machines, cooking, and traveling to and from the school " +
          "with approved employees or agents of the school. I fully understand " +
          "and appreciate the dangers, hazards and risks inherent in these " +
          "activities, which could include, but are not limited to: bruises, " +
          "sprains, eye injuries, cuts, fractures, broken bones, punctures, " +
          "hypothermia, burns, loss, or death. By signing this document, I " +
          "agree to assume these risks in return for allowing my Student the " +
          "opportunity to participate in the general activities of " +
          "The Village Free School.",
      },
      {
        margin: [0, 5, 0, 5] as [number, number, number, number],
        text:
          "I fully understand that these activities may occur in remote areas " +
          "where medical services may not be available. In the event of illness " +
          "or injury to my Student, and in the event that medical services can " +
          "be obtained, and if I am unable to grant permission at the time " +
          "emergency treatment is required, I hereby authorize The Village " +
          "Free School by and through its authorized representative(s) or " +
          "agent(s), If any, to secure any necessary treatment, including " +
          "the administration of an anesthetic and surgery. I agree to be " +
          "the party responsible for all medical expenses that are incurred " +
          "on my Student's behalf. I hereby certify that my Student is in " +
          "good health and good physical condition and has no medical " +
          "conditions or circumstances that would put him or her at " +
          "any additional risk by his or her participation in the general " +
          "activities of the school. I understand that if I want insurance " +
          "coverage for possible injury or death to my Student in the " +
          "course of his or her general participation in the school, it " +
          "is my responsibility to purchase such coverage before allowing " +
          "my Student's participation. In consideration of the risks inherent " +
          "in the general activities of The Village Free School, I, on behalf " +
          "of myself, my heirs and my assigns, hereby agree to indemnify and " +
          "hold harmless The Village Free School and their officers, employees " +
          "and agents from any and all claims and causes of action for damage " +
          "to or loss of property, personal illness, injury or death arising " +
          "out of my participation in The Village Free School.",
      },
      signatureTable(""),
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
};

export default ContractPDFGenerator;
