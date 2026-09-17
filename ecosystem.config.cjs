const deployRoot = process.env.NIHAOCAMPUS_DEPLOY_ROOT || "/var/www/nihaocampus";
const dbPath = process.env.NIHAOCAMPUS_DB || "/var/lib/nihaocampus/nihaocampus.db";
const port = process.env.NIHAOCAMPUS_PORT || "41729";

module.exports = {
  apps: [
    {
      name: "nihaocampus",
      cwd: `${deployRoot.replace(/\/$/, "")}/current`,
      script: "server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: port,
        HOSTNAME: process.env.NIHAOCAMPUS_HOSTNAME || "127.0.0.1",
        NIHAOCAMPUS_DB: dbPath,
        ...(process.env.NIHAOCAMPUS_ADMIN_TOKEN
          ? { NIHAOCAMPUS_ADMIN_TOKEN: process.env.NIHAOCAMPUS_ADMIN_TOKEN }
          : {}),
      },
    },
  ],
};
