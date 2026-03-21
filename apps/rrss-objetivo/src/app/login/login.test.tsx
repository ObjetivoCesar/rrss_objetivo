import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import LoginPage from './page'

test('Renderiza el formulario de login correctamente', () => {
  render(<LoginPage />)
  
  expect(screen.getByText(/email corporativo/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/tu@empresa.com/i)).toBeInTheDocument()
  expect(screen.getByText(/entrar al sistema/i)).toBeInTheDocument()
})

test('Actualiza los campos de input al escribir', () => {
  render(<LoginPage />)
  
  const emailInput = screen.getByPlaceholderText(/tu@empresa.com/i) as HTMLInputElement
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
  expect(emailInput.value).toBe('test@example.com')
})
