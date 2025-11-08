#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# The Ultimate One-Liner: Submit to App Review
# ═══════════════════════════════════════════════════════════════════════
#
# This example shows the most convenient way to submit your app:
# - Auto-find latest VALID build
# - Auto-generate release notes with AI
# - Submit everything in one command
#
# NO BUILD IDS TO REMEMBER. NO RELEASE NOTES TO WRITE. ✨

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   The Ultimate One-Liner: App Store Submission           ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════════════
# Step 1: One-Time Setup
# ═══════════════════════════════════════════════════════════════════════

echo "📋 Step 1: One-Time Setup"
echo ""
echo "Run this ONCE to save your credentials:"
echo ""
echo "  $ asca config"
echo ""
echo "This will save:"
echo "  • App Store Connect credentials (Issuer ID, Key ID, .p8 path)"
echo "  • Default App ID"
echo "  • OpenAI API key"
echo "  • Default locale and platform"
echo ""
echo "All saved to: ~/.config/asca.json"
echo ""

# ═══════════════════════════════════════════════════════════════════════
# Step 2: The Magic Command
# ═══════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 2: The Magic Command (After config is set)"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "After setup, this is ALL you need to submit:"
echo ""
echo "  $ asca submit --build-id latest --version \"1.0.0\" --ai-release-notes"
echo ""
echo "Or even shorter:"
echo ""
echo "  $ asca submit --build-id latest --version \"1.0.0\" --ai-release-notes"
echo ""

# ═══════════════════════════════════════════════════════════════════════
# What Happens When You Run It
# ═══════════════════════════════════════════════════════════════════════

cat << 'EOF'

═══════════════════════════════════════════════════════════
💡 What This Command Does Automatically:
═══════════════════════════════════════════════════════════

🚀 Starting App Store submission...

🔍 Fetching latest VALID build...

✅ Using latest VALID build: 203
   Build ID: abc-123-def-456
   Uploaded: 11/8/2025, 10:30:00 AM

🤖 Generating release notes with AI...

🔍 Fetching last published build from App Store (not TestFlight)...
✅ Found published build: 201
   Version: 25.11.01
   Build uploaded: 11/1/2025, 3:45:00 PM
   Status: READY_FOR_SALE (live in App Store)

📝 Fetching git commits since 11/1/2025...
✅ Found 45 commit(s)

📋 Commits Summary:
  a1b2c3d 11/7/2025 - Add dark mode support
  b2c3d4e 11/6/2025 - Fix critical login bug
  c3d4e5f 11/5/2025 - Improve performance
  d4e5f6g 11/4/2025 - Add new feature
  ... and 41 more

🤖 Generating release notes with OpenAI for locale pt-BR...
✅ Release notes generated successfully!

📝 Generated Release Notes:
────────────────────────────────────────────────────────────
• Adicionado modo escuro para melhor visualização noturna
• Corrigido problema crítico que impedia o login
• Melhorias significativas de desempenho
• Nova funcionalidade de compartilhamento
• Correções de bugs e melhorias gerais
────────────────────────────────────────────────────────────

Characters: 234/4000
Based on 45 commit(s)

📱 Step 1: Creating/Getting App Store Version 1.0.0...
✅ Created new version: xxx-yyy-zzz

🔗 Step 2: Associating build abc-123-def-456 with version...
✅ Build associated successfully

📝 Step 3: Updating release notes for locale pt-BR...
✅ Release notes updated for pt-BR

🚀 Step 4: Creating review submission...
✅ Created submission: zzz-yyy-xxx

➕ Step 5: Adding version to submission...
✅ Version added to submission

✈️  Step 6: Submitting to App Review...

✅ 🎉 Successfully submitted to App Review!

EOF

# ═══════════════════════════════════════════════════════════════════════
# Variations
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎨 Variations"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
# Different locale
$ asca submit --build-id latest --version "1.0.0" --ai-release-notes --locale "es-ES"

# Custom date range (last 7 days of commits)
$ asca submit --build-id latest --version "1.0.0" --ai-release-notes --since-days 7

# Different platform
$ asca submit --build-id latest --version "1.0.0" --ai-release-notes --platform "MACOS"

# With environment variables (no config file)
export ASC_ISSUER_ID="xxx"
export ASC_KEY_ID="yyy"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="123456"
export OPENAI_API_KEY="sk-..."

$ asca submit --build-id latest --version "1.0.0" --ai-release-notes
EOF

# ═══════════════════════════════════════════════════════════════════════
# Safety: Preview First
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🛡️  Safer Approach: Preview First"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
If you want to review the AI-generated notes before submitting:

# Step 1: Preview the notes
$ asca rn --locale "pt-BR"

# Step 2: Review the output...

# Step 3: If happy, submit with latest build
$ asca submit --build-id latest --version "1.0.0" --ai-release-notes

# OR submit with the same notes you just reviewed
$ asca submit --build-id latest --version "1.0.0" --release-notes "..."
EOF

# ═══════════════════════════════════════════════════════════════════════
# The Power Combo
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "⚡ The Power Combo"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
Combine all the automation features:

$ asca submit --build-id latest --version "1.0.0" --ai-release-notes

What this does:
  ✓ Automatically finds latest VALID build (no need to remember IDs)
  ✓ Fetches commits since last published App Store version
  ✓ Generates beautiful, localized release notes with AI
  ✓ Handles conflicts (cancels pending submissions if needed)
  ✓ Submits to App Review

All in ONE command. From git commits to App Review in seconds! 🚀

Cost: ~$0.01 per submission (OpenAI gpt-4o-mini)
Time: ~30 seconds total
Manual work: ZERO ✨
EOF

echo ""
echo ""
echo "✨ Happy automating! 🤖"

