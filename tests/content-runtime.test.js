import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

let FlashDocContent;
let contentContext;

beforeAll(() => {
  const scriptPath = resolve(process.cwd(), 'content.js');
  const scriptSource = readFileSync(scriptPath, 'utf8');
  const context = {
    console: { log: () => {}, warn: () => {}, error: () => {} },
    window: {},
    document: {},
    chrome: {},
    setTimeout,
    clearTimeout,
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(scriptSource, context);
  FlashDocContent = context.FlashDocContent;
  contentContext = context;
});

beforeEach(() => {
  contentContext.chrome.runtime = {
    id: 'test-extension',
    sendMessage: vi.fn(),
    lastError: null,
  };
  global.chrome = contentContext.chrome;
});

describe('content runtime messaging', () => {
  const createInstance = () => {
    const instance = Object.create(FlashDocContent.prototype);
    instance.runtimeUnavailable = false;
    instance.isRuntimeAvailable = vi.fn(() => true);
    return instance;
  };

  it('retries transient connection errors before succeeding', async () => {
    const instance = createInstance();
    const responses = [
      { error: 'Could not establish connection. Receiving end does not exist.' },
      { response: { ok: true } },
    ];

    contentContext.chrome.runtime.sendMessage.mockImplementation((payload, callback) => {
      const current = responses.shift();
      if (current && current.error) {
        contentContext.chrome.runtime.lastError = { message: current.error };
        setTimeout(() => callback(undefined), 0);
      } else {
        contentContext.chrome.runtime.lastError = null;
        setTimeout(() => callback(current ? current.response : undefined), 0);
      }
    });

    const result = await instance.safeSendMessage({ action: 'ping' }, { retries: 2, delay: 0 });
    expect(result).toEqual({ ok: true });
    expect(contentContext.chrome.runtime.sendMessage).toHaveBeenCalledTimes(2);
  });

  it('fails after exhausting retries on connection errors', async () => {
    const instance = createInstance();

    contentContext.chrome.runtime.sendMessage.mockImplementation((payload, callback) => {
      contentContext.chrome.runtime.lastError = { message: 'Could not establish connection. Receiving end does not exist.' };
      setTimeout(() => callback(undefined), 0);
    });

    await expect(instance.safeSendMessage({ action: 'ping' }, { retries: 1, delay: 0 }))
      .rejects.toThrow(/Could not establish connection/);
    expect(contentContext.chrome.runtime.sendMessage).toHaveBeenCalledTimes(2);
  });
});
