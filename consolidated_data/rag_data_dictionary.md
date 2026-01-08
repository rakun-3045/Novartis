# Clinical Trial Data Dictionary

## Overview
This knowledge base contains data quality information for clinical trial monitoring.

## Field Definitions

| Field | Description |
|-------|-------------|
| `Subject` | Unique patient/subject identifier within a study |
| `Study` | Clinical trial study identifier (e.g., Study 1, Study 21) |
| `Country` | Country code where the subject is enrolled |
| `Site` | Clinical site identifier where subject is being treated |
| `Region` | Geographic region (e.g., EMEA, APAC, NA) |
| `SubjectStatus` | Current enrollment status (Active, Discontinued, Screen Failure, etc.) |
| `open_issues_count` | Number of unresolved EDRR (Electronic Data Review Report) issues |
| `safety_discrepancy_count` | Number of safety data discrepancies requiring review |
| `safety_reviews_pending` | Number of safety reviews awaiting completion |
| `safety_reviews_completed` | Number of completed safety reviews |
| `meddra_total_events` | Total adverse event records for MedDRA coding |
| `meddra_coded_count` | Number of adverse events with completed MedDRA coding |
| `meddra_coding_pending` | Number of adverse events awaiting MedDRA coding |
| `whodd_total_events` | Total medication records for WHODD coding |
| `whodd_coded_count` | Number of medications with completed WHODD coding |
| `whodd_coding_pending` | Number of medications awaiting WHODD coding |
| `missing_pages_count` | Number of missing CRF (Case Report Form) pages |
| `missing_lab_count` | Number of missing laboratory data records |
| `outstanding_visits_count` | Number of overdue patient visits |
| `total_issues` | Aggregated count of all issue types |
| `risk_category` | Calculated risk level: Low, Medium, High, or Critical |
| `has_pending_items` | Binary flag indicating if subject has any pending items (1=Yes, 0=No) |
| `predicted_risk` | ML model predicted risk category |
| `risk_probability` | Confidence score of the risk prediction (0-100%) |
| `predicted_issues` | ML model predicted total issues count |

## Risk Categories

| Category | Criteria | Action |
|----------|----------|--------|
| Low | 0 issues | No action required |
| Medium | 1-5 issues | Routine monitoring |
| High | 6-15 issues | Enhanced monitoring |
| Critical | >15 issues | Immediate intervention |

## CRA Terminology

- **CRA**: Clinical Research Associate - responsible for monitoring site compliance
- **CRF**: Case Report Form - document used to collect patient data
- **EDRR**: Electronic Data Review Report - system for tracking data issues
- **MedDRA**: Medical Dictionary for Regulatory Activities - standardized adverse event coding
- **WHODD**: WHO Drug Dictionary - standardized medication coding
- **SAE**: Serious Adverse Event - safety event requiring expedited reporting
