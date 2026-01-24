const { execSync } = require("child_process");
require("dotenv").config({ path: ".env.local" });

try {
  execSync('npx "@hey-api/openapi-ts" -c "@hey-api/client-next"', {
    stdio: "inherit",
  });
  console.log("✅ Hey-API client generated successfully!");
} catch (err) {
  console.error("❌ Failed to generate client:", err);
  process.exit(1);
}
