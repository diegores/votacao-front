import { describe, it, expect } from 'vitest'
import { render, screen } from './test/test-utils'
import App from './App'

describe('App Component', () => {
  it('renders the navigation menu', () => {
    render(<App />)
    
    expect(screen.getByText('Sistema de Votação')).toBeInTheDocument()
    expect(screen.getByText('📋 Agendas')).toBeInTheDocument()
    expect(screen.getByText('➕ Criar Pauta')).toBeInTheDocument()
    expect(screen.getByText('👥 Cadastrar Membros')).toBeInTheDocument()
  })

  it('renders with proper layout structure', () => {
    render(<App />)
    
    const nav = screen.getByRole('navigation')
    const main = screen.getByRole('main')
    
    expect(nav).toBeInTheDocument()
    expect(main).toBeInTheDocument()
  })

  it('applies correct CSS classes for responsive design', () => {
    const { container } = render(<App />)
    
    const rootDiv = container.firstChild as Element
    expect(rootDiv).toHaveClass('min-h-screen', 'bg-gray-50')
  })

  it('renders navigation links with correct hrefs', () => {
    render(<App />)
    
    const agendasLink = screen.getByRole('link', { name: /📋 Agendas/ })
    const createLink = screen.getByRole('link', { name: /➕ Criar Pauta/ })
    const membersLink = screen.getByRole('link', { name: /👥 Cadastrar Membros/ })
    
    expect(agendasLink).toHaveAttribute('href', '/')
    expect(createLink).toHaveAttribute('href', '/create')
    expect(membersLink).toHaveAttribute('href', '/createMembers')
  })
})