# How to Get Your API Key (JWT Token) for Browser Extension

## What is the "API Key"?

The extension is asking for a **JWT authentication token** (it's labeled as "API key" in the UI). This is the same token you get when you log in to the web dashboard.

---

## Method 1: Get Token from Browser (Easiest)

### Step 1: Login to Web Dashboard
1. Open your browser and go to: `http://localhost:3000`
2. Login with your email and password
3. You should be redirected to the dashboard

### Step 2: Get Token from Browser DevTools
1. Press `F12` to open Developer Tools
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In the left sidebar, expand **Local Storage**
4. Click on `http://localhost:3000`
5. Look for the key: `surfsense_bearer_token`
6. **Copy the value** - this is your JWT token

### Step 3: Use Token in Extension
1. Open the SurfSense browser extension
2. Paste the token into the "API Key" field
3. Click "Connect"
4. ✅ You should now be connected!

---

## Method 2: Get Token via API (Alternative)

### Step 1: Login via API
Open PowerShell and run:

```powershell
$body = @{
    username = "YOUR_EMAIL@example.com"
    password = "YOUR_PASSWORD"
    grant_type = "password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/auth/jwt/login" `
    -Method POST `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "username=YOUR_EMAIL@example.com&password=YOUR_PASSWORD&grant_type=password"

$response.access_token
```

Replace:
- `YOUR_EMAIL@example.com` with your actual email
- `YOUR_PASSWORD` with your actual password

### Step 2: Copy the Token
The command will output your JWT token. Copy it and use it in the extension.

---

## Method 3: Quick Browser Console Method

1. Login to `http://localhost:3000` in your browser
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Type this command and press Enter:

```javascript
localStorage.getItem('surfsense_bearer_token')
```

5. The token will be displayed - copy it!
6. Paste it into the extension's "API Key" field

---

## Verification

After entering the token in the extension:

✅ **Success**: Extension shows search space selector  
❌ **Failure**: "Invalid API key" error

If you get an error:
- Make sure you copied the **entire token** (it's usually a long string)
- Verify the backend is running: `http://localhost:8000/`
- Check that you're logged in to the web dashboard
- Try logging out and logging back in to get a fresh token

---

## Token Format

Your JWT token should look something like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

It's a long string with dots (`.`) separating three parts.

---

## Notes

- The token expires after some time (usually 24 hours or based on your backend config)
- If the token stops working, just get a new one using the same methods above
- The token is stored locally in the extension, so you only need to enter it once per browser
- Each browser/device needs its own token

