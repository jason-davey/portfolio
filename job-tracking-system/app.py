"""
Job Tracking System Web Interface
Flask web application for managing job opportunities and applications
"""

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
import os
from datetime import datetime, date
import json
from dotenv import load_dotenv
from src.scoring_algorithm import JobScoringAlgorithm
from src.cover_letter_generator import CoverLetterGenerator
from src.gdrive_automation import GoogleDriveAutomation
from src.notion_integration import setup_notion_integration

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Configuration
DATABASE_PATH = 'job_tracker.db'

# Initialize Notion integration (if configured)
notion_tracker = None
try:
    if os.getenv('NOTION_TOKEN'):
        notion_tracker = setup_notion_integration()
        print("✅ Notion integration enabled")
    else:
        print("ℹ️  Notion integration not configured (optional)")
except Exception as e:
    print(f"⚠️  Notion integration failed: {e}")

def init_database():
    """Initialize the database with schema"""
    if not os.path.exists(DATABASE_PATH):
        with sqlite3.connect(DATABASE_PATH) as conn:
            with open('database/schema.sql', 'r') as f:
                conn.executescript(f.read())
        print("Database initialized with schema")

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def dashboard():
    """Main dashboard showing job tracking overview"""
    conn = get_db_connection()

    # Get summary statistics
    stats = {}
    stats['total_jobs'] = conn.execute('SELECT COUNT(*) FROM job_opportunities').fetchone()[0]
    stats['high_priority'] = conn.execute(
        'SELECT COUNT(*) FROM job_opportunities WHERE priority = "high" OR ai_score >= 80'
    ).fetchone()[0]
    stats['applications_sent'] = conn.execute('SELECT COUNT(*) FROM applications').fetchone()[0]
    stats['interviews_scheduled'] = conn.execute('SELECT COUNT(*) FROM interviews').fetchone()[0]

    # Get recent jobs (top 10 by score and priority)
    recent_jobs = conn.execute("""
        SELECT j.*, c.name as company_name
        FROM job_opportunities j
        LEFT JOIN companies c ON j.company_id = c.id
        ORDER BY j.ai_score DESC, j.created_at DESC
        LIMIT 10
    """).fetchall()

    # Get application pipeline
    pipeline = conn.execute("""
        SELECT
            j.title,
            c.name as company_name,
            j.ai_score,
            j.priority,
            j.status,
            a.application_date,
            a.status as application_status
        FROM job_opportunities j
        LEFT JOIN companies c ON j.company_id = c.id
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.status NOT IN ('rejected', 'withdrawn')
        ORDER BY j.ai_score DESC, j.created_at DESC
        LIMIT 20
    """).fetchall()

    conn.close()

    return render_template('dashboard.html',
                         stats=stats,
                         recent_jobs=recent_jobs,
                         pipeline=pipeline)

@app.route('/jobs')
def jobs_list():
    """List all job opportunities with filtering"""
    conn = get_db_connection()

    # Get filter parameters
    status_filter = request.args.get('status', '')
    priority_filter = request.args.get('priority', '')
    min_score = request.args.get('min_score', 0, type=int)

    # Build query
    query = """
        SELECT j.*, c.name as company_name, c.industry
        FROM job_opportunities j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE 1=1
    """
    params = []

    if status_filter:
        query += " AND j.status = ?"
        params.append(status_filter)

    if priority_filter:
        query += " AND j.priority = ?"
        params.append(priority_filter)

    if min_score > 0:
        query += " AND j.ai_score >= ?"
        params.append(min_score)

    query += " ORDER BY j.ai_score DESC, j.created_at DESC"

    jobs = conn.execute(query, params).fetchall()
    conn.close()

    return render_template('jobs_list.html', jobs=jobs)

