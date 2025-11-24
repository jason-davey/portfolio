#!/usr/bin/env python3
"""
Job Tracking System Setup Script
Initializes the database and creates necessary directories
"""

import os
import sqlite3
import subprocess
from pathlib import Path

def create_directories():
    """Create necessary directories"""
    directories = [
        'generated_docs',
        'templates',
        'static',
        'src',
        'database'
    ]

    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def initialize_database():
    """Initialize SQLite database with schema"""
    db_path = 'job_tracker.db'

    if os.path.exists(db_path):
        response = input(f"Database {db_path} already exists. Recreate? (y/N): ")
        if response.lower() != 'y':
            print("Keeping existing database")
            return
        os.remove(db_path)

    with sqlite3.connect(db_path) as conn:
        with open('database/schema.sql', 'r') as f:
            conn.executescript(f.read())

    print(f"✅ Database initialized: {db_path}")

def populate_jason_profile():
    """Populate Jason's profile data for scoring"""
    with sqlite3.connect('job_tracker.db') as conn:
        # Clear existing profile data
        conn.execute('DELETE FROM my_profile')

        # Executive Leadership skills
        executive_skills = [
            ('Chief Design Officer', 10, 5, 'executive,leadership,design,strategy', 'CDO,Chief Design,Head of Design'),
            ('Chief Technology Officer', 8, 2, 'executive,technology,technical,strategy', 'CTO,Chief Technology,Technical Director'),
            ('Strategic Planning', 10, 13, 'strategy,planning,vision,roadmap', 'Strategic,Strategy,Planning,Vision'),
            ('P&L Management', 9, 8, 'business,financial,budget,revenue', 'P&L,Budget,Financial,Revenue'),
            ('Digital Transformation', 10, 13, 'transformation,change,digital,innovation', 'Digital Transform,Transformation,Change'),
            ('Team Leadership', 10, 13, 'leadership,management,mentor,coaching', 'Team Lead,Management,Leadership,Mentor'),
            ('Organizational Design', 9, 10, 'organization,structure,design,change', 'Organizational,Structure,Change Management'),
        ]

        # AI & Technology skills
        ai_tech_skills = [
            ('AI/ML Integration', 9, 2, 'ai,ml,artificial intelligence,integration', 'AI,Machine Learning,ML,Artificial Intelligence'),
            ('AWS Bedrock', 8, 1, 'aws,cloud,bedrock,claude', 'AWS,Bedrock,Claude,Amazon'),
            ('Multi-Agent Systems', 9, 1, 'ai,agents,systems,automation', 'Multi-agent,Agent,LangChain'),
            ('Solution Architecture', 10, 8, 'architecture,solution,system,design', 'Solution Architect,Architecture,System Design'),
            ('Enterprise Architecture', 9, 6, 'enterprise,architecture,togaf,ea', 'Enterprise Arch,TOGAF,EA'),
            ('Natural Language Processing', 8, 2, 'nlp,language,processing,ai', 'NLP,Natural Language,Text Processing'),
        ]

        # Design Innovation skills
        design_skills = [
            ('Multi-Modal Design', 10, 1, 'design,innovation,framework,multimodal', 'Multi-modal,Design Innovation,Design Framework'),
            ('AI+UX Integration', 10, 1, 'ai,ux,design,integration', 'AI UX,AI Design,UX AI'),
            ('Design Strategy', 10, 13, 'design,strategy,vision,leadership', 'Design Strategy,Design Vision,Design Lead'),
            ('User Experience Design', 10, 13, 'ux,user,experience,design', 'UX,User Experience,UX Design'),
            ('Human-Centered Design', 10, 13, 'human,centered,design,hcd', 'Human-centered,HCD,User-centered'),
            ('Design Systems', 9, 8, 'design,systems,components,library', 'Design System,Design Library,Component'),
            ('Design Operations', 8, 5, 'design,operations,process,workflow', 'DesignOps,Design Ops,Design Operation'),
        ]

        # Consulting & Business skills
        consulting_skills = [
            ('Management Consulting', 9, 8, 'consulting,management,strategy,business', 'Management Consult,Strategy Consult,Consulting'),
            ('Business Analysis', 9, 13, 'business,analysis,process,optimization', 'Business Analysis,Process,Analysis'),
            ('Process Optimization', 9, 13, 'process,optimization,efficiency,improvement', 'Process Optim,Efficiency,Optimization'),
            ('ROI Analysis', 8, 10, 'roi,analysis,business,case', 'ROI,Return on Investment,Business Case'),
            ('Strategic Roadmaps', 9, 10, 'strategy,roadmap,planning,vision', 'Roadmap,Strategy,Planning'),
            ('Stakeholder Management', 10, 13, 'stakeholder,management,communication,alignment', 'Stakeholder,Stakeholder Management'),
        ]

        # Insert all skills
        all_skills = []
        all_skills.extend([('executive_leadership',) + skill for skill in executive_skills])
        all_skills.extend([('ai_technology',) + skill for skill in ai_tech_skills])
        all_skills.extend([('design_innovation',) + skill for skill in design_skills])
        all_skills.extend([('consulting_business',) + skill for skill in consulting_skills])

        for category, skill_name, proficiency, years, examples, keywords in all_skills:
            conn.execute("""
                INSERT INTO my_profile
                (category, skill, proficiency_level, years_experience, examples, keywords)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (category, skill_name, proficiency, years, examples, keywords))

        print(f"✅ Populated profile with {len(all_skills)} skills")

def check_dependencies():
    """Check required system dependencies"""
    dependencies = [
        ('pandoc', 'Document conversion'),
        ('rclone', 'Google Drive integration'),
        ('python3', 'Python runtime'),
        ('pip3', 'Python package manager')
    ]

    missing_deps = []

    for cmd, description in dependencies:
        try:
            result = subprocess.run([cmd, '--version'],
                                  capture_output=True,
                                  text=True,
                                  check=True)
            print(f"✅ {cmd}: {description}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"❌ {cmd}: {description} - NOT FOUND")
            missing_deps.append((cmd, description))

    if missing_deps:
        print("\nMissing dependencies:")
        for cmd, desc in missing_deps:
            if cmd == 'pandoc':
                print(f"  Install {cmd}: brew install pandoc")
            elif cmd == 'rclone':
                print(f"  Install {cmd}: brew install rclone")
        return False

    return True

def install_python_requirements():
    """Install Python requirements"""
    requirements = [
        'flask',
        'sqlite3'  # Built into Python
    ]

    # Create requirements.txt
    with open('requirements.txt', 'w') as f:
        f.write("flask>=2.0.0\n")

    print("✅ Created requirements.txt")

    try:
        subprocess.run(['pip3', 'install', 'flask'], check=True)
        print("✅ Installed Python dependencies")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install Python dependencies")
        print("Run: pip3 install flask")
        return False

def setup_rclone_reminder():
    """Remind user to set up rclone"""
    print("\n" + "="*60)
    print("IMPORTANT: Google Drive Setup Required")
    print("="*60)
    print("To use Google Drive integration, you need to:")
    print("1. Configure rclone with your Google Drive account")
    print("2. Run: rclone config")
    print("3. Choose 'New remote' and follow the prompts")
    print("4. Use 'gdrive' as the remote name")
    print("5. Select 'Google Drive' as the storage type")
    print("6. Use jasdavey@gmail.com as the account")
    print("\nThe system will work without this, but Google Drive")
    print("automation features will be disabled.")
    print("="*60)

def main():
    """Main setup function"""
    print("🚀 Job Tracking System Setup")
    print("="*40)

    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies before continuing")
        return

    # Create directories
    create_directories()

    # Install Python requirements
    install_python_requirements()

    # Initialize database
    initialize_database()

    # Populate profile
    populate_jason_profile()

    # Rclone reminder
    setup_rclone_reminder()

    print("\n🎉 Setup Complete!")
    print("\nTo start the application:")
    print("  python3 app.py")
    print("\nThen open: http://localhost:5000")
    print("\nFor help, see: README.md")

if __name__ == '__main__':
    main()