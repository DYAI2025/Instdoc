import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const createEvent = () => {
  const handlers = [];
  return {
    handlers,
    addListener: vi.fn((handler) => {
      handlers.push(handler);
    }),
    removeListener: vi.fn(),
    hasListener: vi.fn((handler) => handlers.includes(handler)),
    trigger: (...args) => {
      handlers.forEach((handler) => handler(...args));
    },
  };
};

const createChromeStub = () => {
  const onInstalled = createEvent();
  const onMessage = createEvent();
  const onClicked = createEvent();
  const onCommand = createEvent();

  return {
    storage: {
      sync: {
        get: vi.fn(() => Promise.resolve({})),
      },
      local: {
        get: vi.fn(() => Promise.resolve({ stats: { totalFiles: 0 } })),
        set: vi.fn(() => Promise.resolve()),
      },
    },
    contextMenus: {
      removeAll: vi.fn((callback) => {
        callback?.();
      }),
      create: vi.fn(),
      onClicked,
    },
    commands: {
      onCommand,
    },
    runtime: {
      id: 'test-extension',
      onInstalled,
      onMessage,
      lastError: null,
    },
    tabs: {
      create: vi.fn(),
      query: vi.fn(() => Promise.resolve([])),
    },
    scripting: {
      executeScript: vi.fn(() => Promise.resolve([{ result: '' }])),
    },
    downloads: {
      download: vi.fn(() => Promise.resolve(1)),
    },
    notifications: {
      create: vi.fn(),
    },
  };
};

describe('service worker bootstrap', () => {
  let context;

  beforeEach(async () => {
    context = {
      console: { log: () => {}, warn: () => {}, error: () => {} },
      chrome: createChromeStub(),
      setTimeout,
      clearTimeout,
    };
    context.globalThis = context;

    const scriptSource = readFileSync(resolve(process.cwd(), 'service-worker.js'), 'utf8');
    vm.createContext(context);
    vm.runInContext(scriptSource, context);
    await flushPromises();
  });

  it('creates context menu entries during activation', () => {
    const { create } = context.chrome.contextMenus;
    expect(create).toHaveBeenCalled();
    const parentMenu = create.mock.calls.find((call) => call[0]?.id === 'instant-file-parent');
    expect(parentMenu).toBeTruthy();
    const childIds = create.mock.calls
      .filter((call) => call[0]?.parentId === 'instant-file-parent')
      .map((call) => call[0].id);
    expect(childIds).toContain('instant-auto');
  });

  it('opens the onboarding page on fresh install', () => {
    const { onInstalled } = context.chrome.runtime;
    onInstalled.trigger({ reason: 'install' });
    expect(context.chrome.tabs.create).toHaveBeenCalledWith({ url: 'options.html' });
  });

  it('responds to getStats requests from clients', async () => {
    const messageHandlers = context.chrome.runtime.onMessage.handlers;
    expect(messageHandlers.length).toBeGreaterThan(0);
    const sendResponse = vi.fn();
    messageHandlers[0]({ action: 'getStats' }, {}, sendResponse);
    await flushPromises();
    expect(sendResponse).toHaveBeenCalledWith({ stats: expect.objectContaining({ totalFiles: 0 }) });
  });
});
