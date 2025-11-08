# n8n App Store Connect Node

Automate your iOS app submissions to Apple App Store Connect directly from your n8n workflows. This community node provides seamless integration with App Store Connect's API, allowing you to submit builds, manage versions, cancel pending submissions, and generate AI-powered release notes.

## Features

- **Submit to Review**: Automatically submit your app build to App Review with custom release notes
- **Get Builds**: Retrieve list of available builds with their details
- **Cancel Submissions**: Cancel any pending App Review submissions
- **AI Release Notes**: Generate release notes automatically from your git commit history using OpenAI
- **Latest Build Support**: Use `latest` keyword to automatically fetch the most recent valid build
- **Multi-Language**: Generate release notes in any supported language (en-US, pt-BR, fr-FR, etc.)

## Installation

1. **Install in n8n**:
   - Go to your n8n instance Settings → Community Nodes
   - Enter: `n8n-nodes-appstoreconnect`
   - Click Install

2. **Or install manually**:
   ```bash
   npm install n8n-nodes-appstoreconnect
   ```

## Configuration

### 1. Set Up Your App Store Connect Credentials

To use this node, you need to create an API key in App Store Connect:

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **Users and Access** → **Keys** → **App Store Connect API**
3. Click the "+" button to create a new key with **Admin** role
4. Download the `.p8` file and note your:
   - **Key ID**: Visible in the App Store Connect interface
   - **Issuer ID**: Found in the API Keys section
   - **App ID**: Your app's numeric ID (visible in App Information or from the App Store URL)

### 2. Configure Node Credentials

1. In n8n, add a new credential of type "App Store Connect API"
2. Fill in the required fields:
   - **Issuer ID**: Your issuer ID from above
   - **Key ID**: Your key ID from above
   - **Private Key**: The full content of your `.p8` file (paste the entire text)
   - **App ID**: Your app's numeric ID
   - **OpenAI API Key** (optional): For AI release notes generation
   - **OpenAI Organization ID** (optional): If using a specific organization

## Operations

### 1. Submit to Review

Submit your app version to Apple's App Review process.

**Required Parameters**:
- **Build ID**: The UUID of the build to submit, or use `latest` to automatically select the most recent valid build
- **Version String**: Semantic version (e.g., `1.0.0`, `2.3.1`)
- **Platform**: Target platform (iOS, macOS, or tvOS)

**Optional Parameters**:
- **Locale**: Language for release notes (default: `en-US`)
- **Release Notes**: Custom release notes (ignored if using AI generation)
- **Use AI Release Notes**: Generate notes from git commits using OpenAI
- **Since Days**: When using AI, how many days back to look in git history

**Example Output**:
```json
{
  "success": true,
  "message": "Successfully submitted to App Review",
  "appStoreVersionId": "abc123...",
  "buildId": "def456...",
  "versionString": "1.0.0",
  "releaseNotes": "Fixed critical bugs and improved performance"
}
```

### 2. Get Builds

Retrieve the list of available builds for your app.

**Optional Parameters**:
- **Limit**: Maximum number of builds to return (default: 10)

**Example Output**:
```json
{
  "success": true,
  "totalBuilds": 25,
  "buildsReturned": 10,
  "builds": [
    {
      "id": "abc123...",
      "version": "202",
      "state": "VALID",
      "uploadedDate": "2024-01-15T10:30:00Z"
    },
    {
      "id": "def456...",
      "version": "201",
      "state": "VALID",
      "uploadedDate": "2024-01-14T14:22:00Z"
    }
  ]
}
```

### 3. Cancel Pending Submissions

Cancel any submissions currently pending App Review.

**Parameters**: None (uses credentials only)

**Example Output**:
```json
{
  "success": true,
  "message": "Successfully canceled pending submissions",
  "canceledCount": 1,
  "details": "Canceled review submission for version 1.0.0"
}
```

### 4. Generate AI Release Notes

Generate release notes from your git commit history using OpenAI.

**Requirements**:
- OpenAI API Key must be configured in credentials
- Your workflow must run in a directory with a `.git` repository

**Optional Parameters**:
- **Locale**: Language for release notes (default: `en-US`)
- **Since Days**: How many days back to look (default: auto-detect from last published build)
- **Git Repository Path**: Path to the repository (default: current directory)

