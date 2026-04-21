import { networkInterfaces } from 'node:os';
import { pathToFileURL } from 'node:url';

const VIRTUAL_INTERFACE_PATTERNS = [
  /tailscale/i,
  /wsl/i,
  /vethernet/i,
  /hyper-v/i,
  /vmware/i,
  /virtual/i,
  /docker/i,
  /loopback/i,
  /tap/i,
  /^meta$/i,
];

function isPrivateIpv4(address) {
  return (
    address.startsWith('10.') ||
    address.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function isVirtualInterface(name) {
  return VIRTUAL_INTERFACE_PATTERNS.some((pattern) => pattern.test(name));
}

export function resolveLanIp() {
  const interfaces = networkInterfaces();
  const preferred = [];
  const fallback = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const address of addresses ?? []) {
      if (address.internal || address.family !== 'IPv4' || !isPrivateIpv4(address.address)) {
        continue;
      }

      if (isVirtualInterface(name)) {
        fallback.push(address.address);
        continue;
      }

      preferred.push(address.address);
    }
  }

  const detected = preferred[0] ?? fallback[0];

  if (!detected) {
    throw new Error(
      'Unable to detect a private LAN IPv4 address. Set TARO_APP_DEVICE_HOST manually.',
    );
  }

  return detected;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(resolveLanIp());
}
