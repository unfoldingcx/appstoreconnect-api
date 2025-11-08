# n8n App Store Connect Node - Quick Start

## Installation

### Option 1: Via n8n UI (Recommended)

1. Go to **Settings** → **Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-appstoreconnect`
4. Click **Install**

### Option 2: Manual Installation

```bash
npm install n8n-nodes-appstoreconnect
# Then restart your n8n instance
```

## Setup Credentials

1. In n8n, go to **Credentials**
2. Create new credential: **App Store Connect API**
3. Fill in:
   - **Issuer ID**: From App Store Connect API Keys section (UUID format)
   - **Key ID**: From App Store Connect API Keys section (10 characters)
   - **Private Key**: Full content of your `.p8` file
   - **App ID**: Your app's numeric ID
   - **OpenAI API Key** (optional): For future AI features
   - **OpenAI Organization ID** (optional): If using organization account

## First Workflow

### Workflow 1: Submit to Review with Latest Build

```
Trigger (Manual/Webhook)
  ↓
App Store Connect (Submit to Review)
  ├─ Credentials: Your ASC credentials
  ├─ Build ID: latest
  ├─ Version String: 1.0.0
  ├─ Platform: IOS
  └─ Release Notes: My amazing release!
  ↓
Send notification on success
```

### Workflow 2: List Available Builds

```
Trigger (Schedule/Manual)
  ↓
App Store Connect (Get Builds)
  ├─ Credentials: Your ASC credentials
  └─ Limit: 10
  ↓
Display results / Send to Slack
```

### Workflow 3: Submit with Conditional Logic

```
Trigger
  ↓
Get Builds
  ↓
Check if VALID builds exist
  ↓
If YES: Submit Latest
If NO: Send alert
```

## Common Parameters Explained

| Parameter | Example | Description |
|-----------|---------|-------------|
| Build ID | `latest` or UUID | Use "latest" to auto-select newest valid build |
| Version String | `1.0.0` | Semantic version from your app |
| Platform | `IOS`, `MACOS`, `TVOS` | Target platform |
| Locale | `en-US`, `pt-BR` | Language code for release notes |
| Release Notes | Custom text | What's new in this version |

## Troubleshooting

### Node Not Appearing

1. Ensure you installed the correct package name
2. Restart n8n
3. Clear browser cache

### "Credential is required"

1. Create new credentials in the UI
2. Make sure all required fields are filled
3. Test connection by trying to use the node

### "No valid builds found"

1. Ensure you have at least one build in TestFlight
2. The build must have status "VALID" (not PROCESSING)
3. Try using specific build ID instead of "latest"

### "API request failed [409]"

1. You may have a pending submission already
2. Use "Cancel Pending Submissions" operation first
3. Then retry the submit operation

## Tips & Tricks

### Using Environment Variables

Instead of hardcoding values, use expressions:

```
Version String: {{ process.env.APP_VERSION }}
Release Notes: {{ $json.releaseNotes }}
```

### Conditional Release Notes

```
Release Notes:
{{ $node["Get Change Log"].json.changelog || "Bug fixes and improvements" }}
```

### Getting Latest Build Info

After "Get Builds", access the first build:

```
Build ID: {{ $json.builds[0].id }}
Version: {{ $json.builds[0].version }}
```

### Error Handling

Use "Execute node on error" to handle failures:

1. Add node after App Store Connect
2. Set "Execute node on error": YES
3. Access error details: `{{ $error.message }}`

## Available Operations

### 1. Submit to Review

Submits app build to Apple review

**Use when**: Ready to submit a new version

**Parameters needed**:
- Build ID (or "latest")
- Version String
- Platform
- Release Notes

### 2. Get Builds

Lists available builds

**Use when**: Need to find a build ID or check build status

**Parameters needed**:
- Limit (how many builds to return)

### 3. Cancel Pending Submissions

Cancels submission(s) waiting for review

**Use when**: Need to cancel and resubmit

**Parameters needed**: None (uses app credentials)

### 4. Generate AI Release Notes

*Coming soon* - Will generate notes from git commits

## Workflow Examples

### Daily Build Check

```
Trigger: Every day at 9 AM
  ↓
Get Builds (limit: 5)
  ↓
Format results
  ↓
Send to Slack
```

### Auto-Submit on New Build

```
Trigger: Webhook (from CI/CD)
  ↓
App Store Connect - Get Builds
  ↓
If first build is VALID and new
  ↓
Submit to Review
  ↓
Notify team on Slack
```

### Safe Submission with Logging

```
Trigger: Manual
  ↓
Cancel Pending (clear any conflicts)
  ↓
Get Builds
  ↓
Submit Latest
  ↓
Log to database
  ↓
Send confirmation
```

## Security Best Practices

1. **Never hardcode credentials**
   - Always use n8n credential system
   - Or use environment variables

2. **Private Key Storage**
   - Store in n8n credentials (encrypted)
   - Or use secret manager

3. **API Key Rotation**
   - Create new key in App Store Connect
   - Update credentials periodically

4. **Monitor Usage**
   - Keep workflow logs
   - Watch for unexpected submissions

## Next Steps

1. ✅ Install the node
2. ✅ Create credentials
3. ✅ Try "Get Builds" first (safe operation)
4. ✅ Build your first workflow
5. ✅ Test with a real app
6. ✅ Deploy to production

## Getting Help

- **Documentation**: See `n8n-nodes/README.md` for detailed docs
- **Issues**: Report bugs at GitHub Issues
- **Community**: Ask in n8n Community Forum
- **Development**: See `n8n-nodes/DEVELOPMENT.md` for dev guide

## More Information

- Full node docs: [n8n-nodes/README.md](n8n-nodes/README.md)
- Publishing guide: [N8N_PUBLISHING.md](N8N_PUBLISHING.md)
- Developer guide: [n8n-nodes/DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md)
- Main documentation: [README.md](README.md)

---

Happy automating! 🚀

