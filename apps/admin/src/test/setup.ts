import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

function installMatchMediaMock() {
  const mock = vi.fn().mockImplementation((query: string) => {
    const mediaQueryList = {
      addEventListener: vi.fn((_event: string, listener?: (event: { matches: boolean; media: string }) => void) => {
        listener?.({ matches: false, media: query });
      }),
      addListener: vi.fn((listener?: (event: { matches: boolean; media: string }) => void) => {
        listener?.({ matches: false, media: query });
      }),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    };

    return mediaQueryList;
  });

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: mock,
  });

  Object.defineProperty(globalThis, 'matchMedia', {
    configurable: true,
    writable: true,
    value: mock.bind(window),
  });
}

function installGetComputedStyleMock() {
  const original = window.getComputedStyle.bind(window);
  const mock = vi.fn((element: Element) => original(element));

  Object.defineProperty(window, 'getComputedStyle', {
    configurable: true,
    writable: true,
    value: mock,
  });

  Object.defineProperty(globalThis, 'getComputedStyle', {
    configurable: true,
    writable: true,
    value: mock,
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  installMatchMediaMock();
  installGetComputedStyleMock();
});

installMatchMediaMock();
installGetComputedStyleMock();

if (!globalThis.ResizeObserver) {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
}
