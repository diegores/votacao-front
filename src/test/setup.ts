import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock global fetch for tests
Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn(),
  writable: true
})

// Mock window.alert for tests
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true
})

// Reset all mocks after each test
afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})