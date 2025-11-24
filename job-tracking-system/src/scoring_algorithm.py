"""
AI-Powered Job Opportunity Scoring Algorithm
Analyzes job postings and scores compatibility against Jason's profile
"""

import re
import sqlite3
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import json
from datetime import datetime

@dataclass
class SkillMatch:
    skill: str
    proficiency: int
    years_experience: int
    match_score: int
    importance_weight: float

@dataclass
class JobScore:
    total_score: int
    breakdown: Dict[str, int]
    missing_requirements: List[str]
    strong_matches: List[str]
    recommendations: List[str]

class JobScoringAlgorithm:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_jason_profile()

    def init_jason_profile(self):
        """Initialize Jason's profile data for scoring"""
        self.jason_profile = {
            'executive_leadership': {
                'skills': [
                    ('Chief Design Officer', 10, 5, ['CDO', 'Chief Design', 'Head of Design']),
                    ('Chief Technology Officer', 8, 2, ['CTO', 'Chief Technology', 'Technical Director']),
                    ('Strategic Planning', 10, 13, ['Strategy', 'Strategic', 'Planning', 'Vision']),
                    ('P&L Management', 9, 8, ['P&L', 'Budget', 'Financial', 'Revenue']),
                    ('Digital Transformation', 10, 13, ['Digital Transform', 'Transformation', 'Change']),
                    ('Team Leadership', 10, 13, ['Team Lead', 'Management', 'Leadership', 'Mentor']),
                ],
                'weight': 0.25
            },
            'ai_technology': {
                'skills': [
                    ('AI/ML Integration', 9, 2, ['AI', 'Machine Learning', 'ML', 'Artificial Intelligence']),
                    ('AWS Bedrock', 8, 1, ['AWS', 'Bedrock', 'Claude', 'Amazon']),
                    ('Multi-Agent Systems', 9, 1, ['Multi-agent', 'Agent', 'LangChain']),
                    ('Solution Architecture', 10, 8, ['Solution Architect', 'Architecture', 'System Design']),
                    ('Enterprise Architecture', 9, 6, ['Enterprise Arch', 'TOGAF', 'EA']),
                    ('Natural Language Processing', 8, 2, ['NLP', 'Natural Language', 'Text Processing']),
                ],
                'weight': 0.30
            },
            'design_innovation': {
                'skills': [
                    ('Multi-Modal Design', 10, 1, ['Multi-modal', 'Design Innovation', 'Design Framework']),
                    ('AI+UX Integration', 10, 1, ['AI UX', 'AI Design', 'UX AI']),
                    ('Design Strategy', 10, 13, ['Design Strategy', 'Design Vision', 'Design Lead']),
                    ('User Experience Design', 10, 13, ['UX', 'User Experience', 'UX Design']),
                    ('Human-Centered Design', 10, 13, ['Human-centered', 'HCD', 'User-centered']),
                    ('Design Systems', 9, 8, ['Design System', 'Design Library', 'Component']),
                    ('Design Operations', 8, 5, ['DesignOps', 'Design Ops', 'Design Operation']),
                ],
                'weight': 0.25
            },
            'consulting_business': {
                'skills': [
                    ('Management Consulting', 9, 8, ['Management Consult', 'Strategy Consult', 'Consulting']),
                    ('Business Analysis', 9, 13, ['Business Analysis', 'Process', 'Analysis']),
                    ('Process Optimization', 9, 13, ['Process Optim', 'Efficiency', 'Optimization']),
                    ('ROI Analysis', 8, 10, ['ROI', 'Return on Investment', 'Business Case']),
                    ('Strategic Roadmaps', 9, 10, ['Roadmap', 'Strategy', 'Planning']),
                    ('Stakeholder Management', 10, 13, ['Stakeholder', 'Stakeholder Management']),
                ],
                'weight': 0.20
            }
        }

        # Industry expertise
        self.industry_experience = {
            'Financial Services': 10,  # Banking, Insurance, Fintech
            'Technology': 9,           # Software, SaaS, Tech
            'Consulting': 10,          # Management Consulting
            'Education': 8,            # Learning & Development
            'Telecommunications': 8,   # Previous experience
            'Government': 7,           # Security clearance
        }

        # Role level preferences (higher score = better fit)
        self.role_preferences = {
            'Chief': 10,      # C-level roles
            'Head of': 10,    # Department head
            'Director': 9,    # Director level
            'Principal': 8,   # Principal roles
            'Senior': 7,      # Senior roles
            'Lead': 7,        # Lead roles
        }

    def score_job(self, job_id: int) -> JobScore:
        """Score a job opportunity against Jason's profile"""
        with sqlite3.connect(self.db_path) as conn:
            job_data = self._get_job_data(conn, job_id)
            if not job_data:
                raise ValueError(f"Job {job_id} not found")

        # Parse job requirements
        job_text = f"{job_data['title']} {job_data['job_description']} {job_data['requirements']}"

        # Score different categories
        scores = {}
        skill_matches = []
        missing_requirements = []

        # 1. Executive Leadership Score (25%)
        exec_score, exec_matches = self._score_category(
            job_text, self.jason_profile['executive_leadership']
        )
        scores['executive_leadership'] = int(exec_score * 100)
        skill_matches.extend(exec_matches)

        # 2. AI/Technology Score (30%)
        tech_score, tech_matches = self._score_category(
            job_text, self.jason_profile['ai_technology']
        )
        scores['ai_technology'] = int(tech_score * 100)
        skill_matches.extend(tech_matches)

        # 3. Design Innovation Score (25%)
        design_score, design_matches = self._score_category(
            job_text, self.jason_profile['design_innovation']
        )
        scores['design_innovation'] = int(design_score * 100)
        skill_matches.extend(design_matches)

        # 4. Consulting/Business Score (20%)
        business_score, business_matches = self._score_category(
            job_text, self.jason_profile['consulting_business']
        )
        scores['consulting_business'] = int(business_score * 100)
        skill_matches.extend(business_matches)

        # 5. Industry Experience Bonus
        industry_score = self._score_industry(job_data.get('industry', ''))
        scores['industry_fit'] = industry_score

        # 6. Role Level Fit
        role_level_score = self._score_role_level(job_data['title'])
        scores['role_level'] = role_level_score

        # 7. Location/Remote Score
        location_score = self._score_location(job_data.get('location', ''), job_data.get('remote_option', ''))
        scores['location_fit'] = location_score

        # Calculate weighted total score
        total_score = (
            exec_score * self.jason_profile['executive_leadership']['weight'] * 100 +
            tech_score * self.jason_profile['ai_technology']['weight'] * 100 +
            design_score * self.jason_profile['design_innovation']['weight'] * 100 +
            business_score * self.jason_profile['consulting_business']['weight'] * 100 +
            (industry_score / 10) * 0.1 * 100 +  # 10% weight
            (role_level_score / 10) * 0.1 * 100 +  # 10% weight
            (location_score / 10) * 0.05 * 100     # 5% weight
        )

        # Generate recommendations
        recommendations = self._generate_recommendations(scores, skill_matches, job_data)

        # Identify strong matches and missing requirements
        strong_matches = [m.skill for m in skill_matches if m.match_score >= 80]
        missing_requirements = self._identify_missing_requirements(job_text, skill_matches)

        return JobScore(
            total_score=min(int(total_score), 100),
            breakdown=scores,
            missing_requirements=missing_requirements,
            strong_matches=strong_matches,
            recommendations=recommendations
        )

    def _score_category(self, job_text: str, category: Dict) -> Tuple[float, List[SkillMatch]]:
        """Score a specific skill category"""
        total_score = 0
        matches_found = 0
        skill_matches = []

        for skill_name, proficiency, years, keywords in category['skills']:
            match_score = 0

            # Check for keyword matches
            for keyword in keywords:
                if re.search(keyword, job_text, re.IGNORECASE):
                    # Higher proficiency and experience = higher match score
                    match_score = min(proficiency * 10 + years * 2, 100)
                    break

            if match_score > 0:
                matches_found += 1
                total_score += match_score
                skill_matches.append(SkillMatch(
                    skill=skill_name,
                    proficiency=proficiency,
                    years_experience=years,
                    match_score=match_score,
                    importance_weight=1.0
                ))

        # Average score for this category
        category_score = total_score / (len(category['skills']) * 100) if category['skills'] else 0
        return category_score, skill_matches

    def _score_industry(self, industry: str) -> int:
        """Score industry fit"""
        if not industry:
            return 50  # neutral score

        for exp_industry, score in self.industry_experience.items():
            if exp_industry.lower() in industry.lower():
                return score * 10

        return 50  # neutral for unknown industries

    def _score_role_level(self, title: str) -> int:
        """Score role level appropriateness"""
        for level, score in self.role_preferences.items():
            if level.lower() in title.lower():
                return score * 10

        return 60  # default score for other roles

    def _score_location(self, location: str, remote_option: str) -> int:
        """Score location and remote work compatibility"""
        # Jason is in NSW, Australia and prefers hybrid/remote
        score = 70  # base score

        if remote_option:
            if 'remote' in remote_option.lower():
                score += 20
            elif 'hybrid' in remote_option.lower():
                score += 15

        if location:
            if any(loc in location.lower() for loc in ['nsw', 'sydney', 'australia', 'apac']):
                score += 10

        return min(score, 100)

    def _generate_recommendations(self, scores: Dict[str, int], matches: List[SkillMatch], job_data: Dict) -> List[str]:
        """Generate application recommendations based on scores"""
        recommendations = []

        total = scores.get('executive_leadership', 0) + scores.get('ai_technology', 0) + \
                scores.get('design_innovation', 0) + scores.get('consulting_business', 0)
        avg_score = total / 4

        if avg_score >= 80:
            recommendations.append("🎯 HIGHLY RECOMMENDED: Excellent fit across all categories")
            recommendations.append("📝 Emphasize AI+UX innovation leadership in application")
        elif avg_score >= 70:
            recommendations.append("✅ STRONG CANDIDATE: Good overall fit")
            recommendations.append("💡 Highlight specific experience in weaker categories")
        elif avg_score >= 60:
            recommendations.append("🤔 CONSIDER: Moderate fit with some gaps")
            recommendations.append("🔧 Address missing requirements in cover letter")
        else:
            recommendations.append("❌ SKIP: Poor fit for current profile")

        # Specific recommendations
        if scores.get('ai_technology', 0) >= 80:
            recommendations.append("🤖 Lead with AI integration achievements")

        if scores.get('design_innovation', 0) >= 80:
            recommendations.append("🎨 Emphasize multi-modal design framework")

        if scores.get('executive_leadership', 0) >= 80:
            recommendations.append("👑 Position as C-level ready executive")

        return recommendations

    def _identify_missing_requirements(self, job_text: str, matches: List[SkillMatch]) -> List[str]:
        """Identify requirements mentioned in job but not in Jason's profile"""
        # This would be more sophisticated with NLP, but for now we'll use keyword analysis
        common_requirements = [
            'MBA', 'PhD', 'Certification', 'Agile Coach', 'Scrum Master',
            'Product Management', 'Data Science', 'DevOps', 'Cloud Native'
        ]

        missing = []
        matched_skills = {m.skill.lower() for m in matches}

        for req in common_requirements:
            if req.lower() in job_text.lower() and req.lower() not in matched_skills:
                missing.append(req)

        return missing

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

    def update_job_score(self, job_id: int) -> JobScore:
        """Update job score in database"""
        score_result = self.score_job(job_id)

        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                UPDATE job_opportunities
                SET ai_score = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (score_result.total_score, job_id))

            # Store detailed scoring breakdown
            conn.execute("""
                INSERT OR REPLACE INTO activity_log
                (activity_type, entity_type, entity_id, description, metadata)
                VALUES (?, ?, ?, ?, ?)
            """, (
                'job_scored',
                'job',
                job_id,
                f"AI scoring completed with score {score_result.total_score}",
                json.dumps({
                    'breakdown': score_result.breakdown,
                    'strong_matches': score_result.strong_matches,
                    'missing_requirements': score_result.missing_requirements,
                    'recommendations': score_result.recommendations
                })
            ))

        return score_result

# Usage example:
if __name__ == "__main__":
    scorer = JobScoringAlgorithm("job_tracker.db")
    # score = scorer.score_job(1)
    # print(f"Job Score: {score.total_score}")
    # print(f"Breakdown: {score.breakdown}")
    # print(f"Recommendations: {score.recommendations}")