@app.route('/job/<int:job_id>')
def job_detail(job_id):
    """Job detail view with scoring breakdown"""
    conn = get_db_connection()

    job = conn.execute("""
        SELECT j.*, c.name as company_name, c.industry, c.description as company_description
        FROM job_opportunities j
        LEFT JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
    """, (job_id,)).fetchone()

    if not job:
        flash('Job not found', 'error')
        return redirect(url_for('jobs_list'))

    # Get scoring breakdown from activity log
    scoring_data = conn.execute("""
        SELECT metadata FROM activity_log
        WHERE entity_type = 'job' AND entity_id = ?
        AND activity_type = 'job_scored'
        ORDER BY created_at DESC
        LIMIT 1
    """, (job_id,)).fetchone()

    score_breakdown = None
    if scoring_data:
        try:
            score_breakdown = json.loads(scoring_data[0])
        except:
            pass

    # Get applications for this job
    applications = conn.execute("""
        SELECT * FROM applications WHERE job_id = ? ORDER BY application_date DESC
    """, (job_id,)).fetchall()

    # Get generated documents
    documents = conn.execute("""
        SELECT * FROM generated_documents WHERE job_id = ? ORDER BY created_at DESC
    """, (job_id,)).fetchall()

    conn.close()

    return render_template('job_detail.html',
                         job=job,
                         score_breakdown=score_breakdown,
                         applications=applications,
                         documents=documents)

