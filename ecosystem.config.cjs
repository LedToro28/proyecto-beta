module.exports = {
  apps: [{
    name: 'inmoya',
    script: 'server.ts',
    interpreter: './node_modules/.bin/tsx',
    cwd: '/root/proyecto-beta',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    max_restarts: 10,
    restart_delay: 3000
  }]
};