**Example Output**:
```json
{
  "success": true,
  "locale": "en-US",
  "releaseNotes": "Introducing version 2.0 with major improvements:\n\n• Redesigned user interface with improved navigation\n• Performance optimizations reducing load times by 40%\n• Fixed critical bugs affecting push notifications\n• Added support for dark mode\n• Enhanced accessibility features"
}
```

## Usage Examples

### Example 1: Submit with Custom Release Notes

```
[Get Builds Node]
  ↓
[Submit Node]
  - Build ID: latest
  - Version String: {{ $json.builds[0].version }}
  - Release Notes: "Major performance improvements and bug fixes"
```

### Example 2: Submit with AI-Generated Release Notes

```
[Webhook Trigger] → Git Push
  ↓
[Submit Node]
  - Build ID: latest
  - Version String: 2.0.0
  - Use AI Release Notes: true
  - Locale: en-US
```

### Example 3: Weekly Release Notes Preview

```
[Cron Trigger] → Every Monday at 9 AM
  ↓
[Generate AI Release Notes Node]
  - Since Days: 7
  ↓
[Email Notification]
  - Subject: "Weekly Release Notes Preview"
  - Body: {{ $json.releaseNotes }}
```

### Example 4: Conditional Submission with Build Management

```
[Get Builds Node]
  ↓
[Filter]: Only get VALID builds
  ↓
[Submit Node]: If builds exist
  - Build ID: latest
  - Version String: from input
  ↓
[Error Notification]: If no valid builds exist
```

## Troubleshooting

### "Authentication Failed"
- Verify your Issuer ID and Key ID are correct
- Ensure your private key (.p8) content is correctly pasted (include BEGIN and END lines)
- Check that your API key hasn't been revoked in App Store Connect

### "No valid builds found"
- When using `Build ID: latest`, ensure you have at least one valid build in TestFlight
- Check the "Get Builds" operation to see your available builds and their states

### "No commits found since that date" (AI Release Notes)
- Ensure you have git commits since the last published version
- Try increasing the "Since Days" parameter
- Verify the git repository path is correct

### "OpenAI API Key is required"
- Add your OpenAI API Key to the credential configuration
- Generate a key at [OpenAI API Keys](https://platform.openai.com/api-keys)

## Supported Languages

The AI Release Notes operation supports any language that OpenAI supports. Common locale codes:

- `en-US` - English (United States)
- `en-GB` - English (United Kingdom)
- `pt-BR` - Portuguese (Brazil)
- `pt-PT` - Portuguese (Portugal)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)
- `es-ES` - Spanish (Spain)
- `ja-JP` - Japanese (Japan)
- `zh-CN` - Chinese (Simplified)
- `zh-TW` - Chinese (Traditional)

## Advanced: Using Node-RED Expressions

You can use n8n expressions to dynamically set parameters:

```javascript
// Use the latest build version as app version
{{ $json.builds[0].version }}

// Calculate days since last build upload
{{ Math.floor((Date.now() - new Date($json.builds[0].uploadedDate)) / (1000 * 60 * 60 * 24)) }}

// Conditional AI notes based on build count
{{ $json.buildsReturned > 5 ? true : false }}
```

## Pricing & Rate Limiting

- **App Store Connect API**: Free to use (no additional costs)
- **OpenAI API**: Charges apply for API usage (typically $0.15 per 1M input tokens)
- **Rate Limiting**: No strict rate limits documented by Apple, but recommended to space out requests

## Security Best Practices

1. **Private Key Management**:
   - Store your `.p8` file securely
   - Never commit it to version control
   - Use n8n's credential system to store sensitive data

2. **API Key Rotation**:
   - Rotate your App Store Connect API keys regularly
   - Monitor for unexpected usage

3. **Scope Limitation**:
   - Keep the API key in a safe location
   - Consider creating a separate API key just for automation

## Contributing

Found a bug or have a feature request? Please open an issue on our [GitHub repository](https://github.com/unfoldingcx/appstoreconnect-api).

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [unfoldingcx/appstoreconnect-api](https://github.com/unfoldingcx/appstoreconnect-api)
- Documentation: [App Store Connect API Docs](https://developer.apple.com/app-store-connect/api/)

