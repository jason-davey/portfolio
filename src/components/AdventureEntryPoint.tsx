import React, { useState } from 'react'
import { adventurePaths } from '../data/adventurePaths'
import { AdventurePath } from '../types/adventure'

interface AdventureEntryPointProps {
  onPathSelected: (pathId: string) => void
}

export const AdventureEntryPoint: React.FC<AdventureEntryPointProps> = ({ onPathSelected }) => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  return (
    <div className="adventure-entry" data-testid="adventure-entry">
      <div className="hero-section">
        <h1 className="title">Choose Your Adventure</h1>
        <p className="subtitle">
          Explore my design leadership journey through interactive storytelling. 
          Each path reveals different facets of how I approach problems, build solutions, and grow teams.
        </p>
        <div className="narrator-hint">
          <span className="ai-indicator">🤖</span>
          <em>Your AI guide will adapt the story based on your choices</em>
        </div>
      </div>

      <div className="pathways-grid">
        {adventurePaths.map((path) => (
          <PathwayCard
            key={path.id}
            path={path}
            isHovered={hoveredPath === path.id}
            onHover={() => setHoveredPath(path.id)}
            onLeave={() => setHoveredPath(null)}
            onClick={() => onPathSelected(path.id)}
          />
        ))}
      </div>

      <div className="journey-stats">
        <div className="stat">
          <span className="number">15+</span>
          <span className="label">Years in Design</span>
        </div>
        <div className="stat">
          <span className="number">50+</span>
          <span className="label">Projects Delivered</span>
        </div>
        <div className="stat">
          <span className="number">∞</span>
          <span className="label">Stories to Explore</span>
        </div>
      </div>
    </div>
  )
}

interface PathwayCardProps {
  path: AdventurePath
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
  onClick: () => void
}

const PathwayCard: React.FC<PathwayCardProps> = ({ 
  path, 
  isHovered, 
  onHover, 
  onLeave, 
  onClick 
}) => {
  return (
    <div
      className={`pathway-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      data-testid={`pathway-${path.id}`}
      style={{
        '--path-color': path.color,
        '--path-gradient': path.gradient
      } as React.CSSProperties}
    >
      <div className="card-header">
        <span className="icon">{path.icon}</span>
        <h3 className="path-title">{path.title}</h3>
      </div>
      
      <p className="path-subtitle">{path.subtitle}</p>
      <p className="path-description">{path.description}</p>
      
      <div className="card-footer">
        <span className="cta">Explore this path →</span>
        {isHovered && (
          <div className="preview-stats">
            <span>5-8 interactive stories</span>
          </div>
        )}
      </div>
    </div>
  )
}