import { describe, it, expect } from 'vitest';
import { MCPClient } from '../src/mcp-client.js';

describe('MCPClient', () => {
  it('initializes with no servers', () => {
    const client = new MCPClient();
    expect(client.getServerNames()).toEqual([]);
    expect(client.getAllTools()).toEqual([]);
  });

  it('getToolRegistrations returns empty array when no servers connected', () => {
    const client = new MCPClient();
    const registrations = client.getToolRegistrations();
    expect(registrations).toEqual([]);
  });

  it('disconnect removes server', () => {
    const client = new MCPClient();
    // Disconnect a non-existent server should not throw
    client.disconnect('non-existent');
    expect(client.getServerNames()).toEqual([]);
  });
});
