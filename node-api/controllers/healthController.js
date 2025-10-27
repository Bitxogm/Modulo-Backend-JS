import packageJson from '../package.json' with {type: 'json'};

export function healthCall(req, res, next) {
  const uptime = process.uptime();
  const apiVersion = process.env.npm_package_version;
  const apiName = process.env.npm_package_name;
  res.status(200).json({
    Status: ' ✅ OK - Server is healthy',
    upTime: `${uptime.toFixed(2)} seconds`,
    ApiVersion: `${apiVersion}`,
    version: packageJson.version,
    ApiName: `${apiName}`,
  });
};