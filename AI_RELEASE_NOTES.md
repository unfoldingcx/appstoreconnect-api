# 🤖 AI-Powered Release Notes Generator

Automatically generate beautiful, localized release notes from your git commits using OpenAI.

## 🎯 Overview

The AI Release Notes Generator analyzes your git commit history and creates user-friendly release notes in any language. It:

1. 📱 Fetches your last **published** build from App Store Connect (READY_FOR_SALE status - live in the App Store, not just TestFlight)
2. 📝 Gets all commits since that build was uploaded
3. 🤖 Uses OpenAI to generate professional, localized release notes
4. ✅ Outputs formatted preview ready for App Store

**Important:** This tool fetches the last build that's actually **live in the App Store** (approved and available to users), not just the most recent TestFlight build. This ensures your release notes only cover changes since the last public release.

## 🚀 Quick Start

### CLI Usage (Preview Only)

The easiest way to generate release notes is using the CLI:

```bash
# Generate notes in English
asca release-notes --locale "en-US"

# Or use the short alias
asca rn --locale "pt-BR"

# Generate from last 7 days instead of last build
asca rn --since-days 7 --locale "es-ES"
```

**Output:**
```
══════════════════════════════════════════════════════════════════

📋 Release Notes Preview

Locale: pt-BR
Commits analyzed: 23
Since: 11/1/2025
Last build: 1.0.5

──────────────────────────────────────────────────────────────────
• Adicionado suporte ao modo escuro
• Corrigido problema crítico no login
• Melhorias de desempenho e estabilidade
• Correções de bugs menores
──────────────────────────────────────────────────────────────────

Characters: 156/4000

✅ Preview complete!
Use these notes with asca submit --release-notes "..." when ready
```

### Library Usage

Use in your TypeScript/JavaScript code:

```typescript
import { generateAIReleaseNotes } from '@unfoldingcx/appstoreconnect-api/ai-release-notes'

const result = await generateAIReleaseNotes({
  credentials: {
    issuerId: process.env.ASC_ISSUER_ID!,
    keyId: process.env.ASC_KEY_ID!,
    privateKeyPath: './keys/AuthKey.p8'
  },
  appId: process.env.APP_ID!,
  locale: 'pt-BR',
  openaiApiKey: process.env.OPENAI_API_KEY!,
  openaiOrgId: process.env.OPENAI_ORG_ID, // optional
})

console.log(result.releaseNotes)
// Use result.releaseNotes in your submission
```

## 🔧 Configuration

### Option 1: Use Config File (Recommended)

Save your credentials once:

```bash
asca config
```

Then just run:

```bash
asca rn --locale "en-US"
```

### Option 2: Environment Variables

```bash
export ASC_ISSUER_ID="your-issuer-id"
export ASC_KEY_ID="your-key-id"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="your-app-id"
export OPENAI_API_KEY="sk-..."
export OPENAI_ORG_ID="org-..." # optional

asca rn --locale "pt-BR"
```

### Option 3: Command-Line Arguments

```bash
asca release-notes \
  --issuer-id "xxx" \
  --key-id "yyy" \
  --key-path "./keys/AuthKey.p8" \
  --app-id "123456" \
  --openai-key "sk-..." \
  --locale "en-US"
```

