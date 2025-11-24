# Portfolio Projects Structure

## 📁 Folder Organization

### `/projects/` - Root directory for all case studies

Each project follows this structure:

```
/projects/
├── [PROJECT-NAME]/
│   ├── README.md                    # Project overview & navigation
│   ├── project-brief.md             # Client brief, objectives, constraints
│   ├── process/                     # Your methodology & approach
│   │   ├── discovery.md
│   │   ├── research.md
│   │   ├── design-process.md
│   │   └── implementation.md
│   ├── outcomes/                    # Results & impact
│   │   ├── metrics.md
│   │   ├── awards.md
│   │   └── testimonials.md
│   ├── assets/                      # Visual materials
│   │   ├── images/
│   │   ├── documents/
│   │   ├── presentations/
│   │   └── videos/
│   ├── reflections/                 # Your insights
│   │   ├── lessons-learned.md
│   │   ├── challenges.md
│   │   └── innovations.md
│   └── metadata.json               # Structured data for CMS
└── _templates/                     # Template files for consistency
    ├── project-template/
    └── metadata-schema.json
```

## 📋 Project Naming Convention

Use kebab-case with year prefix:
- `2024-anz-business-services-transformation/`
- `2022-vietcombank-design-thinking-uplift/`
- `2020-security-bank-customer-contact-framework/`
- `2016-westpac-wonder-loan-origination/`

## 🏷️ Metadata Schema

Each project includes a `metadata.json` for CMS integration:

```json
{
  "title": "ANZ Business Services Transformation",
  "client": "ANZ Bank",
  "year": "2024",
  "duration": "3 months",
  "role": "Design Director",
  "team_size": "6",
  "sector": "Financial Services",
  "categories": ["Business Design", "Organizational Change"],
  "skills": ["Gap Analysis", "Stakeholder Management", "Process Mapping"],
  "outcomes": {
    "metrics": "20% increase in decision-making efficiency",
    "awards": [],
    "impact": "Improved commercial performance"
  },
  "featured": true,
  "status": "published",
  "created": "2024-02-15",
  "updated": "2024-02-28"
}
```