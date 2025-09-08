import React from 'react'

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  featured: boolean
}

interface PortfolioProps {
  projects?: Project[]
  showFeaturedOnly?: boolean
}

export const Portfolio: React.FC<PortfolioProps> = ({ 
  projects = [], 
  showFeaturedOnly = false 
}) => {
  const displayedProjects = showFeaturedOnly 
    ? projects.filter(project => project.featured)
    : projects

  if (displayedProjects.length === 0) {
    return (
      <div className="portfolio-empty" data-testid="portfolio-empty">
        No projects to display
      </div>
    )
  }

  return (
    <div className="portfolio" data-testid="portfolio">
      <h1>My Portfolio</h1>
      <div className="projects-grid">
        {displayedProjects.map((project) => (
          <div 
            key={project.id} 
            className="project-card" 
            data-testid={`project-${project.id}`}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="technologies">
              {project.technologies.map((tech) => (
                <span key={tech} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
            {project.featured && (
              <span className="featured-badge" data-testid="featured-badge">
                Featured
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}