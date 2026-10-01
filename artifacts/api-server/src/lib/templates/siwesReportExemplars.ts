/**
 * Institutional SIWES Technical Report Exemplars
 * Trained on real Nigerian University SIWES Reports (OOU, UNILAG, OAU, FUTA, ABU)
 */

export interface ReportTemplateExemplar {
  id: string;
  name: string;
  discipline: string;
  exemplarPrompt: string;
}

export const SIWES_REPORT_TEMPLATES: Record<string, ReportTemplateExemplar> = {
  geotechnical: {
    id: "geotechnical",
    name: "Engineering, Geology & Geotechnical (OOU / UNILAG / FUTA Style)",
    discipline: "Geology, Civil & Geotechnical Engineering, Mining, Construction",
    exemplarPrompt: `
Structure and tone reference (Trained on OOU Geology & Geotechnical SIWES Report):
- Chapter 1: 1.1 Inception & ITF Mandate (1973 Act), 1.2 Parties Involved (1.2.1 Institutions, 1.2.2 Employers, 1.2.3 Students), 1.3 Benefits of SIWES, 1.4 Objectives.
- Chapter 2: Company Profile, Onshore/Offshore capabilities, Geological/Soil survey procedures, Organizational structure.
- Chapter 3: Work Activities & Technical Exposure. Grouped into technical sub-sections (e.g. 3.1 Site Reconnaissance & Preliminary Surveys, 3.2 Borehole Drilling & Soil Sampling, 3.3 Standard Penetration Test (SPT), 3.4 Laboratory Identification & Sieve Analysis, 3.5 Atterberg Limits & Moisture Content Determination).
- Chapter 4: Field & Equipment Challenges (drilling rig delays, soil sample preservation, groundwater interference) and Problem-Solving Workflows.
- Chapter 5: Conclusion & Actionable Recommendations for Institution, ITF, and Employer.
Style: Formal academic prose, technical field procedures, explicit test parameters, no markdown asterisks or em-dashes.
`,
  },
  software_it: {
    id: "software_it",
    name: "Computer Science, Software & IT (OAU / UNN / Covenant Style)",
    discipline: "Computer Science, Software Engineering, IT, Computer Engineering",
    exemplarPrompt: `
Structure and tone reference (Trained on Advanced IT & Software SIWES Report):
- Chapter 1: 1.1 Inception of SIWES (ITF 1973), 1.2 Parties Involved (Institutions, Employers, Students), 1.3 Benefits of SIWES, 1.4 Objectives.
- Chapter 2: IT Firm Profile, Software Development Lifecycle (SDLC), Infrastructure & Tech Stack Overview.
- Chapter 3: Technical Work Activities. Sub-sections (e.g. 3.1 Frontend & User Interface Architecture, 3.2 Backend API & Database Schema Design, 3.3 Server Deployment & Cloud Infrastructure, 3.4 Security & Authentication Protocols, 3.5 Testing & Bug Resolution).
- Chapter 4: Technical & Operational Challenges (server downtime, legacy system integration, environment configuration) and Technical Solutions Applied.
- Chapter 5: Conclusion & Recommendations to Institution, ITF, and Industry Employer.
Style: Professional software engineering prose, architecture details, system workflows, no markdown asterisks or em-dashes.
`,
  },
  applied_science: {
    id: "applied_science",
    name: "Applied Sciences & Lab Technology (ABU / FUTO / UNIBEN Style)",
    discipline: "Industrial Chemistry, Biochemistry, Physics, Microbiology, Lab Tech",
    exemplarPrompt: `
Structure and tone reference (Trained on Applied Sciences & Industrial Attachment Report):
- Chapter 1: 1.1 Inception of SIWES (ITF 1973), 1.2 Parties Involved, 1.3 Benefits, 1.4 Objectives.
- Chapter 2: Laboratory Establishment Background, Safety Guidelines, Quality Assurance (QA/QC) Protocols.
- Chapter 3: Laboratory & Technical Exposure. Sub-sections (e.g. 3.1 Sample Reagents & Preparation, 3.2 Spectrophotometry & Chemical Analysis, 3.3 Analytical Instrument Calibration, 3.4 Data Compilation & Report Verification).
- Chapter 4: Laboratory Challenges (chemical reagent purity, instrument calibration drift, safety hazard management) and Resolution Workflows.
- Chapter 5: Conclusion & Recommendations.
Style: Rigorous scientific prose, lab testing protocols, safety procedures, no markdown asterisks or em-dashes.
`,
  },
};
