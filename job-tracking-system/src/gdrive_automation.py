"""
Google Drive Automation for Job Applications
Creates organized folder structures and uploads documents automatically
"""

import os
import sqlite3
import subprocess
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import re

class GoogleDriveAutomation:
    def __init__(self, db_path: str, rclone_remote: str = "gdrive"):
        self.db_path = db_path
        self.rclone_remote = rclone_remote
        self.base_folder = "Job-Opportunities"

    def create_application_folder_structure(self, job_id: int) -> str:
        """Create organized folder structure for a job application"""
        with sqlite3.connect(self.db_path) as conn:
            job_data = self._get_job_data(conn, job_id)
            if not job_data:
                raise ValueError(f"Job {job_id} not found")

        # Create safe folder names
        company_safe = self._make_safe_filename(job_data['company_name'])
        position_safe = self._make_safe_filename(job_data['title'])

        # Folder structure: Job-Opportunities/{Company}/{Position}-{Date}/
        date_str = datetime.now().strftime("%Y-%m")
        folder_path = f"{self.base_folder}/{company_safe}/{position_safe}-{date_str}"

        # Create folder structure in Google Drive
        full_path = f"{self.rclone_remote}:{folder_path}"

        try:
            # Create main application folder
            subprocess.run(["rclone", "mkdir", full_path], check=True, capture_output=True)

            # Create subfolders
            subfolders = [
                "01-Resume-and-CV",
                "02-Cover-Letter",
                "03-Portfolio-Samples",
                "04-Communications",
                "05-Interview-Prep",
                "06-Follow-up"
            ]

            for subfolder in subfolders:
                subprocess.run(
                    ["rclone", "mkdir", f"{full_path}/{subfolder}"],
                    check=True,
                    capture_output=True
                )

            # Update database with folder path
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    UPDATE job_opportunities
                    SET notes = COALESCE(notes, '') || ?
                    WHERE id = ?
                """, (f"\nGoogle Drive Folder: {folder_path}", job_id))

                # Log activity
                conn.execute("""
                    INSERT INTO activity_log
                    (activity_type, entity_type, entity_id, description, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    'gdrive_folder_created',
                    'job',
                    job_id,
                    f"Created application folder structure in Google Drive",
                    json.dumps({'folder_path': folder_path, 'subfolders': subfolders})
                ))

            return folder_path

        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to create Google Drive folders: {e}")

    def upload_application_documents(self, job_id: int, documents: Dict[str, str]) -> Dict[str, str]:
        """
        Upload application documents to appropriate folders

        Args:
            job_id: Job ID
            documents: Dict mapping document type to local file path
                      e.g., {'resume': '/path/to/resume.docx', 'cover_letter': '/path/to/cover.docx'}

        Returns:
            Dict mapping document type to Google Drive path
        """
        with sqlite3.connect(self.db_path) as conn:
            job_data = self._get_job_data(conn, job_id)
            if not job_data:
                raise ValueError(f"Job {job_id} not found")

        # Get or create folder structure
        folder_path = self._get_or_create_folder_path(job_id)
        uploaded_paths = {}

        # Document type to subfolder mapping
        folder_mapping = {
            'resume': '01-Resume-and-CV',
            'tailored_resume': '01-Resume-and-CV',
            'cover_letter': '02-Cover-Letter',
            'portfolio_sample': '03-Portfolio-Samples',
            'communication': '04-Communications',
            'interview_prep': '05-Interview-Prep',
            'follow_up': '06-Follow-up'
        }

        for doc_type, local_path in documents.items():
            if not os.path.exists(local_path):
                print(f"Warning: File not found: {local_path}")
                continue

            # Determine target subfolder
            subfolder = folder_mapping.get(doc_type, '04-Communications')
            target_folder = f"{self.rclone_remote}:{folder_path}/{subfolder}/"

            try:
                # Upload file
                result = subprocess.run(
                    ["rclone", "copy", local_path, target_folder],
                    check=True,
                    capture_output=True,
                    text=True
                )

                filename = os.path.basename(local_path)
                gdrive_path = f"{folder_path}/{subfolder}/{filename}"
                uploaded_paths[doc_type] = gdrive_path

                # Update database
                with sqlite3.connect(self.db_path) as conn:
                    conn.execute("""
                        INSERT OR REPLACE INTO generated_documents
                        (job_id, document_type, file_path, gdrive_path, generation_method)
                        VALUES (?, ?, ?, ?, ?)
                    """, (job_id, doc_type, local_path, gdrive_path, 'uploaded'))

                print(f"✅ Uploaded {doc_type}: {gdrive_path}")

            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to upload {doc_type}: {e}")

        # Log bulk upload activity
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO activity_log
                (activity_type, entity_type, entity_id, description, metadata)
                VALUES (?, ?, ?, ?, ?)
            """, (
                'documents_uploaded',
                'job',
                job_id,
                f"Uploaded {len(uploaded_paths)} documents to Google Drive",
                json.dumps({'uploaded_documents': uploaded_paths})
            ))

        return uploaded_paths

    def create_application_package(self, job_id: int) -> str:
        """
        Create complete application package with resume, cover letter, and portfolio samples
        """
        with sqlite3.connect(self.db_path) as conn:
            job_data = self._get_job_data(conn, job_id)
            if not job_data:
                raise ValueError(f"Job {job_id} not found")

        # Create folder structure
        folder_path = self.create_application_folder_structure(job_id)

        # Prepare documents
        documents_to_upload = {}

        # 1. Resume (use appropriate version based on job requirements)
        resume_version = self._select_best_resume_version(job_data)
        if resume_version and os.path.exists(resume_version):
            documents_to_upload['resume'] = resume_version

        # 2. Generate and upload cover letter
        try:
            from .cover_letter_generator import CoverLetterGenerator

            cover_gen = CoverLetterGenerator(self.db_path)
            cover_letter = cover_gen.generate_cover_letter(job_id)
            cover_path = cover_gen.save_cover_letter(job_id, cover_letter, 'auto')

            # Convert to DOCX using the existing workflow
            cover_docx_path = self._convert_md_to_docx(cover_path)
            if cover_docx_path:
                documents_to_upload['cover_letter'] = cover_docx_path

        except Exception as e:
            print(f"Warning: Could not generate cover letter: {e}")

        # 3. Portfolio samples (if applicable)
        portfolio_samples = self._get_relevant_portfolio_samples(job_data)
        for i, sample_path in enumerate(portfolio_samples):
            documents_to_upload[f'portfolio_sample_{i+1}'] = sample_path

        # Upload all documents
        uploaded_paths = self.upload_application_documents(job_id, documents_to_upload)

        # Create application summary document
        summary_path = self._create_application_summary(job_id, uploaded_paths)
        if summary_path:
            self.upload_application_documents(job_id, {'application_summary': summary_path})

        return folder_path

    def get_shareable_links(self, job_id: int) -> Dict[str, str]:
        """Get shareable Google Drive links for application documents"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT document_type, gdrive_path
                FROM generated_documents
                WHERE job_id = ? AND gdrive_path IS NOT NULL
            """, (job_id,))

            documents = cursor.fetchall()

        shareable_links = {}

        for doc_type, gdrive_path in documents:
            try:
                # Get file info and create shareable link
                result = subprocess.run([
                    "rclone", "link", f"{self.rclone_remote}:{gdrive_path}"
                ], capture_output=True, text=True, check=True)

                link = result.stdout.strip()
                shareable_links[doc_type] = link

            except subprocess.CalledProcessError as e:
                print(f"Could not create shareable link for {doc_type}: {e}")

        return shareable_links

    def _get_job_data(self, conn: sqlite3.Connection, job_id: int) -> Optional[Dict]:
        """Get job data from database"""
        cursor = conn.execute("""
            SELECT j.*, c.name as company_name, c.industry
            FROM job_opportunities j
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE j.id = ?
        """, (job_id,))

        row = cursor.fetchone()
        if not row:
            return None

        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, row))

    def _make_safe_filename(self, name: str) -> str:
        """Convert name to safe filename/folder name"""
        # Remove or replace problematic characters
        safe_name = re.sub(r'[<>:"/\\|?*]', '-', name)
        safe_name = re.sub(r'\s+', '-', safe_name.strip())
        safe_name = re.sub(r'-+', '-', safe_name)
        return safe_name[:100]  # Limit length

    def _get_or_create_folder_path(self, job_id: int) -> str:
        """Get existing folder path or create new one"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT metadata FROM activity_log
                WHERE entity_type = 'job' AND entity_id = ?
                AND activity_type = 'gdrive_folder_created'
                ORDER BY created_at DESC
                LIMIT 1
            """, (job_id,))

            row = cursor.fetchone()
            if row:
                metadata = json.loads(row[0])
                return metadata.get('folder_path')

        # Create new folder structure
        return self.create_application_folder_structure(job_id)

    def _select_best_resume_version(self, job_data: Dict) -> Optional[str]:
        """Select the most appropriate resume version for the job"""
        # For now, use the executive resume for most positions
        # Could be enhanced with more sophisticated matching

        resume_options = [
            "/Users/jd/Projects/portfolio/Executive_Resume_JasonDavey_2025_2Page.docx",
            "/Users/jd/Projects/portfolio/ATS_Executive_Resume_JasonDavey_2025.docx"
        ]

        # Use 2-page version for most applications
        for resume_path in resume_options:
            if os.path.exists(resume_path):
                return resume_path

        return None

    def _convert_md_to_docx(self, md_path: str) -> Optional[str]:
        """Convert markdown to DOCX using existing workflow"""
        if not os.path.exists(md_path):
            return None

        try:
            # Use the existing resume conversion script pattern
            docx_path = md_path.replace('.md', '.docx')

            template_path = "/Users/jd/Projects/portfolio/Resume Doc template.dotx"

            if os.path.exists(template_path):
                subprocess.run([
                    "pandoc", md_path, "-o", docx_path,
                    "--from", "markdown",
                    "--to", "docx",
                    "--reference-doc", template_path,
                    "--standalone"
                ], check=True)
            else:
                subprocess.run([
                    "pandoc", md_path, "-o", docx_path,
                    "--from", "markdown",
                    "--to", "docx",
                    "--standalone"
                ], check=True)

            return docx_path

        except subprocess.CalledProcessError as e:
            print(f"Failed to convert {md_path} to DOCX: {e}")
            return None

    def _get_relevant_portfolio_samples(self, job_data: Dict) -> List[str]:
        """Get relevant portfolio samples based on job requirements"""
        # For now, return empty list - could be enhanced to select
        # relevant portfolio pieces based on job requirements
        return []

    def _create_application_summary(self, job_id: int, uploaded_documents: Dict[str, str]) -> Optional[str]:
        """Create application summary document"""
        with sqlite3.connect(self.db_path) as conn:
            job_data = self._get_job_data(conn, job_id)
            if not job_data:
                return None

        # Create summary content
        summary_content = f"""# Application Summary

