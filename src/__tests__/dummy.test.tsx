import React from 'react'
import { render, screen } from '@testing-library/react'

describe('Jest Testing Environment Verification', () => {
  it('should render a dummy component and verify the JSDOM environment', () => {
    render(<div data-testid="dummy-element">Hello, MeeplePrecios!</div>)
    const element = screen.getByTestId('dummy-element')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello, MeeplePrecios!')
  })
})
