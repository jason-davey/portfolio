# Job Tracking & Application Automation System

A comprehensive AI-powered system for tracking job opportunities, scoring compatibility, generating tailored cover letters, and automating application workflows with Google Drive integration.

## 🎯 Features

### Core Functionality
- **AI-Powered Job Scoring**: Automatically scores job opportunities (0-100) against Jason's profile
- **Smart Cover Letter Generation**: Creates tailored cover letters using AI and templates
- **Resume Tailoring**: Selects appropriate resume version based on job requirements
- **Google Drive Automation**: Creates organized folder structures and uploads documents
- **Application Pipeline Tracking**: Monitors applications from discovery to outcome
- **Advanced Analytics**: Provides insights on job market trends and application success

### AI Integration
- **Multi-Modal Design Framework Integration**: Leverages Jason's proprietary methodologies
- **Executive Leadership Scoring**: Specialized algorithms for C-level positions
- **Industry-Specific Matching**: Tailored scoring for Financial Services, Technology, Consulting
- **Intelligent Document Generation**: Context-aware cover letter creation

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pandoc (document conversion)
- rclone (Google Drive integration)
- Flask web framework

### Installation

1. **Clone and Setup**
   ```bash
   cd /Users/jd/Projects/portfolio/job-tracking-system
   python3 setup.py
   ```

2. **Configure Google Drive (Optional)**
   ```bash
   rclone config
   # Choose "New remote" → "Google Drive" → "gdrive" as name
   # Authenticate with jasdavey@gmail.com
   ```

3. **Start the Application**
   ```bash
   python3 app.py
   ```

4. **Open in Browser**
   ```
   http://localhost:5000
   ```

## 📊 System Architecture

### Database Schema
- **Companies**: Company information and industry data
- **Job Opportunities**: Complete job details with AI scoring
- **Applications**: Application tracking and status management
- **Interviews**: Interview scheduling and feedback
- **Generated Documents**: Cover letters and tailored resumes
- **My Profile**: Jason's skills and competencies for scoring
- **Activity Log**: Complete audit trail of system activities

### AI Scoring Algorithm

The system uses a sophisticated weighted scoring algorithm:

- **Executive Leadership (25%)**: C-level skills, strategic planning, P&L management
- **AI & Technology (30%)**: AI/ML integration, AWS Bedrock, solution architecture
- **Design Innovation (25%)**: Multi-modal design, AI+UX integration, design strategy
- **Consulting & Business (20%)**: Management consulting, process optimization, ROI analysis

### Document Generation Pipeline

1. **Job Analysis**: Parse job requirements and company information
2. **Template Selection**: Choose optimal cover letter template style
3. **Content Generation**: Create personalized content with relevant achievements
4. **Document Creation**: Convert to professional DOCX format using branded templates
5. **Google Drive Upload**: Organize in structured folder system

## 🎨 User Interface

### Dashboard
- **Statistics Overview**: Total jobs, high priority items, applications sent
- **Top Scoring Opportunities**: AI-ranked job matches
- **Application Pipeline**: Visual progress tracking
- **Quick Actions**: One-click job scoring and document generation

### Job Management
- **Comprehensive Job Entry**: Detailed form for complete job information
- **Real-time AI Scoring**: Instant compatibility analysis
- **Document Generation**: One-click cover letter and application package creation
- **Google Drive Integration**: Automated folder creation and file organization

### Analytics
- **Score Distribution**: Visual breakdown of job compatibility scores
- **Source Analysis**: Track which job boards provide best matches
- **Monthly Trends**: Historical data and success patterns

## 🤖 AI-Powered Features

### Job Scoring Methodology

The AI scoring system evaluates jobs across multiple dimensions:

```python
# Example scoring breakdown for a Head of Design role
{
    'executive_leadership': 85,  # Strong C-level positioning
    'ai_technology': 92,         # Excellent AI integration match
    'design_innovation': 88,     # Perfect design leadership fit
    'consulting_business': 76,   # Good business transformation match
    'industry_fit': 90,         # Financial services experience
    'role_level': 95,           # Perfect level match
    'location_fit': 85,         # Hybrid/remote compatible
    'total_score': 87           # Weighted final score
}
```

### Cover Letter Templates

Four specialized templates automatically selected based on job analysis:

1. **Executive Leadership**: C-level positioning, strategic vision
2. **AI Innovation**: Technology leadership, AI integration expertise
3. **Design Leadership**: Design strategy, team building, UX innovation
4. **Consulting**: Business transformation, process optimization

