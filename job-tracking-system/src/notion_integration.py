"""
Notion API Integration for Job Tracking System
Bidirectional sync between local SQLite database and Notion databases
"""

import requests
import json
import sqlite3
from datetime import datetime, date
from typing import Dict, List, Optional, Any
import os
from dataclasses import dataclass

@dataclass
class NotionConfig:
    token: str
    job_opportunities_db_id: str
    companies_db_id: str
    applications_db_id: str
    reading_list_db_id: str = ""

class NotionJobTracker:
    def __init__(self, config: NotionConfig, local_db_path: str):
        self.config = config
        self.local_db_path = local_db_path
        self.headers = {
            "Authorization": f"Bearer {config.token}",
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        }
        self.base_url = "https://api.notion.com/v1"

    def setup_notion_databases(self) -> Dict[str, str]:
        """Create Notion databases with proper schema for job tracking"""

        # Job Opportunities Database Schema
        job_opportunities_schema = {
            "parent": {"type": "page_id", "page_id": "YOUR_PARENT_PAGE_ID"},
            "title": [{"type": "text", "text": {"content": "🎯 Job Opportunities"}}],
            "properties": {
                "Job Title": {"title": {}},
                "Company": {
                    "relation": {
                        "database_id": self.config.companies_db_id,
                        "single_property": {}
                    }
                },
                "AI Score": {
                    "number": {
                        "format": "number"
                    }
                },
                "Priority": {
                    "select": {
                        "options": [
                            {"name": "🔥 Urgent", "color": "red"},
                            {"name": "⭐ High", "color": "orange"},
                            {"name": "📝 Medium", "color": "blue"},
                            {"name": "📋 Low", "color": "gray"}
                        ]
                    }
                },
                "Status": {
                    "select": {
                        "options": [
                            {"name": "🔍 Identified", "color": "gray"},
                            {"name": "📊 Scored", "color": "blue"},
                            {"name": "📝 Applied", "color": "yellow"},
                            {"name": "🎤 Interview", "color": "purple"},
                            {"name": "❌ Rejected", "color": "red"},
                            {"name": "✅ Offer", "color": "green"}
                        ]
                    }
                },
                "Location": {"rich_text": {}},
                "Remote Option": {
                    "select": {
                        "options": [
                            {"name": "🏠 Remote", "color": "green"},
                            {"name": "🏢 Hybrid", "color": "yellow"},
                            {"name": "🏭 On-site", "color": "red"}
                        ]
                    }
                },
                "Salary Min": {"number": {"format": "dollar"}},
                "Salary Max": {"number": {"format": "dollar"}},
                "Application Deadline": {"date": {}},
                "Posted Date": {"date": {}},
                "Source": {
                    "select": {
                        "options": [
                            {"name": "LinkedIn", "color": "blue"},
                            {"name": "Indeed", "color": "green"},
                            {"name": "Seek", "color": "orange"},
                            {"name": "Company Website", "color": "purple"},
                            {"name": "Referral", "color": "pink"},
                            {"name": "Recruiter", "color": "brown"}
                        ]
                    }
                },
                "Source URL": {"url": {}},
                "Job Description": {"rich_text": {}},
                "Requirements": {"rich_text": {}},
                "Notes": {"rich_text": {}},
                "Last Updated": {"last_edited_time": {}},
                "Created": {"created_time": {}}
            }
        }

        # Companies Database Schema
        companies_schema = {
            "parent": {"type": "page_id", "page_id": "YOUR_PARENT_PAGE_ID"},
            "title": [{"type": "text", "text": {"content": "🏢 Companies"}}],
            "properties": {
                "Company Name": {"title": {}},
                "Industry": {
                    "select": {
                        "options": [
                            {"name": "Financial Services", "color": "blue"},
                            {"name": "Technology", "color": "purple"},
                            {"name": "Consulting", "color": "green"},
                            {"name": "Education", "color": "orange"},
                            {"name": "Healthcare", "color": "red"},
                            {"name": "Government", "color": "gray"}
                        ]
                    }
                },
                "Size": {
                    "select": {
                        "options": [
                            {"name": "Startup", "color": "pink"},
                            {"name": "Small", "color": "yellow"},
                            {"name": "Medium", "color": "orange"},
                            {"name": "Large", "color": "blue"},
                            {"name": "Enterprise", "color": "purple"}
                        ]
                    }
                },
                "Website": {"url": {}},
                "Location": {"rich_text": {}},
                "Description": {"rich_text": {}},
                "Culture Notes": {"rich_text": {}},
                "Job Opportunities": {
                    "relation": {
                        "database_id": "WILL_BE_SET_AFTER_CREATION",
                        "single_property": {}
                    }
                }
            }
        }

        # Applications Database Schema
        applications_schema = {
            "parent": {"type": "page_id", "page_id": "YOUR_PARENT_PAGE_ID"},
            "title": [{"type": "text", "text": {"content": "📋 Applications"}}],
            "properties": {
                "Application": {"title": {}},
                "Job": {
                    "relation": {
                        "database_id": "WILL_BE_SET_AFTER_CREATION",
                        "single_property": {}
                    }
                },
                "Company": {"formula": {"expression": "prop(\"Job\").prop(\"Company\").prop(\"Company Name\")"}},
                "Application Date": {"date": {}},
                "Status": {
                    "select": {
                        "options": [
                            {"name": "📝 Submitted", "color": "blue"},
                            {"name": "✅ Acknowledged", "color": "green"},
                            {"name": "🎤 Interview Scheduled", "color": "purple"},
                            {"name": "⏳ Pending", "color": "yellow"},
                            {"name": "❌ Rejected", "color": "red"},
                            {"name": "🎉 Offer", "color": "green"}
                        ]
                    }
                },
                "Resume Version": {"rich_text": {}},
                "Cover Letter": {"files": {}},
                "Contact Person": {"rich_text": {}},
                "Contact Email": {"email": {}},
                "Follow Up Date": {"date": {}},
                "GDrive Folder": {"url": {}},
                "Notes": {"rich_text": {}},
                "Interview Count": {"number": {}},
                "Days Since Application": {
                    "formula": {
                        "expression": "dateBetween(now(), prop(\"Application Date\"), \"days\")"
                    }
                }
            }
        }

        return {
            "job_opportunities": job_opportunities_schema,
            "companies": companies_schema,
            "applications": applications_schema
        }

    def sync_job_to_notion(self, job_id: int) -> Optional[str]:
        """Sync a single job from SQLite to Notion"""
        with sqlite3.connect(self.local_db_path) as conn:
            conn.row_factory = sqlite3.Row
            job = conn.execute("""
                SELECT j.*, c.name as company_name, c.industry, c.website, c.description as company_description
                FROM job_opportunities j
                LEFT JOIN companies c ON j.company_id = c.id
                WHERE j.id = ?
            """, (job_id,)).fetchone()

            if not job:
                return None

        # Check if job already exists in Notion
        existing_page = self._find_notion_job_by_id(job_id)

        if existing_page:
            return self._update_notion_job(existing_page['id'], job)
        else:
            return self._create_notion_job(job)

    def _create_notion_job(self, job: sqlite3.Row) -> str:
        """Create new job page in Notion"""
        # First ensure company exists in Notion
        company_page_id = self._get_or_create_company(job)

        # Prepare job data
        job_data = {
            "parent": {"database_id": self.config.job_opportunities_db_id},
            "properties": {
                "Job Title": {
                    "title": [{"text": {"content": job['title'] or "Untitled Job"}}]
                },
                "Company": {
                    "relation": [{"id": company_page_id}] if company_page_id else []
                },
                "AI Score": {
                    "number": job['ai_score'] or 0
                },
                "Priority": {
                    "select": {"name": self._map_priority_to_notion(job['priority'])}
                },
                "Status": {
                    "select": {"name": self._map_status_to_notion(job['status'])}
                },
                "Location": {
                    "rich_text": [{"text": {"content": job['location'] or ""}}]
                },
                "Remote Option": {
                    "select": {"name": self._map_remote_option_to_notion(job['remote_option'])} if job['remote_option'] else None
                },
                "Salary Min": {
                    "number": job['salary_min']
                } if job['salary_min'] else {},
                "Salary Max": {
                    "number": job['salary_max']
                } if job['salary_max'] else {},
                "Application Deadline": {
                    "date": {"start": job['application_deadline']}
                } if job['application_deadline'] else {},
                "Posted Date": {
                    "date": {"start": job['posted_date']}
                } if job['posted_date'] else {},
                "Source": {
                    "select": {"name": job['source']}
                } if job['source'] else {},
                "Source URL": {
                    "url": job['source_url']
                } if job['source_url'] else {},
                "Job Description": {
                    "rich_text": [{"text": {"content": (job['job_description'] or "")[:2000]}}]
                },
                "Requirements": {
                    "rich_text": [{"text": {"content": (job['requirements'] or "")[:2000]}}]
                },
                "Notes": {
                    "rich_text": [{"text": {"content": (job['notes'] or "")[:2000]}}]
                }
            }
        }

        # Remove None values and empty dicts
        job_data['properties'] = {k: v for k, v in job_data['properties'].items()
                                 if v is not None and v != {}}

        try:
            response = requests.post(
                f"{self.base_url}/pages",
                headers=self.headers,
                json=job_data
            )
            response.raise_for_status()
            notion_page = response.json()

            # Store Notion page ID in local database
            with sqlite3.connect(self.local_db_path) as conn:
                conn.execute("""
                    UPDATE job_opportunities
                    SET notes = COALESCE(notes, '') || ?
                    WHERE id = ?
                """, (f"\nNotion Page ID: {notion_page['id']}", job['id']))

                # Log sync activity
                conn.execute("""
                    INSERT INTO activity_log
                    (activity_type, entity_type, entity_id, description, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    'notion_sync_create',
                    'job',
                    job['id'],
                    'Job synced to Notion database',
                    json.dumps({'notion_page_id': notion_page['id']})
                ))

            return notion_page['id']

        except requests.exceptions.RequestException as e:
            print(f"Failed to create Notion job: {e}")
            return None

    def sync_from_notion(self) -> List[Dict]:
        """Sync jobs from Notion to local SQLite database"""
        synced_jobs = []

        try:
            # Query Notion database
            response = requests.post(
                f"{self.base_url}/databases/{self.config.job_opportunities_db_id}/query",
                headers=self.headers,
                json={
                    "sorts": [{"property": "Last Updated", "direction": "descending"}],
                    "page_size": 100
                }
            )
            response.raise_for_status()
            notion_jobs = response.json()

            with sqlite3.connect(self.local_db_path) as conn:
                for notion_page in notion_jobs['results']:
                    job_data = self._parse_notion_job(notion_page)

                    if job_data:
                        # Check if job exists locally
                        existing = conn.execute("""
                            SELECT id FROM job_opportunities
                            WHERE notes LIKE ?
                        """, (f"%Notion Page ID: {notion_page['id']}%",)).fetchone()

                        if existing:
                            # Update existing job
                            self._update_local_job(conn, existing[0], job_data)
                        else:
                            # Create new job
                            job_id = self._create_local_job(conn, job_data, notion_page['id'])
                            synced_jobs.append({'action': 'created', 'job_id': job_id, 'title': job_data['title']})

        except requests.exceptions.RequestException as e:
            print(f"Failed to sync from Notion: {e}")

        return synced_jobs

    def create_notion_reading_list_entry(self, title: str, url: str, category: str = "Job Research",
                                       job_id: Optional[int] = None) -> Optional[str]:
        """Create reading list entry in Notion (if reading list DB is configured)"""
        if not self.config.reading_list_db_id:
            return None

        reading_data = {
            "parent": {"database_id": self.config.reading_list_db_id},
            "properties": {
                "Title": {
                    "title": [{"text": {"content": title}}]
                },
                "URL": {
                    "url": url
                },
                "Category": {
                    "select": {"name": category}
                },
                "Status": {
                    "select": {"name": "📋 To Read"}
                },
                "Added Date": {
                    "date": {"start": datetime.now().isoformat()}
                }
            }
        }

        # Link to job if provided
        if job_id:
            with sqlite3.connect(self.local_db_path) as conn:
                job = conn.execute("SELECT title FROM job_opportunities WHERE id = ?", (job_id,)).fetchone()
                if job:
                    reading_data['properties']['Related Job'] = {
                        "rich_text": [{"text": {"content": job[0]}}]
                    }

        try:
            response = requests.post(
                f"{self.base_url}/pages",
                headers=self.headers,
                json=reading_data
            )
            response.raise_for_status()
            return response.json()['id']

        except requests.exceptions.RequestException as e:
            print(f"Failed to create reading list entry: {e}")
            return None

    def _map_priority_to_notion(self, priority: str) -> str:
        """Map local priority to Notion format"""
        mapping = {
            'urgent': '🔥 Urgent',
            'high': '⭐ High',
            'medium': '📝 Medium',
            'low': '📋 Low'
        }
        return mapping.get(priority, '📝 Medium')

    def _map_status_to_notion(self, status: str) -> str:
        """Map local status to Notion format"""
        mapping = {
            'identified': '🔍 Identified',
            'scored': '📊 Scored',
            'applied': '📝 Applied',
            'interview': '🎤 Interview',
            'rejected': '❌ Rejected',
            'offer': '✅ Offer'
        }
        return mapping.get(status, '🔍 Identified')

    def _map_remote_option_to_notion(self, remote: str) -> str:
        """Map remote option to Notion format"""
        mapping = {
            'remote': '🏠 Remote',
            'hybrid': '🏢 Hybrid',
            'on-site': '🏭 On-site'
        }
        return mapping.get(remote, '🏢 Hybrid')

    def _get_or_create_company(self, job: sqlite3.Row) -> Optional[str]:
        """Get or create company in Notion companies database"""
        if not job['company_name']:
            return None

        # Search for existing company
        try:
            response = requests.post(
                f"{self.base_url}/databases/{self.config.companies_db_id}/query",
                headers=self.headers,
                json={
                    "filter": {
                        "property": "Company Name",
                        "title": {"equals": job['company_name']}
                    }
                }
            )
            response.raise_for_status()
            results = response.json()['results']

            if results:
                return results[0]['id']

            # Create new company
            company_data = {
                "parent": {"database_id": self.config.companies_db_id},
                "properties": {
                    "Company Name": {
                        "title": [{"text": {"content": job['company_name']}}]
                    },
                    "Industry": {
                        "select": {"name": job['industry']}
                    } if job['industry'] else {},
                    "Website": {
                        "url": job['website']
                    } if job['website'] else {},
                    "Description": {
                        "rich_text": [{"text": {"content": job['company_description'] or ""}}]
                    }
                }
            }

            # Remove empty properties
            company_data['properties'] = {k: v for k, v in company_data['properties'].items() if v}

            response = requests.post(
                f"{self.base_url}/pages",
                headers=self.headers,
                json=company_data
            )
            response.raise_for_status()
            return response.json()['id']

        except requests.exceptions.RequestException as e:
            print(f"Failed to create/get company: {e}")
            return None

    def _find_notion_job_by_id(self, job_id: int) -> Optional[Dict]:
        """Find job in Notion by local job ID stored in notes"""
        # Implementation would search Notion for pages with job_id reference
        # This is a simplified version - full implementation would be more robust
        return None

    def _update_notion_job(self, notion_page_id: str, job: sqlite3.Row) -> str:
        """Update existing job in Notion"""
        # Implementation for updating existing Notion pages
        # Would use PATCH /v1/pages/{page_id} endpoint
        return notion_page_id

    def _parse_notion_job(self, notion_page: Dict) -> Optional[Dict]:
        """Parse Notion page data into local job format"""
        # Implementation to extract job data from Notion page properties
        # Would handle all property types and convert to local format
        return None

    def _create_local_job(self, conn: sqlite3.Connection, job_data: Dict, notion_id: str) -> int:
        """Create new job in local database from Notion data"""
        # Implementation to create local job from Notion data
        pass

    def _update_local_job(self, conn: sqlite3.Connection, job_id: int, job_data: Dict):
        """Update existing local job with Notion data"""
        # Implementation to update local job with Notion changes
        pass

# Usage example and configuration
def setup_notion_integration():
    """Setup function to initialize Notion integration"""

    # These would be loaded from environment variables or config file
    config = NotionConfig(
        token=os.getenv('NOTION_TOKEN', ''),
        job_opportunities_db_id=os.getenv('NOTION_JOB_DB_ID', ''),
        companies_db_id=os.getenv('NOTION_COMPANIES_DB_ID', ''),
        applications_db_id=os.getenv('NOTION_APPLICATIONS_DB_ID', ''),
        reading_list_db_id=os.getenv('NOTION_READING_LIST_DB_ID', '')
    )

    return NotionJobTracker(config, 'job_tracker.db')

if __name__ == "__main__":
    notion_tracker = setup_notion_integration()
    # notion_tracker.sync_job_to_notion(1)
    # notion_tracker.sync_from_notion()