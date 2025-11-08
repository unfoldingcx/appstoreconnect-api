#!/bin/bash

# Example: Submit to App Review with AI-Generated Release Notes
#
# This demonstrates the powerful --ai-release-notes flag that generates
# release notes from git commits and submits in one command.

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Submit with AI-Generated Release Notes                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ==============================================================================
# Prerequisites
# ==============================================================================

echo "Prerequisites:"
echo "  1. ✓ Git repository with commit history"
echo "  2. ✓ App Store Connect credentials configured"
echo "  3. ✓ OpenAI API key configured"
echo "  4. ✓ Build uploaded to TestFlight"
echo ""

# ==============================================================================
# Method 1: Submit with AI notes (using config)
# ==============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "Method 1: Using saved config (recommended)"
echo "═══════════════════════════════════════════════════════════"
echo ""

# First time setup
echo "# One-time setup (save all credentials including OpenAI):"
echo "$ asca config"
echo ""

# Then submit with AI notes anytime
echo "# Submit with auto-generated notes:"
echo "$ asca submit --build-id \"abc-123\" --version \"1.0.0\" --ai-release-notes"
echo ""

# Example output:
cat << 'EOF'
Expected output:

🚀 Starting App Store submission...

🤖 Generating release notes with AI...

🔍 Fetching last published build from App Store (not TestFlight)...
✅ Found published build: 1.0.0
   Version: 1.0.0
   Build uploaded: 10/15/2025, 3:45:00 PM
   Status: READY_FOR_SALE (live in App Store)

📝 Fetching git commits since 10/15/2025...
✅ Found 23 commit(s)

📋 Commits Summary:
  a1b2c3d 11/5/2025 - Add dark mode support
  d4e5f6g 11/4/2025 - Fix login bug
  ... and 21 more

🤖 Generating release notes with OpenAI for locale en-US...
✅ Release notes generated successfully!

📝 Generated Release Notes:
────────────────────────────────────────────────────────────
• Added dark mode for better nighttime viewing
• Fixed critical login issue affecting some users
• Improved app performance and stability
• Various bug fixes and enhancements
────────────────────────────────────────────────────────────

Characters: 178/4000
Based on 23 commit(s)

📱 Step 1: Creating/Getting App Store Version 1.0.0...
✅ Created new version: xxx-yyy-zzz
...
EOF

echo ""

# ==============================================================================
# Method 2: Submit with custom date range
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 2: Submit with custom date range"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
# If you want commits from last 7 days instead of since last published build:
$ asca submit \
  --build-id "abc-123" \
  --version "1.0.1" \
  --ai-release-notes \
  --since-days 7 \
  --locale "pt-BR"

# Or last 30 days:
$ asca submit \
  --build-id "abc-123" \
  --version "1.0.1" \
  --ai-release-notes \
  --since-days 30
EOF

echo ""

# ==============================================================================
# Method 3: Submit with different locale
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 3: Different locales"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
# English
$ asca submit --build-id "abc" --version "1.0.0" --ai-release-notes --locale "en-US"

# Brazilian Portuguese
$ asca submit --build-id "abc" --version "1.0.0" --ai-release-notes --locale "pt-BR"

# Spanish
$ asca submit --build-id "abc" --version "1.0.0" --ai-release-notes --locale "es-ES"

# French
$ asca submit --build-id "abc" --version "1.0.0" --ai-release-notes --locale "fr-FR"

# Japanese
$ asca submit --build-id "abc" --version "1.0.0" --ai-release-notes --locale "ja-JP"
EOF

echo ""

# ==============================================================================
# Method 4: Environment variables for credentials
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 4: Environment variables"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
# Set credentials once
export ASC_ISSUER_ID="your-issuer-id"
export ASC_KEY_ID="your-key-id"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="123456"
export OPENAI_API_KEY="sk-..."

# Submit with just build and version
$ asca submit --build-id "abc-123" --version "1.0.0" --ai-release-notes

# Even simpler with BUILD_ID in env:
export BUILD_ID="abc-123"
$ asca submit --version "1.0.0" --ai-release-notes
EOF

echo ""

# ==============================================================================
# Method 5: Preview before submit
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 5: Preview first, then submit (safer)"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
# Step 1: Preview the AI-generated notes
$ asca rn --locale "pt-BR"

# Review the output, make sure it looks good...

# Step 2: If satisfied, submit with the same config
$ asca submit \
  --build-id "abc-123" \
  --version "1.0.0" \
  --ai-release-notes \
  --locale "pt-BR"

# OR copy the notes and submit manually:
$ asca submit \
  --build-id "abc-123" \
  --version "1.0.0" \
  --release-notes "• Correções de bugs..."
EOF

echo ""

# ==============================================================================
# Tips
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "💡 Tips"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Preview first with: asca rn --locale \"your-locale\""
echo "2. Use --since-days N if last published build is too recent"
echo "3. Ensure you're in git repository or use --git-path"
echo "4. Set OPENAI_API_KEY in config or env for convenience"
echo "5. The AI uses gpt-4o-mini (fast and cheap, ~\$0.01 per generation)"
echo "6. Generated notes respect 4000 character App Store limit"
echo ""

echo "✨ Happy automating! 🚀"