## 📋 Available Options

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--locale` | Target language for notes | en-US |
| `--since-days` | Use commits from last N days | Last build date |
| `--git-path` | Path to git repository | Current directory |
| `--openai-key` | OpenAI API key | From config/env |
| `--openai-org` | OpenAI Organization ID | From config/env |

### Library Options

```typescript
interface GenerateReleaseNotesOptions {
  credentials: JWTCredentials       // App Store Connect credentials
  appId: string                     // Your app ID
  gitRepoPath?: string              // Git repo path (default: cwd)
  locale?: string                   // Target locale (default: 'en-US')
  openaiApiKey: string              // OpenAI API key (required)
  openaiOrgId?: string              // OpenAI Org ID (optional)
  maxCommits?: number               // Max commits to analyze (default: 100)
  sinceDate?: Date                  // Override: use specific date
  sinceDays?: number                // Override: use last N days
}
```

## 🌍 Supported Languages

The generator supports 25+ languages including:

- 🇺🇸 English (en-US, en-GB)
- 🇧🇷 Portuguese (pt-BR, pt-PT)
- 🇪🇸 Spanish (es-ES, es-MX)
- 🇫🇷 French (fr-FR)
- 🇩🇪 German (de-DE)
- 🇮🇹 Italian (it-IT)
- 🇯🇵 Japanese (ja-JP)
- 🇰🇷 Korean (ko-KR)
- 🇨🇳 Chinese (zh-CN, zh-TW)
- 🇷🇺 Russian (ru-RU)
- 🇸🇦 Arabic (ar-SA)
- 🇳🇱 Dutch (nl-NL)
- 🇸🇪 Swedish (sv-SE)
- 🇩🇰 Danish (da-DK)
- 🇫🇮 Finnish (fi-FI)
- 🇳🇴 Norwegian (no-NO)
- 🇵🇱 Polish (pl-PL)
- 🇹🇷 Turkish (tr-TR)
- 🇹🇭 Thai (th-TH)
- 🇻🇳 Vietnamese (vi-VN)
- 🇮🇩 Indonesian (id-ID)
- 🇲🇾 Malay (ms-MY)

And more!

## 🎨 How It Works

### 1. Fetch Last Published Build

```typescript
const lastBuild = await getLastPublishedBuild(appId, credentials)
// Returns: Build from last READY_FOR_SALE version
// { version: "1.0.5", uploadedDate: "2025-11-01T..." }

// If no published version exists yet (first release):
// Returns: undefined
// → Will default to last 30 days of commits
```

**Note:** This fetches the build from the last version that's **READY_FOR_SALE** in the App Store (live and available to users), not just the latest TestFlight build. This ensures your release notes only include changes since the last public release.

### 2. Get Git Commits

```typescript
const commits = await getGitCommitsSince(
  './',
  new Date(lastBuild.attributes.uploadedDate)
)
// Returns: Array of commits with hash, date, message, author
```

### 3. Generate with AI

```typescript
const notes = await generateReleaseNotesWithAI(
  commits,
  'pt-BR',
  'sk-...'
)
// Returns: "• Correções de bugs\n• Melhorias de desempenho\n..."
```

## 💡 Usage Examples

### Example 1: Basic CLI Usage

```bash
# Set up config once
asca config

# Generate notes anytime
asca rn --locale "en-US"
```

### Example 2: Multiple Locales

Generate notes for multiple app store locales:

```bash
# English
asca rn --locale "en-US" > notes-en.txt

# Brazilian Portuguese  
asca rn --locale "pt-BR" > notes-pt.txt

# Spanish
asca rn --locale "es-ES" > notes-es.txt
```

### Example 3: Last 14 Days

```bash
# Get commits from last 2 weeks
asca rn --since-days 14 --locale "fr-FR"
```

### Example 4: Programmatic Usage

```typescript
import { generateAIReleaseNotes } from '@unfoldingcx/appstoreconnect-api/ai-release-notes'

async function generateMultiLocaleNotes() {
  const locales = ['en-US', 'pt-BR', 'es-ES', 'fr-FR']
  const notes: Record<string, string> = {}

  for (const locale of locales) {
    const result = await generateAIReleaseNotes({
      credentials: {
        issuerId: process.env.ASC_ISSUER_ID!,
        keyId: process.env.ASC_KEY_ID!,
        privateKeyPath: './keys/AuthKey.p8'
      },
      appId: process.env.APP_ID!,
      locale,
      openaiApiKey: process.env.OPENAI_API_KEY!,
      sinceDays: 7
    })
    
    notes[locale] = result.releaseNotes
  }

  return notes
}

