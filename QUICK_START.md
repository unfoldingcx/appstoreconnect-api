# Quick Start Guide

Get started with App Store Connect API automation in minutes!

## Choose Your Method

### 🖥️ CLI (Command Line)

Perfect for:
- Quick submissions from terminal
- CI/CD pipelines
- Shell scripts
- One-off submissions

**Installation:**
```bash
npm install -g @unfoldingcx/appstoreconnect-api
```

**Usage:**
```bash
export ASC_ISSUER_ID="your-issuer-id"
export ASC_KEY_ID="your-key-id"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="your-app-id"

asca submit \
  --build-id "abc-123" \
  --version "1.0.0" \
  --release-notes "Bug fixes"
```

[Full CLI Documentation →](README.md#-cli-usage)

---

### 📦 Library (TypeScript/JavaScript)

Perfect for:
- Integration with your codebase
- Custom automation workflows
- Advanced error handling
- Programmatic control

**Installation:**
```bash
npm install @unfoldingcx/appstoreconnect-api
```

**Usage:**
```typescript
import { submitToAppReview } from '@unfoldingcx/appstoreconnect-api'

await submitToAppReview({
  issuerId: process.env.ASC_ISSUER_ID!,
  keyId: process.env.ASC_KEY_ID!,
  privateKeyPath: './keys/AuthKey.p8',
  appId: process.env.APP_ID!,
  buildId: 'abc-123',
  versionString: '1.0.0',
  platform: 'IOS',
  releaseNotes: 'Bug fixes and improvements',
  locale: 'en-US'
})
```

[Full API Documentation →](README.md#-api-reference)

---

## Prerequisites

Before you start, you need:

1. **App Store Connect API Key**
   - Go to [App Store Connect API Keys](https://appstoreconnect.apple.com/access/integrations/api)
   - Create a new key with **App Manager** or **Admin** role
   - Download the `.p8` file (only available once!)
   - Note your Issuer ID and Key ID

2. **App ID**
   - Found in App Store Connect → Your App → App Information
   - It's a numeric ID like `6461211731`

3. **Build ID**
   - Get from TestFlight
   - Or use: `asca builds --app-id YOUR_APP_ID`

---

## Common Workflows

### Workflow 1: Submit Latest Build

```bash
# List builds
asca builds --app-id "123456" --limit 5

# Copy the build ID from the output
# Submit that build
asca submit \
  --build-id "abc-123" \
  --version "1.0.0" \
  --release-notes "Bug fixes"
```

### Workflow 2: Auto-discover and Submit

```typescript
import { getBuilds, submitToAppReview } from '@unfoldingcx/appstoreconnect-api'

const jwtOptions = {
  issuerId: process.env.ASC_ISSUER_ID!,
  keyId: process.env.ASC_KEY_ID!,
  privateKeyPath: './keys/AuthKey.p8'
}

// Get latest valid build
const builds = await getBuilds(process.env.APP_ID!, jwtOptions, 5)
const latestBuild = builds.find(b => b.attributes.processingState === 'VALID')

// Submit it
await submitToAppReview({
  ...jwtOptions,
  appId: process.env.APP_ID!,
  buildId: latestBuild!.id,
  versionString: latestBuild!.attributes.version,
  platform: 'IOS',
  releaseNotes: 'Bug fixes and improvements',
  locale: 'en-US'
})
```

### Workflow 3: CI/CD Pipeline

GitHub Actions:

```yaml
- name: Submit to App Review
  env:
    ASC_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
    ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}
    ASC_PRIVATE_KEY: ${{ secrets.ASC_PRIVATE_KEY }}
  run: |
    echo "$ASC_PRIVATE_KEY" > AuthKey.p8
    export ASC_KEY_PATH="./AuthKey.p8"
    
    npx @unfoldingcx/appstoreconnect-api submit \
      --build-id "$BUILD_ID" \
      --version "$VERSION" \
      --release-notes "$RELEASE_NOTES"
```

---

## Environment Variables

Set these once to avoid repeating credentials:

```bash
# Required
export ASC_ISSUER_ID="your-issuer-id"
export ASC_KEY_ID="your-key-id"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="your-app-id"

# Optional (for submit command)
export BUILD_ID="your-build-id"
export VERSION_STRING="1.0.0"
export PLATFORM="IOS"
export RELEASE_NOTES="Bug fixes"
export LOCALE="en-US"
```

---

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `asca submit` | Submit to review | `asca submit --build-id abc --version 1.0.0` |
| `asca builds` | List builds | `asca builds --app-id 123 --limit 10` |
| `asca cancel` | Cancel submissions | `asca cancel --app-id 123` |
| `asca help` | Show help | `asca help` |
| `asca version` | Show version | `asca version` |

---

## Available Functions

| Function | Description | Use Case |
|----------|-------------|----------|
| `submitToAppReview()` | Full submission workflow | Main function for submissions |
| `getBuilds()` | List available builds | Find build IDs |
| `cancelPendingReviewSubmissions()` | Cancel pending reviews | Clear the way for new submission |
| `formatBuildInfo()` | Format build details | Pretty-print build info |

---

## Examples

Check the `examples/` directory for complete working examples:

- **basic-usage.ts** - Simple submission example
- **auto-discover-build.ts** - Automatically find and submit latest build
- **with-env-vars.ts** - Use environment variables
- **cli-usage.sh** - CLI examples and patterns

---

## Troubleshooting

### "No valid builds found"
→ Upload a build to TestFlight and wait for processing to complete

### "Locale not found"
→ The error will show available locales. Use one of those.

### "401 Unauthorized"
→ Check your Issuer ID, Key ID, and .p8 file are correct

### "409 Conflict"
→ The library automatically handles this! It will cancel pending submissions and retry.

---

## Next Steps

- Read the [Full Documentation](README.md)
- Check out [Examples](examples/)
- Join the [Discussion](https://github.com/unfoldingcx/appstoreconnect-api/discussions)
- Report [Issues](https://github.com/unfoldingcx/appstoreconnect-api/issues)

---

**Happy Automating! 🚀**

