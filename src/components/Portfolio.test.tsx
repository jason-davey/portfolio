import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Portfolio } from './Portfolio'

const mockProjects = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'Full-stack web application with Supabase backend',
    technologies: ['React', 'TypeScript', 'Supabase'],
    featured: true
  },
  {
    id: '2',
    title: 'Mobile Weather App',
    description: 'React Native app with real-time weather data',
    technologies: ['React Native', 'JavaScript', 'API'],
    featured: false
  },
  {
    id: '3',
    title: 'AI Chatbot',
    description: 'Voiceflow-powered customer service bot',
    technologies: ['Voiceflow', 'JavaScript', 'AI'],
    featured: true
  }
]

describe('Portfolio Component', () => {
  it('renders portfolio title', () => {
    render(<Portfolio projects={mockProjects} />)
    expect(screen.getByText('My Portfolio')).toBeInTheDocument()
  })

  it('displays all projects when showFeaturedOnly is false', () => {
    render(<Portfolio projects={mockProjects} showFeaturedOnly={false} />)
    
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument()
    expect(screen.getByText('Mobile Weather App')).toBeInTheDocument()
    expect(screen.getByText('AI Chatbot')).toBeInTheDocument()
  })

  it('displays only featured projects when showFeaturedOnly is true', () => {
    render(<Portfolio projects={mockProjects} showFeaturedOnly={true} />)
    
    expect(screen.getByText('E-commerce Platform')).toBeInTheDocument()
    expect(screen.getByText('AI Chatbot')).toBeInTheDocument()
    expect(screen.queryByText('Mobile Weather App')).not.toBeInTheDocument()
  })

  it('shows empty state when no projects are provided', () => {
    render(<Portfolio projects={[]} />)
    expect(screen.getByTestId('portfolio-empty')).toBeInTheDocument()
    expect(screen.getByText('No projects to display')).toBeInTheDocument()
  })

  it('shows empty state when no featured projects exist and showFeaturedOnly is true', () => {
    const nonFeaturedProjects = mockProjects.map(p => ({ ...p, featured: false }))
    render(<Portfolio projects={nonFeaturedProjects} showFeaturedOnly={true} />)
    
    expect(screen.getByTestId('portfolio-empty')).toBeInTheDocument()
  })

  it('displays project technologies', () => {
    render(<Portfolio projects={mockProjects} />)
    
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Supabase')).toBeInTheDocument()
    expect(screen.getByText('Voiceflow')).toBeInTheDocument()
  })

  it('shows featured badge for featured projects', () => {
    render(<Portfolio projects={mockProjects} />)
    
    const featuredBadges = screen.getAllByTestId('featured-badge')
    expect(featuredBadges).toHaveLength(2) // Two featured projects
  })

  it('renders project cards with correct test ids', () => {
    render(<Portfolio projects={mockProjects} />)
    
    expect(screen.getByTestId('project-1')).toBeInTheDocument()
    expect(screen.getByTestId('project-2')).toBeInTheDocument()
    expect(screen.getByTestId('project-3')).toBeInTheDocument()
  })

  it('handles undefined projects prop gracefully', () => {
    render(<Portfolio />)
    expect(screen.getByTestId('portfolio-empty')).toBeInTheDocument()
  })
})