const allNotes = await generateMultiLocaleNotes()
console.log('English:', allNotes['en-US'])
console.log('Portuguese:', allNotes['pt-BR'])
```

### Example 5: CI/CD Integration

```yaml
- name: Generate Release Notes
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  run: |
    asca rn --locale "en-US" > release-notes.txt
    NOTES=$(cat release-notes.txt)
    echo "RELEASE_NOTES=$NOTES" >> $GITHUB_ENV

- name: Submit with Generated Notes
  run: |
    asca submit \
      --build-id "$BUILD_ID" \
      --version "$VERSION" \
      --release-notes "$RELEASE_NOTES"
```

## 🎯 Best Practices

### 1. Commit Message Quality

For best AI-generated notes, use clear commit messages:

✅ **Good:**
- "Add dark mode support"
- "Fix crash on login screen"
- "Improve loading performance by 40%"

❌ **Bad:**
- "wip"
- "fix stuff"
- "asdf"

### 2. Locale Selection

Choose the locale that matches your App Store Connect localization:

```bash
asca rn --locale "pt-BR"  # Brazilian Portuguese
asca rn --locale "pt-PT"  # European Portuguese
```

### 3. Date Range

- **Default**: Uses last published build date (recommended)
- **--since-days 7**: Last week of changes
- **--since-days 30**: Last month of changes

### 4. Review Before Submit

**Always preview the generated notes** before submitting to App Store:

```bash
# Step 1: Generate and review
asca rn --locale "en-US"

# Step 2: If satisfied, copy and use in submission
asca submit --build-id "..." --version "1.0.0" --release-notes "..."
```

## 🔐 OpenAI API Key

### Get Your API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-...`)
4. Save it in your config: `asca config`

### Pricing

The generator uses `gpt-4o-mini` which is extremely cost-effective:
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Average cost per generation: **< $0.01**

### Rate Limits

OpenAI has rate limits. For high-volume usage:
- Add delays between requests
- Use different API keys
- Upgrade to higher tier

## 🐛 Troubleshooting

### "Not a git repository"

**Solution:** Run the command from inside your git repository, or use `--git-path`:

```bash
asca rn --git-path "/path/to/your/repo" --locale "en-US"
```

### "No commits found"

This happens when:
1. Your last published build is very recent (within hours/days)
2. You haven't made commits since the last published version
3. The git repository doesn't have commits in that date range

**Solution:** Use `--since-days` to look back further:

```bash
# Look back 7 days
asca rn --since-days 7 --locale "en-US"

# Look back 30 days
asca rn --since-days 30 --locale "en-US"
```

**Note:** The tool fetches the last **READY_FOR_SALE** (published) version, not just the last TestFlight build. If you recently submitted a build but it's not approved/published yet, use `--since-days` to include those commits.

### "OpenAI API error"

**Solution:**
- Check your API key is valid
- Verify you have credits/billing set up
- Check rate limits

### "Failed to fetch builds"

**Solution:**
- Verify App Store Connect credentials
- Check that builds exist for your app
- Use `asca builds` to verify

## 📚 API Functions

See [`src/ai-release-notes.ts`](src/ai-release-notes.ts) for all exported functions:

- `generateAIReleaseNotes()` - Main orchestrator
- `getLastPublishedBuild()` - Fetch last build from App Store Connect
- `getGitCommitsSince()` - Get commits from git history
- `generateReleaseNotesWithAI()` - Call OpenAI API
- `isGitRepository()` - Check if directory is a git repo
- `formatCommitsForAI()` - Format commits for AI processing

## 🎬 Complete Example

See [`examples/ai-release-notes-example.ts`](examples/ai-release-notes-example.ts) for:
- 5 complete working examples
- Different use cases and patterns
- Manual step-by-step workflow
- Multiple locales generation

## 🔮 Future Enhancements

Planned features:
- Automatic integration with `asca submit --auto-notes`
- Customize AI prompt/style
- Support for custom AI models
- Changelog generation
- Release notes templates

---

**Happy automating! 🚀**