### Achievement Bank

Dynamic selection of relevant achievements:
- £270M cost-saving transformation (British Telecommunications)
- 20% efficiency improvement (ANZ Bank)
- 10x faster visual iteration (AI integration)
- 72-hour prototype delivery (Multi-Modal Design Framework)

## 📁 Google Drive Integration

### Folder Structure
```
Job-Opportunities/
├── {Company-Name}/
│   └── {Position}-{Date}/
│       ├── 01-Resume-and-CV/
│       ├── 02-Cover-Letter/
│       ├── 03-Portfolio-Samples/
│       ├── 04-Communications/
│       ├── 05-Interview-Prep/
│       └── 06-Follow-up/
```

### Automated Workflows
- **Application Package Creation**: Complete folder setup with all documents
- **Document Upload**: Automatic categorization and organization
- **Shareable Links**: Generate links for easy application submission
- **Version Control**: Maintain document history and updates

## 🔧 API Endpoints

### Job Scoring
```bash
POST /api/score_job/{job_id}
# Returns detailed scoring breakdown and recommendations
```

### Cover Letter Generation
```bash
POST /api/generate_cover_letter/{job_id}
# Creates tailored cover letter with specified template style
```

### Application Package Creation
```bash
POST /api/create_application_package/{job_id}
# Complete Google Drive setup with all documents
```

## 📈 Analytics & Reporting

### Key Metrics
- **Compatibility Score Distribution**: Understand job market fit
- **Source Effectiveness**: Which platforms provide best matches
- **Application Success Rates**: Track interview and offer rates
- **Time-to-Application**: Measure workflow efficiency

### Executive Dashboard
- **Pipeline Overview**: Visual representation of application status
- **Score Trends**: Historical compatibility analysis
- **Success Patterns**: Identify winning strategies
- **Action Items**: Prioritized next steps and follow-ups

## 🛠️ Advanced Configuration

### Custom Scoring Weights
Modify scoring algorithm weights in `src/scoring_algorithm.py`:
```python
self.jason_profile = {
    'executive_leadership': {'weight': 0.25},
    'ai_technology': {'weight': 0.30},
    'design_innovation': {'weight': 0.25},
    'consulting_business': {'weight': 0.20}
}
```

### Template Customization
Edit cover letter templates in `src/cover_letter_generator.py`:
- Add new template styles
- Modify achievement selection logic
- Customize company-specific messaging

### Google Drive Configuration
Update folder structures and naming conventions in `src/gdrive_automation.py`.

## 🔒 Security & Privacy

- **Local Database**: All data stored locally in SQLite
- **Encrypted Communications**: HTTPS for all web interfaces
- **Secure Authentication**: rclone OAuth for Google Drive
- **No Data Sharing**: Complete control over personal information

## 📚 Usage Examples

### Adding a New Job
1. Navigate to "Add Job" from dashboard
2. Fill in company and position details
3. Paste job description and requirements
4. Set priority and source information
5. Click "Save & Score" for immediate AI analysis

### Generating Application Materials
1. Find high-scoring job (80+) in job list
2. Click "Generate Cover Letter" for AI-written letter
3. Click "Create Package" for complete Google Drive setup
4. Review and customize documents as needed
5. Submit application directly from organized folder

### Tracking Application Progress
1. Mark job as "Applied" after submission
2. Schedule follow-up dates and reminders
3. Log interview details and feedback
4. Track outcomes and lessons learned

## 🎉 Success Stories

The system is designed around Jason Davey's proven track record:
- **$270M+ cost savings** delivered across transformation programs
- **Multiple industry awards** including Australian Retail Banking Awards
- **AI+UX innovation leadership** at Greenstone Financial Services
- **Enterprise-scale implementations** across Fortune 500 companies

## 🤝 Support

For issues or enhancements:
1. Check the activity log for system events
2. Review database schema for data relationships
3. Test API endpoints for functionality
4. Verify Google Drive authentication

## 🔄 Roadmap

Planned enhancements:
- **Email Integration**: Automated application submission
- **LinkedIn Scraping**: Enhanced job discovery (within ToS)
- **Interview Prep**: AI-powered practice questions
- **Salary Negotiation**: Market analysis and recommendations
- **Network Mapping**: Contact relationship management

---

**Built for Jason Davey's Executive Job Search**
*AI-Powered • Enterprise-Ready • Results-Driven*