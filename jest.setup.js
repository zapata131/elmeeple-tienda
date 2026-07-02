import '@testing-library/jest-dom'
import React from 'react'

// Mock next/navigation globally
const mockPushGlobal = jest.fn()
const mockRefreshGlobal = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPushGlobal,
    refresh: mockRefreshGlobal,
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Polyfill Request, Response, Headers in JSDOM (needed for NextAuth and Jose)
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

if (typeof global.ReadableStream === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ReadableStream } = require('node:stream/web')
  global.ReadableStream = ReadableStream
}

if (typeof global.MessagePort === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MessagePort } = require('node:worker_threads')
  global.MessagePort = MessagePort
}

if (typeof global.Request === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Request, Response, Headers } = require('undici')
  global.Request = Request
  global.Response = Response
  global.Headers = Headers
}

// Mock next/dynamic globally to render dynamic components synchronously in Jest
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader) => {
    // Return a dummy component rendering synchronously
    const DynamicComponent = (props) => {
      return React.createElement('div', { 'data-testid': 'mock-dynamic-component', ...props })
    }
    DynamicComponent.displayName = 'DynamicComponent'
    return DynamicComponent
  },
}))

// Mock next-auth globally to prevent ESM import syntax issues with jose
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn().mockReturnValue({
    GET: jest.fn(),
    POST: jest.fn(),
  })
  return {
    __esModule: true,
    default: mockNextAuth,
    getServerSession: jest.fn().mockResolvedValue({
      user: {
        name: 'Test Merchant',
        email: 'merchant@example.com',
        role: 'partner'
      }
    })
  }
})

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Test Merchant',
        email: 'merchant@example.com',
        role: 'partner'
      }
    },
    status: 'authenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children
}))

// Polyfill window.matchMedia for JSDOM
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}