**Position:** {job_data['title']}
**Company:** {job_data['company_name']}
**Application Date:** {datetime.now().strftime('%B %d, %Y')}
**Status:** {job_data['status']}

## Job Details
- **Location:** {job_data.get('location', 'Not specified')}
- **Employment Type:** {job_data.get('employment_type', 'Not specified')}
- **Salary Range:** {job_data.get('salary_min', 'N/A')} - {job_data.get('salary_max', 'N/A')} {job_data.get('currency', 'AUD')}
- **Source:** {job_data.get('source', 'Direct')}
- **AI Compatibility Score:** {job_data.get('ai_score', 0)}/100

## Uploaded Documents
"""

        for doc_type, gdrive_path in uploaded_documents.items():
            summary_content += f"- **{doc_type.replace('_', ' ').title()}:** {gdrive_path}\n"

        summary_content += f"""
## Application Strategy
Based on AI analysis, this position shows a {job_data.get('ai_score', 0)}% compatibility match with Jason's profile.

## Next Steps
- [ ] Submit application
- [ ] Follow up in 1 week
- [ ] Prepare for potential interview
- [ ] Research company culture and recent news

---
*Generated automatically by Job Tracking System*
"""

        # Save summary file
        company_safe = self._make_safe_filename(job_data['company_name'])
        position_safe = self._make_safe_filename(job_data['title'])

        summary_filename = f"Application_Summary_{company_safe}_{position_safe}_{datetime.now().strftime('%Y%m%d')}.md"
        summary_path = f"/Users/jd/Projects/portfolio/job-tracking-system/generated_docs/{summary_filename}"

        # Ensure directory exists
        os.makedirs(os.path.dirname(summary_path), exist_ok=True)

        with open(summary_path, 'w') as f:
            f.write(summary_content)

        return summary_path

# Usage example:
if __name__ == "__main__":
    automation = GoogleDriveAutomation("job_tracker.db")
    # folder_path = automation.create_application_package(1)
    # print(f"Application package created: {folder_path}")