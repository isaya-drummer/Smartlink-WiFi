const T = "REPLACE_WITH_CF_TOKEN"
const A = "REPLACE_WITH_CF_ACCOUNT_ID"
const DEPLOY_ID = "f0a60760-1261-4584-88c3-1e12702d3a73"

// Get with higher limit
const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${A}/pages/projects/smartlink-wifi/deployments/${DEPLOY_ID}/history/logs`, {
  headers: { "Authorization": `Bearer ${T}` }
}).then(r => r.json())

const lines = r.result?.data || []
console.log('Total lines:', lines.length)

// Find npx/cloudflare lines
const cfLines = lines.filter(l => l.line && (
  l.line.includes('next-on-pages') || 
  l.line.includes('npx') || 
  l.line.includes('Error') || 
  l.line.includes('error') ||
  l.line.includes('Failed') ||
  l.line.includes('Cannot') ||
  l.line.includes('ENOENT')
))
cfLines.slice(-30).forEach(l => console.log(l.ts?.slice(11,19), l.line))
