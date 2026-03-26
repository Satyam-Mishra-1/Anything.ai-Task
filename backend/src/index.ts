import { app } from "./app";
import { env } from "./config/env";
import { seedAdminUser } from "./scripts/seedAdmin";

async function main() {
  if (env.SEED_ADMIN) {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
      // eslint-disable-next-line no-console
      console.warn(
        "SEED_ADMIN=true but ADMIN_EMAIL/ADMIN_PASSWORD are not set. Skipping admin seed."
      );
    } else {
      await seedAdminUser({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
    }
  }

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

