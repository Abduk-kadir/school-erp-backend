module.exports = {
    apps: [
      {
        name: "my-app",
        script: "server.js",        // ← Change this to your main file (server.js, app.js, etc.)
        instances: "max",              // Use all CPU cores
        exec_mode: "cluster",          // Important for multi-core
        env: {
          NODE_ENV: "production",
          PORT: 5000                   // Change if needed
        },
        watch: false,                  // Don't use in production
        max_memory_restart: "500M"     // Restart if memory is high
      }
    ]
  };