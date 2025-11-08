#!/bin/bash

# Example: Using the AI Release Notes CLI Command
#
# This script demonstrates how to use the `asca release-notes` (or `asca rn`) 
# command to generate AI-powered release notes from git commits.

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  AI Release Notes Generator - CLI Examples                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ==============================================================================
# Prerequisites Check
# ==============================================================================

echo "✓ Checking prerequisites..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  echo "❌ Not a git repository. Please run from inside a git repo."
  exit 1
fi
echo "  ✓ Git repository detected"

# Check if asca is installed
if ! command -v asca &> /dev/null; then
  echo "  ⚠️  'asca' command not found. Run: npm install -g @unfoldingcx/appstoreconnect-api"
  echo "     Or use: bun run src/cli.ts release-notes ..."
  echo ""
fi

echo ""

# ==============================================================================
# Method 1: Using config file (recommended)
# ==============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "Method 1: Using saved config"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "First, run 'asca config' to save your credentials, then:"
echo ""

# Example with just locale
echo "$ asca release-notes --locale \"en-US\""
echo ""
# Uncomment to actually run:
# asca release-notes --locale "en-US"

# ==============================================================================
# Method 2: Using the short alias
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 2: Using short alias 'rn'"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Example with short alias
echo "$ asca rn --locale \"pt-BR\""
echo ""
# Uncomment to actually run:
# asca rn --locale "pt-BR"

# ==============================================================================
# Method 3: Last N days
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 3: Generate from last 7 days"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "$ asca rn --since-days 7 --locale \"es-ES\""
echo ""
# Uncomment to actually run:
# asca rn --since-days 7 --locale "es-ES"

# ==============================================================================
# Method 4: With environment variables
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 4: Using environment variables"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Set credentials in environment
export ASC_ISSUER_ID="${ASC_ISSUER_ID:-your-issuer-id}"
export ASC_KEY_ID="${ASC_KEY_ID:-your-key-id}"
export ASC_KEY_PATH="${ASC_KEY_PATH:-./keys/AuthKey.p8}"
export APP_ID="${APP_ID:-your-app-id}"
export OPENAI_API_KEY="${OPENAI_API_KEY:-your-openai-key}"

echo "$ export ASC_ISSUER_ID=\"xxx\""
echo "$ export ASC_KEY_ID=\"yyy\""
echo "$ export ASC_KEY_PATH=\"./keys/AuthKey.p8\""
echo "$ export APP_ID=\"123456\""
echo "$ export OPENAI_API_KEY=\"sk-...\""
echo ""
echo "$ asca rn --locale \"fr-FR\""
echo ""
# Uncomment to actually run:
# asca rn --locale "fr-FR"

# ==============================================================================
# Method 5: All arguments inline
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 5: All credentials as command-line arguments"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
$ asca release-notes \
  --issuer-id "your-issuer-id" \
  --key-id "your-key-id" \
  --key-path "./keys/AuthKey.p8" \
  --app-id "123456" \
  --openai-key "sk-..." \
  --locale "de-DE" \
  --since-days 14
EOF
echo ""

# ==============================================================================
# Method 6: Different git repository
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 6: Specify different git repository"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "$ asca rn --git-path \"/path/to/other/repo\" --locale \"ja-JP\""
echo ""

# ==============================================================================
# Method 7: Save to file for later use
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 7: Save to file and use in submission"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
# Generate and save to file
$ asca rn --locale "en-US" > release-notes.txt

# Review the file
$ cat release-notes.txt

# Use in submission (copy from file)
$ asca submit \
  --build-id "abc-123" \
  --version "1.0.0" \
  --release-notes "$(cat release-notes.txt | grep -v '^[═─]' | grep -v '^$')"
EOF
echo ""

# ==============================================================================
# Method 8: Multiple locales in sequence
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Method 8: Generate for multiple locales"
echo "═══════════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
#!/bin/bash
# Generate for all your app's locales

for locale in "en-US" "pt-BR" "es-ES" "fr-FR"; do
  echo "Generating for $locale..."
  asca rn --locale "$locale" > "notes-$locale.txt"
  echo "Saved to notes-$locale.txt"
  echo ""
done
EOF
echo ""

# ==============================================================================
# Tips and Best Practices
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "💡 Tips and Best Practices"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1. Run 'asca config' first to save your credentials"
echo "2. Always preview notes before using them in submission"
echo "3. Use clear, descriptive commit messages for better results"
echo "4. The command won't submit anything - it's preview only"
echo "5. Cost per generation is typically < $0.01 (using gpt-4o-mini)"
echo "6. Check character count - App Store limit is 4000 characters"
echo ""

# ==============================================================================
# Available Commands
# ==============================================================================

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📚 Related Commands"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  asca config           - Set up credentials (includes OpenAI)"
echo "  asca config --show    - View saved config"
echo "  asca rn --help        - Show help for release-notes command"
echo "  asca builds           - List available builds"
echo "  asca submit           - Submit to App Review"
echo ""

echo "✨ Happy automating with AI! 🤖"

