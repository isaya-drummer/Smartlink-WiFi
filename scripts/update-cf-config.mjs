const T = process.env.CF_TOKEN
const A = process.env.CF_ACCOUNT

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
console.log("Dir:", r.result?.build_config?.destination_dir)
console.log("Cmd:", r.result?.build_config?.build_command)
