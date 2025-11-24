"""
AI-Powered Cover Letter Generation System
Creates tailored cover letters based on job requirements and Jason's profile
"""

import sqlite3
import json
import re
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class CoverLetterContent:
    opening_paragraph: str
    body_paragraphs: List[str]
    closing_paragraph: str
    call_to_action: str
    full_letter: str

class CoverLetterGenerator:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_templates()
        self.init_jason_profile()

    def init_templates(self):
        """Initialize cover letter templates and components"""
        self.templates = {
            'executive_leadership': {
                'openings': [
                    "As a Chief Design & Technical Officer with 13+ years pioneering AI-powered design innovation, I am excited to apply for the {position} role at {company}.",
                    "Your {position} opportunity at {company} perfectly aligns with my proven expertise in leading enterprise transformation and AI+UX integration across Fortune 500 organizations.",
                    "Having successfully delivered $270M+ in cost savings and led award-winning digital transformation programs, I am eager to bring my strategic leadership to {company} as {position}."
                ],
                'body_focus': [
                    "strategic leadership and executive vision",
                    "enterprise transformation and organizational change",
                    "C-level stakeholder management and board communication",
                    "P&L accountability and business strategy development"
                ]
            },
            'ai_innovation': {
                'openings': [
                    "As a pioneer in AI+UX integration methodologies, I am thrilled to apply for the {position} role at {company}, where I can leverage my expertise in multi-modal design frameworks and intelligent automation systems.",
                    "Your search for a {position} who can drive AI innovation aligns perfectly with my track record of developing industry-first triple-AI collaborative systems and executive AI dashboards.",
                    "With extensive experience in AWS Bedrock, multi-agent AI systems, and AI-powered design automation, I am excited to contribute to {company}'s technological advancement as {position}."
                ],
                'body_focus': [
                    "AI/ML integration and multi-agent systems development",
                    "multi-modal design frameworks and methodologies",
                    "AI-powered automation and intelligent design systems",
                    "executive AI dashboard development and analytics"
                ]
            },
            'design_leadership': {
                'openings': [
                    "As a design leader who has established comprehensive design practices from ground up across financial services and technology sectors, I am excited to apply for the {position} role at {company}.",
                    "Your {position} opportunity represents the perfect intersection of my expertise in design strategy, user experience innovation, and team leadership.",
                    "Having led award-winning design initiatives including the Westpac Wonder platform, I am eager to bring my proven design leadership to {company}."
                ],
                'body_focus': [
                    "design strategy and vision development",
                    "user experience innovation and human-centered design",
                    "design systems and operations optimization",
                    "cross-functional team leadership and capability building"
                ]
            },
            'consulting': {
                'openings': [
                    "As a management consultant with deep expertise in business design and organizational transformation, I am excited to apply for the {position} role at {company}.",
                    "Your search for a {position} who can deliver measurable business outcomes aligns with my track record of leading high-impact consulting engagements across diverse industries.",
                    "With proven success in process optimization, strategic roadmap development, and stakeholder management, I am eager to contribute to {company}'s growth as {position}."
                ],
                'body_focus': [
                    "management consulting and business transformation",
                    "process optimization and efficiency improvement",
                    "strategic analysis and roadmap development",
                    "client relationship management and value delivery"
                ]
            }
        }

        self.achievements_bank = {
            'quantified_results': [
                "Delivered £270 million cost-saving transformation program at British Telecommunications",
                "Achieved 20% increase in decision-making efficiency through Business Services Unit redesign at ANZ Bank",
                "Reduced concept-to-prototype delivery from weeks to 72 hours through Multi-Modal Design Framework",
                "Implemented 10x faster visual iteration through AI-integrated design workflows",
                "Led $2 billion Customer Service Hub transformation program at Westpac",
                "Built executive AI dashboard reducing analysis time from hours to minutes",
                "Achieved 100% automated test coverage of AI integration points"
            ],
            'innovation_examples': [
                "Developed industry-first triple-AI collaborative environment (Voiceflow, Claude Code, v0.dev)",
                "Created proprietary Multi-Modal Design Framework integrating Human-Centered Design with AI assistance",
                "Pioneered AI+UX integration methodologies for enterprise-scale implementations",
                "Established Service Design Centres of Excellence across multiple Fortune 500 companies",
                "Led AI-powered design automation with <2 minute design-to-code deployment cycles"
            ],
            'leadership_examples': [
                "Led cross-functional teams of 10+ designers and researchers across multiple banking brands",
                "Managed enterprise-wide AI adoption strategy for design and product development teams",
                "Established comprehensive design practice from ground up in financial services environment",
                "Mentored C-suite leadership teams on design thinking and innovation methodologies",
                "Built and scaled design organizations across multinational enterprises"
            ],
            'awards_recognition': [
                "Winner of Australian Retail Banking Awards, Asian Banker Excellence Award, and Good Design Australia Awards (2016)",
                "Diamond Winner of LearnX Awards for Best Blended Model & Talent Development",
                "AITD Excellence Awards Highly Commended (2022) for Best Capability Building Program",
                "Project Davinci Finalist (Service Design Network, 2018)"
            ]
        }

        self.closing_templates = [
            "I am excited about the opportunity to bring my proven track record of {key_strength} to {company} and would welcome the chance to discuss how my experience in {relevant_area} can drive {business_outcome} for your organization.",
            "Given {company}'s commitment to {company_value}, I am particularly excited to contribute my expertise in {matching_skill} and help advance your {strategic_goal}.",
            "I would be delighted to discuss how my experience in {core_competency} and passion for {relevant_passion} can contribute to {company}'s continued success and innovation."
        ]

    def init_jason_profile(self):
        """Initialize Jason's profile for personalization"""
        self.jason_profile = {
            'core_strengths': [
                'AI+UX integration leadership',
                'enterprise transformation',
                'strategic design thinking',
                'executive stakeholder management',
                'multi-modal design innovation'
            ],
            'passion_areas': [
                'AI-powered design innovation',
                'organizational transformation',
                'human-centered design',
                'executive leadership development',
                'emerging technology integration'
            ],
            'value_propositions': [
                'proven ability to deliver measurable business outcomes',
                'track record of building high-performing design teams',
                'expertise in bridging technology innovation with business strategy',
                'experience scaling design practices across enterprise organizations'
            ],
            'industry_expertise': {
                'Financial Services': 'extensive experience in banking transformation and regulatory compliance',
                'Technology': 'deep expertise in AI/ML integration and technical architecture',
                'Consulting': 'proven track record in management consulting and business transformation',
                'Education': 'leadership in learning design and capability development'
            }
        }

    def generate_cover_letter(self, job_id: int, template_style: str = 'auto') -> CoverLetterContent:
        """Generate a tailored cover letter for a specific job"""
        with sqlite3.connect(self.db_path) as conn:
            job_data = self._get_job_data(conn, job_id)
            if not job_data:
                raise ValueError(f"Job {job_id} not found")

        # Determine best template style if auto
        if template_style == 'auto':
            template_style = self._determine_template_style(job_data)

        # Generate content
        opening = self._generate_opening(job_data, template_style)
        body_paragraphs = self._generate_body_paragraphs(job_data, template_style)
        closing = self._generate_closing(job_data)
        call_to_action = self._generate_call_to_action(job_data)

        # Assemble full letter
        full_letter = self._assemble_full_letter(
            job_data, opening, body_paragraphs, closing, call_to_action
        )

        return CoverLetterContent(
            opening_paragraph=opening,
            body_paragraphs=body_paragraphs,
            closing_paragraph=closing,
            call_to_action=call_to_action,
            full_letter=full_letter
        )

    def _determine_template_style(self, job_data: Dict) -> str:
        """Automatically determine the best template style based on job content"""
        job_text = f"{job_data['title']} {job_data.get('job_description', '')} {job_data.get('requirements', '')}".lower()

        # Score each template style
        style_scores = {
            'executive_leadership': 0,
            'ai_innovation': 0,
            'design_leadership': 0,
            'consulting': 0
        }

        # Executive keywords
        exec_keywords = ['chief', 'cto', 'cdo', 'director', 'head of', 'executive', 'strategic', 'leadership']
        style_scores['executive_leadership'] = sum(1 for keyword in exec_keywords if keyword in job_text)

        # AI keywords
        ai_keywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'automation', 'intelligent']
        style_scores['ai_innovation'] = sum(1 for keyword in ai_keywords if keyword in job_text)

        # Design keywords
        design_keywords = ['design', 'ux', 'ui', 'user experience', 'design thinking', 'design system']
        style_scores['design_leadership'] = sum(1 for keyword in design_keywords if keyword in job_text)

        # Consulting keywords
        consulting_keywords = ['consulting', 'consultant', 'transformation', 'process', 'optimization', 'strategy']
        style_scores['consulting'] = sum(1 for keyword in consulting_keywords if keyword in job_text)

        # Return highest scoring style
        return max(style_scores.items(), key=lambda x: x[1])[0]

    def _generate_opening(self, job_data: Dict, template_style: str) -> str:
        """Generate opening paragraph"""
        template = self.templates[template_style]
        opening_options = template['openings']

        # Select best opening based on job characteristics
        selected_opening = opening_options[0]  # Default to first option

        # Customize with job details
        return selected_opening.format(
            position=job_data['title'],
            company=job_data['company_name']
        )

    def _generate_body_paragraphs(self, job_data: Dict, template_style: str) -> List[str]:
        """Generate body paragraphs with relevant achievements"""
        paragraphs = []

        # Paragraph 1: Core competency match
        template = self.templates[template_style]
        focus_areas = template['body_focus']

        para1 = f"In my current role as Chief Design & Technical Officer at Insyteful Limited, I have demonstrated expertise in {focus_areas[0]} and {focus_areas[1]}. "

        # Add relevant quantified achievement
        if template_style == 'executive_leadership':
            para1 += "My leadership of the $2 billion Customer Service Hub transformation at Westpac exemplifies my ability to drive enterprise-wide change and deliver measurable results."
        elif template_style == 'ai_innovation':
            para1 += "I developed the industry-first triple-AI collaborative system achieving 10x faster visual iteration, demonstrating my capability to pioneer breakthrough AI methodologies."
        elif template_style == 'design_leadership':
            para1 += "I established comprehensive design practices from ground up at Greenstone Financial Services, creating systematic approaches to AI-UX integration with 100% automated test coverage."
        else:  # consulting
            para1 += "At ANZ Bank, I redesigned the Business Services Unit operational structure, delivering a 20% increase in decision-making efficiency through strategic process optimization."

        paragraphs.append(para1)

        # Paragraph 2: Specific value proposition
        para2 = f"What sets me apart is my proven ability to {focus_areas[2]} and {focus_areas[3]}. "

        # Add innovation example
        innovation_match = self._select_relevant_achievement(job_data, 'innovation')
        para2 += f"{innovation_match} This demonstrates my commitment to pushing boundaries while delivering practical business outcomes."

        paragraphs.append(para2)

        # Paragraph 3: Industry/company fit (if relevant)
        if job_data.get('industry'):
            industry = job_data['industry']
            if industry in self.jason_profile['industry_expertise']:
                para3 = f"My {self.jason_profile['industry_expertise'][industry]} makes me particularly well-suited for {job_data['company_name']}. "
                para3 += f"I understand the unique challenges and opportunities in {industry.lower()}, having successfully navigated complex stakeholder environments and regulatory requirements."
                paragraphs.append(para3)

        return paragraphs

    def _generate_closing(self, job_data: Dict) -> str:
        """Generate closing paragraph"""
        template = self.closing_templates[0]  # Select based on job characteristics

        return template.format(
            key_strength=self.jason_profile['core_strengths'][0],
            company=job_data['company_name'],
            relevant_area='AI-powered design innovation',
            business_outcome='digital transformation and competitive advantage'
        )

    def _generate_call_to_action(self, job_data: Dict) -> str:
        """Generate call to action"""
        return f"I would welcome the opportunity to discuss how my experience can contribute to {job_data['company_name']}'s continued success. Thank you for considering my application, and I look forward to hearing from you."

    def _select_relevant_achievement(self, job_data: Dict, category: str) -> str:
        """Select most relevant achievement based on job requirements"""
        achievements = self.achievements_bank[f'{category}_examples']

        # Simple keyword matching for now - could be enhanced with more sophisticated NLP
        job_text = f"{job_data.get('job_description', '')} {job_data.get('requirements', '')}".lower()

        best_match = achievements[0]  # Default
        best_score = 0

        for achievement in achievements:
            score = 0
            # Count keyword matches
            for word in achievement.lower().split():
                if word in job_text:
                    score += 1

            if score > best_score:
                best_score = score
                best_match = achievement

        return best_match

    def _assemble_full_letter(self, job_data: Dict, opening: str, body_paragraphs: List[str], closing: str, cta: str) -> str:
        """Assemble the complete cover letter"""
        date_str = datetime.now().strftime("%B %d, %Y")

        # Header
        header = f"""Jason Davey
31 Station Street, Mullumbimby, NSW 2482
Phone: +61 412 659 697
Email: jason@pixelfication.com
LinkedIn: linkedin.com/in/jasdavey

{date_str}

{job_data.get('contact_person', 'Hiring Manager')}
{job_data['company_name']}
{job_data.get('location', '')}

Dear {job_data.get('contact_person', 'Hiring Manager')},

"""

        # Body
        body = opening + "\n\n"
        for paragraph in body_paragraphs:
            body += paragraph + "\n\n"
        body += closing + "\n\n"
        body += cta + "\n\n"

        # Footer
        footer = """Sincerely,

Jason Davey

---
Attachments: Resume, Portfolio samples
"""

        return header + body + footer

    def save_cover_letter(self, job_id: int, content: CoverLetterContent, template_style: str) -> str:
        """Save cover letter to file and database"""
        with sqlite3.connect(self.db_path) as conn:
            job_data = self._get_job_data(conn, job_id)

            # Generate filename
            company_safe = re.sub(r'[^a-zA-Z0-9]', '_', job_data['company_name'])
            position_safe = re.sub(r'[^a-zA-Z0-9]', '_', job_data['title'])
            filename = f"CoverLetter_{company_safe}_{position_safe}_{datetime.now().strftime('%Y%m%d')}.md"
            filepath = f"/Users/jd/Projects/portfolio/job-tracking-system/generated_docs/{filename}"

            # Save to file
            with open(filepath, 'w') as f:
                f.write(content.full_letter)

            # Save to database
            conn.execute("""
                INSERT INTO generated_documents
                (job_id, document_type, template_used, content, file_path, generation_method, customizations)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                job_id,
                'cover_letter',
                template_style,
                content.full_letter,
                filepath,
                'ai_generated',
                json.dumps({
                    'opening_style': template_style,
                    'body_paragraphs_count': len(content.body_paragraphs),
                    'auto_selected_template': True
                })
            ))

            # Log activity
            conn.execute("""
                INSERT INTO activity_log
                (activity_type, entity_type, entity_id, description)
                VALUES (?, ?, ?, ?)
            """, (
                'cover_letter_generated',
                'job',
                job_id,
                f"AI-generated cover letter using {template_style} template"
            ))

        return filepath

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

# Usage example:
if __name__ == "__main__":
    generator = CoverLetterGenerator("job_tracker.db")
    # cover_letter = generator.generate_cover_letter(1)
    # filepath = generator.save_cover_letter(1, cover_letter, 'executive_leadership')
    # print(f"Cover letter saved to: {filepath}")