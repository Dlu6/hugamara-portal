module.exports = {
  apps: [
    {
      name: "hugamara-backend",
      script: "./backend/server.js",
      cwd: "/home/admin/hugamara-hospitality-app",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        DB_HOST: "localhost",
        DB_PORT: 3306,
        DB_NAME: "hugamara_db",
        DB_USER: "hugamara_user",
        DB_PASSWORD: "Pasword@256",
      },
      error_file: "/home/admin/logs/hugamara-backend-error.log",
      out_file: "/home/admin/logs/hugamara-backend-out.log",
      log_file: "/home/admin/logs/hugamara-backend-combined.log",
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
