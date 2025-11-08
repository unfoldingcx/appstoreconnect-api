# 🚀 App Store Connect API - Automated Review Submission

[![npm version](https://img.shields.io/npm/v/@unfoldingcx/appstoreconnect-api.svg)](https://www.npmjs.com/package/appstoreconnect-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A powerful, production-ready TypeScript library for automating Apple App Store Connect submissions. Streamline your iOS, macOS, and tvOS app deployment workflow with intelligent error handling and automatic retry mechanisms.

## ✨ Features

- 🎯 **Complete Automation** - Handles the entire review submission workflow from version creation to final submission
- 🧠 **Intelligent Error Recovery** - Automatically handles conflicts, retries failed operations, and provides actionable feedback
- 🔄 **Conflict Resolution** - Automatically cancels pending submissions when needed and retries
- 📊 **Build Management** - Query and list available builds with detailed status information
- 🌍 **Multi-Locale Support** - Works with any locale configured in your App Store Connect account
- 🖥️ **CLI & API** - Use as a library in your code or as a command-line tool
- 🛡️ **Type Safe** - Written in TypeScript with full type definitions
- 📝 **Detailed Logging** - Step-by-step progress tracking with emoji indicators
- 🚨 **Clear Error Messages** - Human-readable error messages with context and suggestions

## 📦 Installation

```bash
npm install @unfoldingcx/appstoreconnect-api
```

Or using bun:

```bash
bun add @unfoldingcx/appstoreconnect-api
```

### Global CLI Installation

Install globally to use the CLI from anywhere:

```bash
npm install -g @unfoldingcx/appstoreconnect-api
```

Then use the `asca` command:

```bash
asca --help
```

## 🖥️ CLI Usage

The package includes a powerful CLI for submitting apps directly from your terminal.

### Submit to Review

```bash
asca submit \
  --issuer-id "your-issuer-id" \
  --key-id "your-key-id" \
  --key-path "./keys/AuthKey.p8" \
  --app-id "123456" \
  --build-id "abc-def-123" \
  --version "1.0.0" \
  --platform "IOS" \
  --release-notes "Bug fixes and improvements" \
  --locale "en-US"
```

### Using Environment Variables

Set credentials in environment variables for convenience:

```bash
export ASC_ISSUER_ID="your-issuer-id"
export ASC_KEY_ID="your-key-id"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="123456"

# Now you can use shorter commands
asca submit --build-id "abc" --version "1.0.0" --release-notes "Bug fixes"
```

### List Available Builds

```bash
asca builds --app-id "123456" --limit 10
```

### Cancel Pending Submissions

```bash
asca cancel --app-id "123456"
```

### Get Help

```bash
asca help
asca submit --help
asca builds --help
```

## 🔑 Setup

### 1. Create an API Key in App Store Connect

1. Go to [App Store Connect API Keys](https://appstoreconnect.apple.com/access/integrations/api)
2. Click the "+" button to create a new key
3. Give it a name and select **App Manager** or **Admin** role
4. Download the `.p8` private key file (you can only download this once!)
5. Note your **Issuer ID** (shown at the top of the page)
6. Note your **Key ID** (shown in the key list)

### 2. Get Your App and Build IDs

- **App ID**: Found in App Store Connect → Apps → Your App → App Information (numeric ID like `6461211731`)
- **Build ID**: You can get this from TestFlight or by using the `getBuilds()` function from this library

## 🎯 Quick Start

```typescript
import { submitToAppReview } from '@unfoldingcx/appstoreconnect-api'

// Submit your app for review
await submitToAppReview({
  issuerId: 'your-issuer-id',
  keyId: 'your-key-id',
  privateKeyPath: './keys/AuthKey.p8',
  appId: 'your-app-id',
  buildId: 'build-uuid',
  versionString: '1.0.0',
  platform: 'IOS',
  releaseNotes: 'Bug fixes and performance improvements.',
  locale: 'en-US'
})

console.log('✅ Successfully submitted to App Review!')
```

## 📚 API Reference

### `submitToAppReview(options)`

Submits an app build to Apple App Review with a complete automated workflow.

**Parameters:**

```typescript
interface AppStoreConnectOptions {
  issuerId: string          // Your Issuer ID (UUID format)
  keyId: string             // Your Key ID (10 characters)
  privateKeyPath: string    // Path to your .p8 file
  appId: string             // Your app's unique identifier
  buildId: string           // Build UUID to submit
  versionString?: string    // Version string (e.g., "1.0.0")
  platform: 'IOS' | 'MACOS' | 'TVOS'
  releaseNotes: string      // What's New text (max 4000 chars)
  locale: string            // Locale code (e.g., 'en-US', 'pt-BR')
}
```

**What it does:**

1. ✅ Creates or retrieves the app store version
2. 🔗 Associates the build with the version
3. 📝 Updates release notes
4. 📤 Creates a review submission
5. ➕ Adds the version to the submission
6. 🎉 Submits to App Review

**Returns:** `Promise<void>`

**Throws:** Error with detailed message indicating which step failed

---

### `getBuilds(appId, jwtOptions, limit?)`

Retrieves available builds for your app, sorted by upload date (most recent first).

```typescript
const jwtOptions = {
  issuerId: 'your-issuer-id',
  keyId: 'your-key-id',
  privateKeyPath: './AuthKey.p8'
}

const builds = await getBuilds('your-app-id', jwtOptions, 10)

builds.forEach(build => {
  console.log(`${build.attributes.version} - ${build.attributes.processingState}`)
})
```

**Returns:** `Promise<Build[]>`

---

### `cancelPendingReviewSubmissions(appId, jwtOptions)`

Cancels all pending review submissions for an app. Useful when you need to submit a new build but have an existing submission in review.

```typescript
const canceled = await cancelPendingReviewSubmissions('your-app-id', jwtOptions)
if (canceled) {
  console.log('Previous submissions canceled')
}
```

**Returns:** `Promise<boolean>` - True if any submissions were canceled

---

### `formatBuildInfo(build)`

Formats build information into a human-readable string.

```typescript
const builds = await getBuilds('your-app-id', jwtOptions)
console.log(formatBuildInfo(builds[0]))

// Output:
//   • Build ID: 27c6cafd-aeca-4beb-b045-23bfaf72ab2c
//     Version: 1.0.0
//     Status: VALID
//     Uploaded: 11/8/2025, 3:45:00 PM
```

**Returns:** `string`

## 💡 Usage Examples

### With Environment Variables

```typescript
import { submitToAppReview } from '@unfoldingcx/appstoreconnect-api'

await submitToAppReview({
  issuerId: process.env.ASC_ISSUER_ID!,
  keyId: process.env.ASC_KEY_ID!,
  privateKeyPath: process.env.ASC_KEY_PATH!,
  appId: process.env.APP_ID!,
  buildId: process.env.BUILD_ID!,
  versionString: process.env.VERSION!,
  platform: 'IOS',
  releaseNotes: process.env.RELEASE_NOTES!,
  locale: 'en-US'
})
```

### Automatic Build Discovery

Find and submit the latest valid build automatically:

```typescript
import { submitToAppReview, getBuilds } from '@unfoldingcx/appstoreconnect-api'

const jwtOptions = {
  issuerId: process.env.ASC_ISSUER_ID!,
  keyId: process.env.ASC_KEY_ID!,
  privateKeyPath: './keys/AuthKey.p8'
}

// Get the latest valid build
const builds = await getBuilds(process.env.APP_ID!, jwtOptions, 5)
const latestBuild = builds.find(b => b.attributes.processingState === 'VALID')

if (!latestBuild) {
  throw new Error('No valid builds found. Please upload a build to TestFlight first.')
}

console.log(`Submitting build ${latestBuild.attributes.version}...`)

await submitToAppReview({
  ...jwtOptions,
  appId: process.env.APP_ID!,
  buildId: latestBuild.id,
  versionString: latestBuild.attributes.version,
  platform: 'IOS',
  releaseNotes: 'Bug fixes and performance improvements.',
  locale: 'en-US'
})
```

### CI/CD Integration (GitHub Actions)

```yaml
name: Submit to App Review

on:
  workflow_dispatch:
    inputs:
      build_id:
        description: 'Build ID from TestFlight'
        required: true
      version:
        description: 'Version string (e.g., 1.0.0)'
        required: true

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install @unfoldingcx/appstoreconnect-api
      
      - name: Submit to App Review
        env:
          ASC_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
          ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}
          ASC_PRIVATE_KEY: ${{ secrets.ASC_PRIVATE_KEY }}
          APP_ID: ${{ secrets.APP_ID }}
        run: |
          echo "$ASC_PRIVATE_KEY" > AuthKey.p8
          node -e "
            const { submitToAppReview } = require('@unfoldingcx/appstoreconnect-api');
            submitToAppReview({
              issuerId: process.env.ASC_ISSUER_ID,
              keyId: process.env.ASC_KEY_ID,
              privateKeyPath: './AuthKey.p8',
              appId: process.env.APP_ID,
              buildId: '${{ github.event.inputs.build_id }}',
              versionString: '${{ github.event.inputs.version }}',
              platform: 'IOS',
              releaseNotes: 'Bug fixes and performance improvements.',
              locale: 'en-US'
            }).then(() => console.log('Success!')).catch(console.error);
          "
```

### Error Handling

```typescript
import { submitToAppReview } from '@unfoldingcx/appstoreconnect-api'

try {
  await submitToAppReview({
    // ... your options
  })
  console.log('✅ Successfully submitted to App Review!')
} catch (error) {
  if (error.message.includes('Step 2 failed')) {
    console.error('Build association failed. Check the build ID and try again.')
  } else if (error.message.includes('Locale')) {
    console.error('Invalid locale. Check your App Store Connect localization settings.')
  } else {
    console.error('Submission failed:', error.message)
  }
  process.exit(1)
}
```

## 🛡️ Error Recovery

This library includes intelligent error recovery mechanisms:

### Automatic Conflict Resolution

If a build is already waiting for review, the library automatically:
1. Detects the conflict (409 INVALID_STATE error)
2. Cancels the pending submission
3. Retries the new build association
4. Continues with the submission

### Build Discovery on Failure

If build association fails, the library automatically:
1. Fetches your last 5 builds
2. Displays them with status and upload date
3. Provides guidance on which builds are valid for submission

### Locale Validation

If an invalid locale is provided, the error message shows:
- The locale you tried to use
- All available locales for your app
- Clear instructions on how to fix it

## 📋 Prerequisites

Before using this library, ensure:

- ✅ Your app is set up in App Store Connect
- ✅ At least one locale is configured for your app
- ✅ Your build is uploaded to TestFlight
- ✅ Your build has "VALID" processing state
- ✅ App metadata (description, screenshots, etc.) is complete
- ✅ Your API key has App Manager or Admin role

## 🔐 Security Best Practices

1. **Never commit your .p8 file** - Add it to `.gitignore`
2. **Use environment variables** - Store credentials in env vars or secrets managers
3. **Restrict API key permissions** - Use App Manager role instead of Admin when possible
4. **Rotate keys regularly** - Generate new API keys periodically
5. **Use CI/CD secrets** - Store credentials in GitHub Secrets, AWS Secrets Manager, etc.

## 🐛 Troubleshooting

### "No valid builds found"
- Make sure your build is uploaded to TestFlight
- Check that the build processing is complete (not still processing)
- Verify the build hasn't expired (builds expire after 90 days)

### "Locale not found"
- Ensure the locale is configured in App Store Connect
- Check the locale code format (e.g., 'en-US', not 'en')
- The error message will show available locales

### "API request failed [401]"
- Verify your Issuer ID, Key ID, and private key are correct
- Ensure the .p8 file path is correct
- Check that your API key hasn't been revoked

### "API request failed [403]"
- Your API key doesn't have sufficient permissions
- Generate a new key with App Manager or Admin role

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for the iOS/macOS developer community.

Special thanks to:
- Apple for providing the App Store Connect API
- The TypeScript and Node.js communities

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/unfoldingcx/appstoreconnect-api/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/unfoldingcx/appstoreconnect-api/discussions)
- 📧 **Email**: pitter@unfolding.cx

---

**Made with ☕ and TypeScript**
