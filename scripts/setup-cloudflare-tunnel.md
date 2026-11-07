# Permanent Cloudflare Tunnel Setup
## For Smartlink WiFi — Omada Controller

### Why permanent tunnel?
The quick tunnel (trycloudflare.com) changes URL every restart.
A named tunnel gives you a permanent URL that never changes.

### Steps

#### 1. Create free Cloudflare account
Go to: https://cloudflare.com → Sign Up (free)

#### 2. Login via cloudflared
Open PowerShell and run:
```
cloudflared tunnel login
```
Browser opens → login with your Cloudflare account → click Authorize

#### 3. Create named tunnel
```
cloudflared tunnel create smartlink-omada
```
This creates a permanent tunnel. Note the tunnel ID shown.

#### 4. Create config file
Create: C:\Users\User\.cloudflared\config.yml
Content:
```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: C:\Users\User\.cloudflared\<YOUR-TUNNEL-ID>.json

ingress:
  - service: https://127.0.0.1:8043
    originRequest:
      noTLSVerify: true
```

#### 5. Create DNS route (gives permanent URL)
```
cloudflared tunnel route dns smartlink-omada omada.yourdomain.com
```
OR use the Cloudflare dashboard to add a CNAME record.

#### 6. Run tunnel
```
cloudflared tunnel run smartlink-omada
```

#### 7. Install as Windows service (auto-start)
```
cloudflared service install
```

### Your permanent URL will be:
https://omada.yourdomain.com

### Add to Vercel environment variables:
OMADA_BASE_URL = https://omada.yourdomain.com
