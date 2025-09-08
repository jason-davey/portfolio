import { AdventurePath } from '../types/adventure'

export const adventurePaths: AdventurePath[] = [
  {
    id: 'strategic',
    title: 'Strategic Pathways',
    subtitle: 'See how I shape business futures',
    icon: '🎯',
    description: 'Explore my approach to strategic business design, organizational transformation, and long-term vision setting.',
    color: '#4F46E5',
    gradient: 'from-indigo-600 to-purple-600'
  },
  {
    id: 'build-ship',
    title: 'Build & Ship',
    subtitle: 'Explore products I\'ve designed and launched',
    icon: '🛠️',
    description: 'Dive into websites, applications, and digital products I\'ve crafted from concept to launch.',
    color: '#059669',
    gradient: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'conceptual',
    title: 'Conceptual Horizons',
    subtitle: 'Discover my future-thinking and innovation work',
    icon: '🧠',
    description: 'Journey through experimental concepts, research projects, and visionary design explorations.',
    color: '#DC2626',
    gradient: 'from-red-600 to-pink-600'
  },
  {
    id: 'team-alchemy',
    title: 'Team Alchemy',
    subtitle: 'Learn how I build and scale design organizations',
    icon: '👥',
    description: 'Discover my approach to building high-performing design teams, processes, and organizational culture.',
    color: '#7C3AED',
    gradient: 'from-violet-600 to-purple-600'
  },
  {
    id: 'growth-catalyst',
    title: 'Growth Catalyst',
    subtitle: 'Experience my mentoring and development approach',
    icon: '🌱',
    description: 'Explore how I nurture design talent, facilitate growth, and create learning environments.',
    color: '#EA580C',
    gradient: 'from-orange-600 to-amber-600'
  }
]

// Sample story connections showing how paths intersect
export const pathIntersections = {
  strategic_to_team: 'How strategic thinking shapes team building',
  conceptual_to_build: 'When future concepts become real products',
  team_to_growth: 'Building teams while growing individuals',
  strategic_to_conceptual: 'Strategic vision meets innovative thinking',
  build_to_growth: 'Learning through shipping products'
}