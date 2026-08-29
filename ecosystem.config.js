module.exports = {
  apps: [
    {
      name: 'orangy-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '450M',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        HOST: '0.0.0.0',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
