const T = "REPLACE_WITH_CF_TOKEN"
const A = "REPLACE_WITH_CF_ACCOUNT_ID"

// Update to standard Next.js build — no CF adapter needed
const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/pages/projects/smartlink-wifi`, {
  method: "PATCH",
  headers: { "Authorization": `Bearer ${T}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    build_config: {
      build_command: "npm run build:cf",
      destination_dir: ".next",
      root_dir: "",
      build_caching: false
    }
  })
}).then(r => r.json())

console.log("Updated:", r.success)
console.log("Build command:", r.result?.build_config?.build_command)
console.log("Output dir:", r.result?.build_config?.destination_dir)
