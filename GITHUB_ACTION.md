# 🎬 GitHub Action Usage

Use the `unfoldingcx/appstoreconnect-api` action in your GitHub workflows to automatically submit your app to Apple App Review.

## 🚀 Quick Start

### Basic Usage

```yaml
name: Submit to App Review

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version (e.g., 1.0.0)'
        required: true

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Needed for AI release notes
      
      - uses: unfoldingcx/appstoreconnect-api@v1
        with:
          issuer-id: ${{ secrets.ASC_ISSUER_ID }}
          key-id: ${{ secrets.ASC_KEY_ID }}
          private-key: ${{ secrets.ASC_PRIVATE_KEY }}
          app-id: ${{ secrets.APP_ID }}
          build-id: 'latest'
          version: ${{ inputs.version }}
          ai-release-notes: true
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## 📋 Required GitHub Secrets

Set these in your repository settings (Settings → Secrets and variables → Actions):

| Secret | Description | How to Get |
|--------|-------------|------------|
| `ASC_ISSUER_ID` | App Store Connect Issuer ID | [App Store Connect → API Keys](https://appstoreconnect.apple.com/access/integrations/api) |
| `ASC_KEY_ID` | App Store Connect Key ID | From API Keys page |
| `ASC_PRIVATE_KEY` | Content of .p8 file | Copy entire file content |
| `APP_ID` | Your app's unique ID | App Store Connect → App Information |
| `OPENAI_API_KEY` | OpenAI API key (if using AI) | [OpenAI Platform](https://platform.openai.com/api-keys) |

## 📝 Inputs

### Required Inputs

| Input | Description | Example |
|-------|-------------|---------|
| `issuer-id` | App Store Connect Issuer ID | `415d0cda-7a87-4d29-a982-14b67efae93b` |
| `key-id` | App Store Connect Key ID | `RB5XWU46WG` |
| `private-key` | Content of .p8 private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `app-id` | Your app ID | `6461211731` |
| `build-id` | Build UUID or `latest` | `latest` or UUID |
| `version` | Version string | `1.0.0` |

### Optional Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `platform` | IOS, MACOS, or TVOS | `IOS` |
| `locale` | Locale code | `en-US` |
| `release-notes` | Manual release notes | Empty |
| `ai-release-notes` | Generate notes with AI (true/false) | `false` |
| `openai-api-key` | OpenAI API key | Empty |
| `openai-org-id` | OpenAI Org ID | Empty |
| `since-days` | For AI: commits from last N days | Empty |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `build-id` | Build ID that was submitted (useful with `latest`) |
| `release-notes` | Release notes that were used |

## 💡 Usage Examples

### Example 1: Fully Automated (AI + Latest Build)

```yaml
name: Auto Submit

on:
  push:
    tags:
      - 'v*'

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for AI
      
      - uses: unfoldingcx/appstoreconnect-api@v1
        with:
          issuer-id: ${{ secrets.ASC_ISSUER_ID }}
          key-id: ${{ secrets.ASC_KEY_ID }}
          private-key: ${{ secrets.ASC_PRIVATE_KEY }}
          app-id: ${{ secrets.APP_ID }}
          build-id: 'latest'
          version: ${{ github.ref_name }}  # Uses git tag
          ai-release-notes: true
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          locale: 'en-US'
```

### Example 2: Manual Release Notes

```yaml
- uses: unfoldingcx/appstoreconnect-api@v1
  with:
    issuer-id: ${{ secrets.ASC_ISSUER_ID }}
    key-id: ${{ secrets.ASC_KEY_ID }}
    private-key: ${{ secrets.ASC_PRIVATE_KEY }}
    app-id: ${{ secrets.APP_ID }}
    build-id: ${{ github.event.inputs.build_id }}
    version: ${{ github.event.inputs.version }}
    release-notes: 'Bug fixes and performance improvements.'
    locale: 'pt-BR'
```

### Example 3: Multi-Locale (Multiple Jobs)

```yaml
name: Submit Multi-Locale

on:
  workflow_dispatch:
    inputs:
      version:
        required: true

jobs:
  submit-en:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: unfoldingcx/appstoreconnect-api@v1
        with:
          issuer-id: ${{ secrets.ASC_ISSUER_ID }}
          key-id: ${{ secrets.ASC_KEY_ID }}
          private-key: ${{ secrets.ASC_PRIVATE_KEY }}
          app-id: ${{ secrets.APP_ID }}
          build-id: 'latest'
          version: ${{ inputs.version }}
          locale: 'en-US'
          ai-release-notes: true
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
  
  # Note: App Store Connect allows one submission at a time
  # This is just an example - in practice, you'd update different localizations
```

### Example 4: Specific Build with AI Notes

```yaml
- uses: unfoldingcx/appstoreconnect-api@v1
  with:
    issuer-id: ${{ secrets.ASC_ISSUER_ID }}
    key-id: ${{ secrets.ASC_KEY_ID }}
    private-key: ${{ secrets.ASC_PRIVATE_KEY }}
    app-id: ${{ secrets.APP_ID }}
    build-id: '27c6cafd-aeca-4beb-b045-23bfaf72ab2c'
    version: '1.0.0'
    ai-release-notes: true
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    since-days: 14  # Last 2 weeks of commits
```

### Example 5: Using Outputs

```yaml
- uses: unfoldingcx/appstoreconnect-api@v1
  id: submit
  with:
    issuer-id: ${{ secrets.ASC_ISSUER_ID }}
    key-id: ${{ secrets.ASC_KEY_ID }}
    private-key: ${{ secrets.ASC_PRIVATE_KEY }}
    app-id: ${{ secrets.APP_ID }}
    build-id: 'latest'
    version: '1.0.0'
    ai-release-notes: true
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}

- name: Show what was submitted
  run: |
    echo "Submitted build: ${{ steps.submit.outputs.build-id }}"
    echo "Release notes: ${{ steps.submit.outputs.release-notes }}"
```

## 🔐 Security Best Practices

1. **Always use GitHub Secrets** for credentials - never hardcode them
2. **Use environment protection rules** for production workflows
3. **Limit workflow permissions** to minimum required
4. **Review workflow logs** but be careful - they may contain sensitive data
5. **Rotate API keys regularly**

## 🐛 Troubleshooting

### Action fails with "No VALID builds found"

**Cause:** `build-id: latest` was used but no VALID builds exist

**Solution:**
- Upload a build to TestFlight first
- Wait for build processing to complete
- Or specify a specific build ID instead of `latest`

### Action fails with "OpenAI API key required"

**Cause:** `ai-release-notes: true` but `openai-api-key` not provided

**Solution:**
- Add `OPENAI_API_KEY` to GitHub Secrets
- Pass it to the action: `openai-api-key: ${{ secrets.OPENAI_API_KEY }}`

### Action fails with "No commits found"

**Cause:** Using AI release notes but no commits since last published build

**Solution:**
- Add `since-days: 14` to look back further
- Or provide manual release notes instead

## 📚 More Information

- [Full Documentation](https://github.com/unfoldingcx/appstoreconnect-api)
- [CLI Documentation](https://github.com/unfoldingcx/appstoreconnect-api#-cli-usage)
- [AI Release Notes Guide](https://github.com/unfoldingcx/appstoreconnect-api/blob/main/AI_RELEASE_NOTES.md)

## 🤝 Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/unfoldingcx/appstoreconnect-api/issues)!

---

**Made with ❤️ for the iOS/macOS developer community**

