import "@testing-library/jest-dom";

// Polyfill browser APIs missing in jsdom (needed by Radix UI)
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof matchMedia;
}

if (typeof globalThis.getComputedStyle === "undefined") {
  globalThis.getComputedStyle = (() => ({})) as unknown as typeof getComputedStyle;
}
