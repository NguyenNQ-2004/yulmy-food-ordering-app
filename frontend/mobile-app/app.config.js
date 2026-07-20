import { networkInterfaces } from 'node:os';

function getLocalIpAddress() {
  try {
    const interfaces = networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && !alias.internal) {
          return alias.address;
        }
      }
    }
  } catch (e) {
    console.error('Error getting local IP address:', e);
  }
  return 'localhost';
}

// Receives the static config from app.json as `config` and layers the
// environment-driven API URL on top. Set EXPO_PUBLIC_API_URL when building
// (LAN IP for device testing, deployed URL for production); falls back to a
// LAN default so a plain `eas build` / `expo start` still points somewhere sane.
export default ({ config }) => {
  const localIp = getLocalIpAddress();
  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || `http://${localIp}:5000/api`,
    },
  };
};
