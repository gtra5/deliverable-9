import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

class MockNotification {
  constructor(title, options) {
    this.title = title;
    this.options = options;
    MockNotification.instances.push(this);
  }
}
MockNotification.permission = "granted";
MockNotification.requestPermission = vi.fn(async () => "granted");
MockNotification.instances = [];
globalThis.Notification = MockNotification;
