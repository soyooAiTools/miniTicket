module.exports = {
  apps: [
    {
      name: 'miniticket-api',
      script: 'dist/main.js',
      cwd: '/opt/miniTicket/apps/api',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
