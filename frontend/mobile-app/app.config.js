// Receives the static config from app.json as `config` and layers the
// environment-driven API URL on top. Set EXPO_PUBLIC_API_URL when building
// (LAN IP for device testing, deployed URL for production); falls back to a
// LAN default so a plain `eas build` / `expo start` still points somewhere sane.
export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.10:5000/api',
  },
});
