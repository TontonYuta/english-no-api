import { spawn, ChildProcess } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

interface TunnelStatus {
  active: boolean;
  url: string | null;
  remoteUrl: string | null;
  status: 'idle' | 'starting' | 'active' | 'error' | 'stopped';
  error: string | null;
  startedAt: string | null;
}

let tunnelProcess: ChildProcess | null = null;
let currentStatus: TunnelStatus = {
  active: false,
  url: null,
  remoteUrl: null,
  status: 'idle',
  error: null,
  startedAt: null,
};

/**
 * Locate cloudflared binary (checks local ./bin/cloudflared, then system PATH)
 */
export function getCloudflaredPath(): string {
  const localBin = path.resolve(process.cwd(), 'bin', 'cloudflared');
  if (fs.existsSync(localBin)) {
    return localBin;
  }
  return 'cloudflared';
}

/**
 * Get local LAN IPv4 addresses
 */
export function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (!netList) continue;

    for (const net of netList) {
      // Pick IPv4 and non-internal
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }

  return ips.length > 0 ? ips : ['127.0.0.1'];
}

/**
 * Start a Cloudflare quick tunnel pointing to target port
 */
export async function startCloudflareTunnel(port: number = 3000): Promise<TunnelStatus> {
  if (currentStatus.active && currentStatus.url) {
    return currentStatus;
  }

  // If previous process is still hanging, kill it first
  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
    } catch (_) {}
    tunnelProcess = null;
  }

  const cloudflaredBin = getCloudflaredPath();
  currentStatus = {
    active: false,
    url: null,
    remoteUrl: null,
    status: 'starting',
    error: null,
    startedAt: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        currentStatus.status = 'error';
        currentStatus.error = 'Tunnel initialization timed out after 30 seconds';
        resolve(currentStatus);
      }
    }, 30000);

    try {
      const proc = spawn(cloudflaredBin, ['tunnel', '--url', `http://127.0.0.1:${port}`], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      tunnelProcess = proc;

      const urlRegex = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

      const handleData = (chunk: Buffer) => {
        const text = chunk.toString();
        const match = text.match(urlRegex);

        if (match && !resolved) {
          clearTimeout(timeout);
          resolved = true;
          const url = match[0];
          currentStatus = {
            active: true,
            url,
            remoteUrl: `${url}/remote`,
            status: 'active',
            error: null,
            startedAt: new Date().toISOString(),
          };
          console.log(`[Cloudflare Tunnel] Secure public HTTPS URL: ${url}`);
          resolve(currentStatus);
        }
      };

      proc.stdout?.on('data', handleData);
      proc.stderr?.on('data', handleData);

      proc.on('error', (err) => {
        console.error('[Cloudflare Tunnel] Process error:', err.message);
        if (!resolved) {
          clearTimeout(timeout);
          resolved = true;
          currentStatus = {
            active: false,
            url: null,
            remoteUrl: null,
            status: 'error',
            error: err.message,
            startedAt: null,
          };
          resolve(currentStatus);
        }
      });

      proc.on('exit', (code, signal) => {
        console.log(`[Cloudflare Tunnel] Process exited with code ${code}, signal ${signal}`);
        tunnelProcess = null;
        currentStatus = {
          active: false,
          url: null,
          remoteUrl: null,
          status: 'stopped',
          error: code && code !== 0 ? `Process exited with code ${code}` : null,
          startedAt: null,
        };
      });
    } catch (err: any) {
      clearTimeout(timeout);
      currentStatus = {
        active: false,
        url: null,
        remoteUrl: null,
        status: 'error',
        error: err.message || 'Failed to start cloudflared',
        startedAt: null,
      };
      resolve(currentStatus);
    }
  });
}

/**
 * Stop running Cloudflare tunnel
 */
export function stopCloudflareTunnel(): TunnelStatus {
  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
    } catch (_) {}
    tunnelProcess = null;
  }

  currentStatus = {
    active: false,
    url: null,
    remoteUrl: null,
    status: 'stopped',
    error: null,
    startedAt: null,
  };

  return currentStatus;
}

/**
 * Get current tunnel status
 */
export function getTunnelStatus(): TunnelStatus {
  return currentStatus;
}

// Clean up tunnel on process exit
process.on('SIGINT', () => {
  stopCloudflareTunnel();
});
process.on('SIGTERM', () => {
  stopCloudflareTunnel();
});
