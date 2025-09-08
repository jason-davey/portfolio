import React from 'react'
import { Portfolio } from './components/Portfolio'

const sampleProjects = [
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

function App() {
  return (
    <div className="App">
      <Portfolio projects={sampleProjects} />
    </div>
  )
}

export default App