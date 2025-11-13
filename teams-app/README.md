# Teams App Package

This folder contains the Microsoft Teams app manifest and assets for deploying DiveLog Studio as a Teams app.

## Files

- `manifest.json` - Teams app manifest (requires placeholder replacement)
- `color.png` - 192x192px color icon (TODO: replace with actual icon)
- `outline.png` - 32x32px transparent outline icon (TODO: replace with actual icon)

## Setup Instructions

### 1. Register Azure AD App

1. Go to [Azure Portal](https://portal.azure.com) → **App registrations**
2. Create **New registration**:
   - Name: `DiveLog Studio Teams App`
   - Supported account types: `Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)`
3. Note the **Application (client) ID** → use as `{{AZURE_AD_APP_ID}}`
4. Under **Authentication** → Add **Web** platform:
   - Redirect URI: `https://your-domain.com/auth/teams-callback`
5. Under **Expose an API**:
   - Set Application ID URI: `api://your-domain.com/{client-id}`
   - Add scope: `access_as_user`
   - Authorized client applications: Add `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams mobile/desktop) and `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web)

### 2. Replace Placeholders in manifest.json

Replace the following placeholders:

- `{{TEAMS_APP_ID}}` - Generate a new GUID (e.g., via `uuidgen` or online generator)
- `{{APP_URL}}` - Your app URL (e.g., `https://divelog.example.com`)
- `{{APP_DOMAIN}}` - Your domain without protocol (e.g., `divelog.example.com`)
- `{{AZURE_AD_APP_ID}}` - The Application ID from step 1

Example:
```json
"id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
"websiteUrl": "https://divelog.example.com",
"validDomains": ["divelog.example.com"],
"webApplicationInfo": {
  "id": "12345678-1234-1234-1234-123456789012",
  "resource": "api://divelog.example.com/12345678-1234-1234-1234-123456789012"
}
```

### 3. Add App Icons

Create two PNG icons:

**color.png** (192x192px):
- Full-color app icon
- Background color: `#0369a1` (sky-700)
- Should contain logo/branding

**outline.png** (32x32px):
- Transparent background
- White outline icon
- Simple, recognizable design

### 4. Create App Package

```bash
cd teams-app
zip -r divelog-teams-app.zip manifest.json color.png outline.png
```

### 5. Upload to Teams

1. Open Microsoft Teams
2. Go to **Apps** → **Manage your apps** → **Upload an app**
3. Select **Upload a custom app**
4. Choose `divelog-teams-app.zip`
5. Click **Add** to install for yourself, or **Add to a team** for team-wide installation

## Environment Variables for Production

When deploying to production, ensure these environment variables are set:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=common
```

## Testing in Teams

After installation:

1. Open the app in Teams
2. The app will automatically detect Teams context
3. SSO will attempt to authenticate (currently uses demo user in development)
4. Dashboard opens directly without showing landing page

## Web vs. Teams Mode

The app automatically detects whether it's running in Teams or a web browser:

- **Web Mode**: Full landing page, manual login/register
- **Teams Mode**: Auto-login via SSO, landing page hidden, optimized for Teams viewport

No code changes needed - detection is automatic via `useTeams()` hook.