@app.route('/job/add', methods=['GET', 'POST'])
def add_job():
    """Add new job opportunity"""
    if request.method == 'POST':
        conn = get_db_connection()

        # Check if company exists, create if not
        company_name = request.form['company_name']
        company = conn.execute('SELECT id FROM companies WHERE name = ?', (company_name,)).fetchone()

        if not company:
            conn.execute("""
                INSERT INTO companies (name, industry, description)
                VALUES (?, ?, ?)
            """, (company_name, request.form.get('industry', ''), request.form.get('company_description', '')))
            company_id = conn.lastrowid
        else:
            company_id = company['id']

        # Insert job
        conn.execute("""
            INSERT INTO job_opportunities
            (company_id, title, level, employment_type, location, remote_option,
             salary_min, salary_max, job_description, requirements, source, source_url,
             posted_date, application_deadline, priority, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            company_id,
            request.form['title'],
            request.form.get('level', ''),
            request.form.get('employment_type', ''),
            request.form.get('location', ''),
            request.form.get('remote_option', ''),
            request.form.get('salary_min', type=int) or None,
            request.form.get('salary_max', type=int) or None,
            request.form.get('job_description', ''),
            request.form.get('requirements', ''),
            request.form.get('source', ''),
            request.form.get('source_url', ''),
            request.form.get('posted_date') or None,
            request.form.get('application_deadline') or None,
            request.form.get('priority', 'medium'),
            request.form.get('notes', '')
        ))

        job_id = conn.lastrowid
        conn.commit()
        conn.close()

        # Sync to Notion if configured
        if notion_tracker:
            try:
                notion_page_id = notion_tracker.sync_job_to_notion(job_id)
                if notion_page_id:
                    flash('Job opportunity added and synced to Notion!', 'success')
                else:
                    flash('Job opportunity added (Notion sync failed)', 'warning')
            except Exception as e:
                flash(f'Job opportunity added (Notion error: {str(e)})', 'warning')
        else:
            flash('Job opportunity added successfully!', 'success')

        return redirect(url_for('job_detail', job_id=job_id))

    return render_template('add_job.html')

@app.route('/api/score_job/<int:job_id>', methods=['POST'])
def score_job(job_id):
    """API endpoint to score a job opportunity"""
    try:
        scorer = JobScoringAlgorithm(DATABASE_PATH)
        score_result = scorer.update_job_score(job_id)

        return jsonify({
            'success': True,
            'total_score': score_result.total_score,
            'breakdown': score_result.breakdown,
            'recommendations': score_result.recommendations,
            'strong_matches': score_result.strong_matches,
            'missing_requirements': score_result.missing_requirements
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/generate_cover_letter/<int:job_id>', methods=['POST'])
def generate_cover_letter(job_id):
    """API endpoint to generate a cover letter"""
    try:
        generator = CoverLetterGenerator(DATABASE_PATH)
        template_style = request.json.get('template_style', 'auto')

        cover_letter = generator.generate_cover_letter(job_id, template_style)
        filepath = generator.save_cover_letter(job_id, cover_letter, template_style)

        return jsonify({
            'success': True,
            'filepath': filepath,
            'content_preview': cover_letter.full_letter[:500] + '...'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create_application_package/<int:job_id>', methods=['POST'])
def create_application_package(job_id):
    """API endpoint to create complete application package"""
    try:
        automation = GoogleDriveAutomation(DATABASE_PATH)
        folder_path = automation.create_application_package(job_id)

        return jsonify({
            'success': True,
            'folder_path': folder_path,
            'message': f'Application package created in Google Drive: {folder_path}'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sync_to_notion/<int:job_id>', methods=['POST'])
def sync_to_notion(job_id):
    """API endpoint to sync a job to Notion"""
    if not notion_tracker:
        return jsonify({'success': False, 'error': 'Notion integration not configured'}), 400

    try:
        notion_page_id = notion_tracker.sync_job_to_notion(job_id)
        if notion_page_id:
            return jsonify({
                'success': True,
                'notion_page_id': notion_page_id,
                'message': 'Job synced to Notion successfully'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to sync to Notion'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sync_from_notion', methods=['POST'])
def sync_from_notion():
    """API endpoint to sync jobs from Notion"""
    if not notion_tracker:
        return jsonify({'success': False, 'error': 'Notion integration not configured'}), 400

    try:
        synced_jobs = notion_tracker.sync_from_notion()
        return jsonify({
            'success': True,
            'synced_count': len(synced_jobs),
            'synced_jobs': synced_jobs
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create_reading_list', methods=['POST'])
def create_reading_list():
    """API endpoint to create reading list entry in Notion"""
    if not notion_tracker:
        return jsonify({'success': False, 'error': 'Notion integration not configured'}), 400

    try:
        data = request.get_json()
        entry_id = notion_tracker.create_notion_reading_list_entry(
            title=data.get('title', ''),
            url=data.get('url', ''),
            category=data.get('category', 'Job Research'),
            job_id=data.get('job_id')
        )

        if entry_id:
            return jsonify({
                'success': True,
                'entry_id': entry_id,
                'message': 'Reading list entry created'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to create reading list entry'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/applications')
def applications_list():
    """List all applications"""
    conn = get_db_connection()

    applications = conn.execute("""
        SELECT
            a.*,
            j.title as job_title,
            c.name as company_name,
            j.ai_score
        FROM applications a
        JOIN job_opportunities j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        ORDER BY a.application_date DESC
    """).fetchall()

    conn.close()

    return render_template('applications_list.html', applications=applications)

@app.route('/analytics')
def analytics():
    """Analytics dashboard"""
    conn = get_db_connection()

    # Score distribution
    score_distribution = conn.execute("""
        SELECT
            CASE
                WHEN ai_score >= 90 THEN '90-100'
                WHEN ai_score >= 80 THEN '80-89'
                WHEN ai_score >= 70 THEN '70-79'
                WHEN ai_score >= 60 THEN '60-69'
                WHEN ai_score >= 50 THEN '50-59'
                ELSE '0-49'
            END as score_range,
            COUNT(*) as count
        FROM job_opportunities
        GROUP BY score_range
        ORDER BY score_range DESC
    """).fetchall()

    # Source analysis
    source_analysis = conn.execute("""
        SELECT source, COUNT(*) as count, AVG(ai_score) as avg_score
        FROM job_opportunities
        WHERE source IS NOT NULL AND source != ''
        GROUP BY source
        ORDER BY count DESC
    """).fetchall()

    # Monthly trends
    monthly_trends = conn.execute("""
        SELECT
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as jobs_added,
            AVG(ai_score) as avg_score
        FROM job_opportunities
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
    """).fetchall()

    conn.close()

    return render_template('analytics.html',
                         score_distribution=score_distribution,
                         source_analysis=source_analysis,
                         monthly_trends=monthly_trends)

@app.template_filter('datetime')
def datetime_filter(value):
    """Format datetime for templates"""
    if value is None:
        return ''
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value)
        except:
            return value
    return value.strftime('%B %d, %Y')

@app.template_filter('priority_badge')
def priority_badge(priority):
    """Priority badge classes"""
    badges = {
        'urgent': 'badge-danger',
        'high': 'badge-warning',
        'medium': 'badge-info',
        'low': 'badge-secondary'
    }
    return badges.get(priority, 'badge-secondary')

@app.template_filter('score_badge')
def score_badge(score):
    """Score badge classes"""
    if score >= 90:
        return 'badge-success'
    elif score >= 80:
        return 'badge-info'
    elif score >= 70:
        return 'badge-warning'
    else:
        return 'badge-secondary'

if __name__ == '__main__':
    init_database()
    app.run(debug=True, port=5001)