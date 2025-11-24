# 📝 Notion Integration Setup Guide

Complete guide to integrate your Job Tracking System with Notion for enhanced productivity and organization.

## 🎯 What You'll Get

### **Notion Databases:**
- **🎯 Job Opportunities**: Rich job tracking with AI scores, priorities, and status
- **🏢 Companies**: Company profiles with industry data and culture notes
- **📋 Applications**: Application pipeline tracking with follow-ups
- **📚 Reading List**: Research materials and job-related articles *(optional)*

### **Bidirectional Sync:**
- **Local → Notion**: Sync scored jobs and generated documents
- **Notion → Local**: Manual job entries and status updates
- **Real-time Updates**: Automatic synchronization between systems

---

## 🚀 Step 1: Create Notion Integration

### 1.1 Go to Notion Integrations
1. Visit [https://developers.notion.com/](https://developers.notion.com/)
2. Click **"My integrations"** (top right)
3. Click **"+ New integration"**

### 1.2 Configure Integration
- **Name**: `Job Tracker Pro`
- **Logo**: Upload a briefcase icon *(optional)*
- **Associated workspace**: Select your personal workspace
- **Type**: Internal integration
- **Capabilities**:
  - ✅ Read content
  - ✅ Update content
  - ✅ Insert content

### 1.3 Get Integration Token
- Copy the **"Internal Integration Token"**
- Save this securely - you'll need it for configuration

---

## 🗄️ Step 2: Create Notion Databases

### 2.1 Create Parent Page
1. In Notion, create a new page called **"🎯 Job Search Hub"**
2. This will contain all your job tracking databases

### 2.2 Create Job Opportunities Database

**Create Database:**
1. In your Job Search Hub page, type `/database`
2. Choose "Database - Full page"
3. Name it: **"🎯 Job Opportunities"**

**Configure Properties:**

| Property Name | Type | Configuration |
|---------------|------|---------------|
| **Job Title** | Title | *(default)* |
| **Company** | Relation | Link to Companies database |
| **AI Score** | Number | Format: Number (0-100) |
| **Priority** | Select | 🔥 Urgent, ⭐ High, 📝 Medium, 📋 Low |
| **Status** | Select | 🔍 Identified, 📊 Scored, 📝 Applied, 🎤 Interview, ❌ Rejected, ✅ Offer |
| **Location** | Rich Text | Job location |
| **Remote Option** | Select | 🏠 Remote, 🏢 Hybrid, 🏭 On-site |
| **Salary Min** | Number | Format: Dollar |
| **Salary Max** | Number | Format: Dollar |
| **Application Deadline** | Date | Include time: No |
| **Posted Date** | Date | Include time: No |
| **Source** | Select | LinkedIn, Indeed, Seek, Company Website, Referral, Recruiter |
| **Source URL** | URL | Link to job posting |
| **Job Description** | Rich Text | Full description |
| **Requirements** | Rich Text | Job requirements |
| **Notes** | Rich Text | Personal notes and strategy |

**Views to Create:**
- **🏆 High Score**: Filter AI Score ≥ 80, Sort by AI Score descending
- **⏰ This Week**: Filter by Application Deadline within 7 days
- **📊 Pipeline**: Group by Status, Sort by Priority

### 2.3 Create Companies Database

**Create Database:**
1. Add another database to your hub: **"🏢 Companies"**

**Configure Properties:**

| Property Name | Type | Configuration |
|---------------|------|---------------|
| **Company Name** | Title | *(default)* |
| **Industry** | Select | Financial Services, Technology, Consulting, Education, Healthcare, Government |
| **Size** | Select | Startup, Small, Medium, Large, Enterprise |
| **Website** | URL | Company website |
| **Location** | Rich Text | HQ location |
| **Description** | Rich Text | Company overview |
| **Culture Notes** | Rich Text | Culture insights and fit |
| **Job Opportunities** | Relation | Link to Job Opportunities database |

### 2.4 Create Applications Database

**Create Database:**
1. Add: **"📋 Applications"**

**Configure Properties:**

| Property Name | Type | Configuration |
|---------------|------|---------------|
| **Application** | Title | Auto-generated from job + company |
| **Job** | Relation | Link to Job Opportunities |
| **Company** | Formula | `prop("Job").prop("Company").prop("Company Name")` |
| **Application Date** | Date | When applied |
| **Status** | Select | 📝 Submitted, ✅ Acknowledged, 🎤 Interview Scheduled, ⏳ Pending, ❌ Rejected, 🎉 Offer |
| **Resume Version** | Rich Text | Which resume used |
| **Cover Letter** | Files | Attach cover letter |
| **Contact Person** | Rich Text | Hiring manager name |
| **Contact Email** | Email | Contact email |
| **Follow Up Date** | Date | Next follow-up |
| **GDrive Folder** | URL | Link to Google Drive folder |
| **Notes** | Rich Text | Application notes |
| **Interview Count** | Number | Number of interviews |
| **Days Since Application** | Formula | `dateBetween(now(), prop("Application Date"), "days")` |

### 2.5 Create Reading List Database *(Optional)*

**Create Database:**
1. Add: **"📚 Research & Reading"**

**Configure Properties:**

| Property Name | Type | Configuration |
|---------------|------|---------------|
| **Title** | Title | Article/resource title |
| **URL** | URL | Link to resource |
| **Category** | Select | Job Research, Company Intel, Industry News, Skill Development |
| **Status** | Select | 📋 To Read, 👀 Reading, ✅ Complete, 💡 Key Insights |
| **Related Job** | Rich Text | Link to relevant job |
| **Priority** | Select | High, Medium, Low |
| **Added Date** | Date | When added |
| **Notes** | Rich Text | Key takeaways |

---

## 🔗 Step 3: Connect Databases

### 3.1 Share Databases with Integration
For **each database** you created:
1. Click **"Share"** (top right of database)
2. Click **"Invite"**
3. Search for **"Job Tracker Pro"** (your integration name)
4. Click **"Invite"**
5. Set permission to **"Can edit"**

### 3.2 Get Database IDs
For each database:
1. Copy the database URL (should look like: `https://notion.so/DATABASE_ID?v=VIEW_ID`)
2. Extract the DATABASE_ID part (32 character string between `/` and `?`)
3. Save these IDs - you'll need them for configuration

---

## ⚙️ Step 4: Configure Local System

### 4.1 Environment Configuration
Create a `.env` file in your job-tracking-system directory:

```bash
# Notion Integration Configuration
NOTION_TOKEN=secret_your_integration_token_here
NOTION_JOB_DB_ID=your_job_opportunities_database_id
NOTION_COMPANIES_DB_ID=your_companies_database_id
NOTION_APPLICATIONS_DB_ID=your_applications_database_id
NOTION_READING_LIST_DB_ID=your_reading_list_database_id

# Optional: Notion Workspace Info
NOTION_WORKSPACE_NAME=Your Workspace Name
```

### 4.2 Install Python Dependencies
```bash
pip3 install python-dotenv requests
```

### 4.3 Update Local App
Add to your `app.py`:

```python
from src.notion_integration import setup_notion_integration
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Notion integration
notion_tracker = setup_notion_integration()
```

---

## 🔄 Step 5: Sync Workflows

### 5.1 Local to Notion Sync
When you:
- **Add a job** → Automatically creates Notion page
- **Score a job** → Updates AI Score in Notion
- **Apply to job** → Creates application record
- **Generate documents** → Links to Google Drive folder

### 5.2 Notion to Local Sync
When you:
- **Update job status in Notion** → Syncs to local database
- **Add notes in Notion** → Updates local records
- **Create new jobs in Notion** → Imports to local system

### 5.3 Automated Workflows
- **Daily sync**: Runs every morning to synchronize changes
- **Real-time updates**: Critical changes sync immediately
- **Conflict resolution**: Local system takes precedence for AI data

---

## 📱 Step 6: Mobile & Web Access

### 6.1 Notion Mobile App
- Install Notion mobile app
- Access your Job Search Hub on the go
- Update statuses and add notes anywhere
- Take photos of business cards → Add to contacts

### 6.2 Browser Bookmarks
Create bookmarks for quick access:
- **Job Search Hub**: Main dashboard
- **High Score Jobs**: Jobs with AI score ≥ 80
- **This Week**: Jobs with approaching deadlines
- **Pipeline View**: Application status overview

---

## 💡 Step 7: Productivity Tips

### 7.1 Notion Formulas for Insights
Add these calculated properties:

**Days Until Deadline:**
```
dateBetween(prop("Application Deadline"), now(), "days")
```

**Application Success Rate:**
```
prop("Applications").filter(current.prop("Status") == "✅ Offer").length() / prop("Applications").length() * 100
```

**Priority Score:**
```
if(prop("AI Score") >= 90, "🎯 Must Apply", if(prop("AI Score") >= 80, "⭐ Strong Match", if(prop("AI Score") >= 70, "📝 Consider", "📋 Review")))
```

### 7.2 Notion Templates
Create templates for:
- **New Job Entry**: Pre-filled with standard fields
- **Company Research**: Structure for company analysis
- **Interview Prep**: Questions and preparation checklist
- **Follow-up Notes**: Consistent follow-up format

### 7.3 Automation Ideas
- **Slack notifications** for high-score jobs
- **Calendar reminders** for application deadlines
- **Email templates** for follow-up communications
- **Weekly digest** of new opportunities

---

## 🔧 Troubleshooting

### Common Issues:

**"Integration not found"**
- Ensure you shared the database with your integration
- Check integration name matches exactly
- Verify integration is in the same workspace

**"Invalid database ID"**
- Database ID should be 32 characters (no dashes)
- Copy from database URL, not page URL
- Ensure database is shared with integration

**"Sync not working"**
- Check `.env` file has correct tokens
- Verify internet connection
- Check Notion API status at status.notion.so

**"Properties missing"**
- Ensure all required properties exist in Notion
- Property names must match exactly (case-sensitive)
- Check property types match expected format

---

## 🎉 You're Ready!

Your Notion integration is now configured for:
- ✅ **Comprehensive job tracking** with visual dashboards
- ✅ **AI-powered scoring** synchronized across platforms
- ✅ **Mobile access** for updates anywhere
- ✅ **Automated workflows** saving hours of manual work
- ✅ **Reading list integration** for research organization
- ✅ **Application pipeline management** with follow-ups

**Next Steps:**
1. Add your first job through the web interface
2. Watch it automatically appear in Notion
3. Try updating the status in Notion
4. Explore the mobile app for on-the-go updates

**Pro Tip:** Start with a few test jobs to get comfortable with the sync process before adding your full job search pipeline.

Happy job hunting! 🚀