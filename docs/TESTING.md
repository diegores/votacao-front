# Testing Documentation

## Overview

This project includes comprehensive unit tests for all components and services using Vitest and React Testing Library.

## Test Structure

### Testing Framework
- **Vitest**: Modern test runner with TypeScript support
- **React Testing Library**: Component testing utilities
- **JSDOM**: DOM environment for tests
- **User Event**: User interaction simulation

### Test Files Location
```
src/
├── test/
│   ├── setup.ts          # Test setup and configuration
│   ├── test-utils.tsx    # Custom render utilities
│   └── mocks.ts          # Mock data and utilities
├── components/
│   ├── *.test.tsx        # Component tests
└── services/
    └── api.test.ts       # API service tests
```

## Test Categories

### 1. Component Tests

#### App Component (`App.test.tsx`)
- Navigation menu rendering
- Layout structure
- Responsive design classes
- Route link validation

#### AgendaList Component (`AgendaList.test.tsx`)
- Loading states
- Empty state handling
- Agenda rendering with data
- Status indicators (open/closed)
- Session management actions
- Navigation between pages
- Error handling
- Date formatting

#### CreateAgenda Component (`CreateAgenda.test.tsx`)
- Form validation
- Character counters
- Success/error handling
- Loading states
- Navigation flows
- Input sanitization

#### VotingSession Component (`VotingSession.test.tsx`)
- Session state handling
- Member selection
- Vote submission (SIM/NAO)
- Duplicate vote prevention
- Error handling
- Real-time vote display

#### VotingResult Component (`VotingResult.test.tsx`)
- Results calculation
- Progress bar visualization
- Vote status determination
- Historical vote display
- Navigation controls

#### CreateMember Component (`CreateMember.test.tsx`)
- CPF formatting and validation
- Form validation
- Character limits
- Success/error flows
- Input sanitization

### 2. Service Tests

#### API Service (`api.test.ts`)
- HTTP method verification
- Endpoint URL validation
- Request/response handling
- Error propagation
- Data serialization

## Test Utilities

### Mock Data (`mocks.ts`)
- Sample agendas (open/closed)
- Member data
- Vote records
- API response formatters

### Custom Render (`test-utils.tsx`)
- Router provider wrapper
- Simplified component testing

### Setup Configuration (`setup.ts`)
- Global mocks
- Test environment configuration
- Cleanup utilities

## Running Tests

### Commands
```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:ui       # Run with UI interface
npm run test:coverage # Run with coverage report
```

### Test Patterns
```bash
# Run specific test file
npm run test:run src/components/App.test.tsx

# Run tests matching pattern
npm run test:run --grep "renders"

# Run tests for specific component
npm run test:run AgendaList
```

## Test Coverage Goals

### Component Coverage
- ✅ Rendering validation
- ✅ User interaction testing
- ✅ State management verification
- ✅ Error boundary testing
- ✅ Loading state validation

### Integration Coverage
- ✅ API integration
- ✅ Navigation flows
- ✅ Form submissions
- ✅ Data persistence
- ✅ Error propagation

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Clear test structure
2. **User-centric**: Test from user perspective
3. **Isolation**: Each test is independent
4. **Descriptive**: Clear test names and descriptions
5. **Comprehensive**: Cover happy path and edge cases

### Mock Strategy
1. **External APIs**: Always mocked
2. **Navigation**: Mocked for isolation
3. **Browser APIs**: Mocked for consistency
4. **User Events**: Simulated realistically

### Assertion Strategy
1. **Accessibility**: Use semantic queries
2. **Content**: Test visible user content
3. **Behavior**: Verify expected interactions
4. **State**: Validate component state changes

## Common Test Patterns

### Component Rendering
```tsx
it('renders component correctly', () => {
  render(<Component />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### User Interactions
```tsx
it('handles user click', async () => {
  const user = userEvent.setup()
  render(<Component />)
  await user.click(screen.getByRole('button'))
  expect(mockFunction).toHaveBeenCalled()
})
```

### Async Operations
```tsx
it('handles async loading', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

### Form Validation
```tsx
it('validates form input', async () => {
  const user = userEvent.setup()
  render(<FormComponent />)
  await user.click(screen.getByRole('button', { name: /submit/ }))
  expect(screen.getByText('Required field')).toBeInTheDocument()
})
```

## Debugging Tests

### Common Issues
1. **Timing**: Use `waitFor` for async operations
2. **User Events**: Use `userEvent.setup()` for v14+
3. **Mocks**: Ensure proper mock cleanup
4. **DOM Queries**: Use appropriate queries for elements

### Debug Tools
```tsx
import { screen } from '@testing-library/react'

// Debug current DOM state
screen.debug()

// Find available queries
screen.logTestingPlaygroundURL()
```

## Continuous Integration

### Test Requirements
- All tests must pass before merge
- Minimum coverage thresholds
- No test timeouts or flaky tests
- Performance within acceptable limits

### Quality Gates
- ✅ Unit test coverage > 80%
- ✅ Component test coverage > 90%
- ✅ Integration test coverage > 70%
- ✅ No critical bugs in test suite

## Future Improvements

### Planned Enhancements
1. **E2E Testing**: Add Playwright/Cypress tests
2. **Visual Testing**: Add screenshot regression tests
3. **Performance Testing**: Add rendering performance tests
4. **Accessibility Testing**: Enhanced a11y validation

### Test Infrastructure
1. **Parallel Execution**: Optimize test runner performance
2. **Smart Retries**: Handle flaky test scenarios
3. **Test Data Management**: Improve mock data organization
4. **Reporting**: Enhanced test result visualization

---

This testing suite ensures reliable, maintainable code and provides confidence in the voting system's functionality across all user scenarios.