// Global type augmentations for testing
declare global {
  // Extend globalThis for test mocks
  namespace globalThis {
    var fetch: any
  }
}

export {}