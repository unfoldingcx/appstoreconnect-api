<h1 align="center"><img src="https://www.unfolding.cx/images/branding/main-rounded.png" width="150" height="150"></h1>

<div align="center">
  <p>
    <strong>ASCA - Automated Review Submission</strong><br/>
    <sub><a href="https://www.unfolding.cx/">広げる THE FUTURE</a></sub>
  </p>
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@unfoldingcx/appstoreconnect-api.svg)](https://www.npmjs.com/package/appstoreconnect-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

</div>

"ASCA" stands for "App Store Connect API" and it's a powerful, production-ready TypeScript library for automating Apple App Store Connect submissions to Apple review team. Streamline your iOS, macOS, and tvOS app deployment workflow with intelligent error handling and automatic retry mechanisms.

## ✨ Features

- ⚡ **The Ultimate One-Liner** - `asca submit --build-id latest --version "1.0.0" --ai-release-notes` - That's it! Auto-finds build, generates notes, submits to review
- 🎬 **GitHub Action** - Use as a custom action in your CI/CD workflows with `uses: unfoldingcx/appstoreconnect-api@v1`
- 🎯 **Complete Automation** - Handles the entire review submission workflow from version creation to final submission
- 🤖 **AI-Powered Release Notes** - Generate localized release notes from git commits using OpenAI (supports 25+ languages)
- 🔍 **Smart Build Discovery** - Use `--build-id latest` to automatically use the newest VALID build (no IDs to remember!)
- 🧠 **Intelligent Error Recovery** - Automatically handles conflicts, retries failed operations, and provides actionable feedback
- 🔄 **Conflict Resolution** - Automatically cancels pending submissions when needed and retries
- 📊 **Build Management** - Query and list available builds with detailed status information
- 🌍 **Multi-Locale Support** - Works with any locale configured in your App Store Connect account
- 🖥️ **CLI & Library** - Use as a library in your code, as a command-line tool, or as a GitHub Action
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

### GitHub Action

Use in your GitHub workflows for CI/CD automation:

```yaml
- uses: unfoldingcx/appstoreconnect-api@v1
  with:
    issuer-id: ${{ secrets.ASC_ISSUER_ID }}
    key-id: ${{ secrets.ASC_KEY_ID }}
    private-key: ${{ secrets.ASC_PRIVATE_KEY }}
    app-id: ${{ secrets.APP_ID }}
    build-id: 'latest'
    version: '1.0.0'
    ai-release-notes: true
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

[📚 Full GitHub Action Documentation →](GITHUB_ACTION.md)

## 🖥️ CLI Usage

The package includes a powerful CLI for submitting apps directly from your terminal.

### Submit to Review

**With manual release notes:**

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

**With AI-generated release notes:** 🤖

```bash
# Auto-generate release notes from git commits and submit in one command!
asca submit \
  --build-id "abc-def-123" \
  --version "1.0.0" \
  --ai-release-notes \
  --locale "pt-BR"

# With custom date range (last 14 days)
asca submit \
  --build-id "abc-def-123" \
  --version "1.0.0" \
  --ai-release-notes \
  --since-days 14 \
  --locale "en-US"
```

The `--ai-release-notes` flag will:
1. Fetch your last published App Store build
2. Get commits since that build
3. Generate localized release notes with OpenAI
4. Display preview
5. Submit to App Review with generated notes

**Use "latest" to auto-select the newest build:** ✨

```bash
# Don't remember the build ID? Use "latest"!
asca submit \
  --build-id latest \
  --version "1.0.0" \
  --ai-release-notes

# This will:
# 1. Fetch your latest VALID build from TestFlight
# 2. Generate AI release notes
# 3. Submit automatically
```

The `latest` keyword automatically finds and uses your most recent VALID build, so you don't need to look up build IDs!

### ⚡ The Ultimate One-Liner

After running `asca config` once, you can submit to App Review with a single command:

```bash
asca submit --build-id latest --version "1.0.0" --ai-release-notes
```

This **one command** will:
1. ✨ Auto-find your latest VALID build
2. 🤖 Generate release notes from git commits with AI
3. 🚀 Submit to App Review

**From git commits to App Review in ~30 seconds with ZERO manual work!**

### Using Environment Variables

Set credentials in environment variables for convenience:

```bash
export ASC_ISSUER_ID="your-issuer-id"
export ASC_KEY_ID="your-key-id"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="123456"
export OPENAI_API_KEY="sk-..."  # For AI release notes

# Now you can use shorter commands
asca submit --build-id "abc" --version "1.0.0" --release-notes "Bug fixes"

# Or with AI-generated notes
asca submit --build-id "abc" --version "1.0.0" --ai-release-notes
```

### List Available Builds

```bash
asca builds --app-id "123456" --limit 10
```

### Cancel Pending Submissions

```bash
asca cancel --app-id "123456"
```

### Generate AI Release Notes (Preview)

Automatically generate release notes from your git commits using AI:

```bash
# Generate notes from commits since last published build
asca release-notes --locale "en-US"

# Short alias
asca rn --locale "pt-BR"

# Generate from last 7 days
asca rn --since-days 7 --locale "es-ES"

# Specify custom git repository path
asca rn --git-path "/path/to/repo" --locale "fr-FR"
```

**What it does:**
1. Fetches your last **published** build from App Store Connect (READY_FOR_SALE - live in the App Store)
2. Gets all git commits since that build was uploaded
3. Uses OpenAI to generate localized, user-friendly release notes
4. Displays preview with character count (won't submit to App Store)

**Important:** Uses the last build that's actually **live in the App Store**, not just the most recent TestFlight build. This ensures release notes only cover changes since the last public release.

**Requirements:**
- OpenAI API key (configure with `asca config` or use `--openai-key`)
- Git repository with commit history
- App Store Connect credentials

### Get Help

```bash
asca help
asca submit --help
asca builds --help
asca release-notes --help
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

---

### `generateAIReleaseNotes(options)` 🤖

**NEW!** Automatically generates release notes from git commits using OpenAI.

```typescript
import { generateAIReleaseNotes } from '@unfoldingcx/appstoreconnect-api/ai-release-notes'

const result = await generateAIReleaseNotes({
  credentials: {
    issuerId: 'your-issuer-id',
    keyId: 'your-key-id',
    privateKeyPath: './AuthKey.p8'
  },
  appId: 'your-app-id',
  locale: 'pt-BR',
  openaiApiKey: 'sk-...',
  gitRepoPath: './',  // optional, defaults to current directory
  sinceDays: 7        // optional, or use sinceDate
})

console.log(result.releaseNotes)
console.log(`Based on ${result.commitCount} commits`)
```

**What it does:**
1. Fetches your last **published** build from App Store Connect (READY_FOR_SALE - live in App Store)
2. Gets git commits since that build's upload date
3. Uses OpenAI to generate user-friendly, localized release notes

**Note:** Fetches builds that are actually published to the App Store (not just TestFlight). If no published version exists yet, defaults to last 30 days of commits.

**Parameters:**
- `credentials` - App Store Connect JWT credentials
- `appId` - Your app's ID
- `locale` - Target language (supports 25+ languages)
- `openaiApiKey` - Your OpenAI API key
- `openaiOrgId` - OpenAI Org ID (optional)
- `gitRepoPath` - Path to git repo (default: current directory)
- `sinceDays` - Override: use last N days instead of last build date
- `sinceDate` - Override: use specific date
- `maxCommits` - Maximum commits to analyze (default: 100)

**Returns:** `Promise<ReleaseNotesResult>` with:
- `releaseNotes` - Generated text
- `commitCount` - Number of commits analyzed
- `sinceDate` - Date range start
- `locale` - Target locale
- `lastBuildVersion` - Last build version (if available)

**Supported Locales:** en-US, pt-BR, es-ES, fr-FR, de-DE, it-IT, ja-JP, ko-KR, zh-CN, zh-TW, and 15+ more

---

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

### AI-Powered Release Notes

Automatically generate release notes from git commits:

```typescript
import { generateAIReleaseNotes } from '@unfoldingcx/appstoreconnect-api/ai-release-notes'
import { submitToAppReview } from '@unfoldingcx/appstoreconnect-api'

// Generate release notes from git commits
const result = await generateAIReleaseNotes({
  credentials: {
    issuerId: process.env.ASC_ISSUER_ID!,
    keyId: process.env.ASC_KEY_ID!,
    privateKeyPath: './keys/AuthKey.p8'
  },
  appId: process.env.APP_ID!,
  locale: 'pt-BR',
  openaiApiKey: process.env.OPENAI_API_KEY!,
  sinceDays: 7  // Last 7 days of commits
})

console.log('Generated notes:', result.releaseNotes)

// Use the generated notes for submission
await submitToAppReview({
  issuerId: process.env.ASC_ISSUER_ID!,
  keyId: process.env.ASC_KEY_ID!,
  privateKeyPath: './keys/AuthKey.p8',
  appId: process.env.APP_ID!,
  buildId: 'your-build-id',
  versionString: '1.0.0',
  platform: 'IOS',
  releaseNotes: result.releaseNotes,  // ← AI-generated notes
  locale: result.locale
})
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
