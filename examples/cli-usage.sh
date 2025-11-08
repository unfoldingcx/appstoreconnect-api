#!/bin/bash

# Example: CLI Usage for App Store Connect API
#
# This script demonstrates how to use the asca CLI tool
# to submit apps to Apple App Review from the command line.

# Prerequisites:
# 1. Install globally: npm install -g @unfoldingcx/appstoreconnect-api
# 2. Have your .p8 file ready
# 3. Know your credentials

# ==============================================================================
# Method 1: Using command-line arguments (all credentials inline)
# ==============================================================================

echo "Method 1: Using command-line arguments"
asca submit \
  --issuer-id "415d0cda-7a87-4d29-a982-14b67efae93b" \
  --key-id "RB5XWU46WG" \
  --key-path "./keys/AuthKey.p8" \
  --app-id "6461211731" \
  --build-id "27c6cafd-aeca-4beb-b045-23bfaf72ab2c" \
  --version "1.0.0" \
  --platform "IOS" \
  --release-notes "Bug fixes and performance improvements" \
  --locale "en-US"

# ==============================================================================
# Method 2: Using environment variables (more secure)
# ==============================================================================

echo "Method 2: Using environment variables"

# Set credentials once
export ASC_ISSUER_ID="415d0cda-7a87-4d29-a982-14b67efae93b"
export ASC_KEY_ID="RB5XWU46WG"
export ASC_KEY_PATH="./keys/AuthKey.p8"
export APP_ID="6461211731"
export BUILD_ID="27c6cafd-aeca-4beb-b045-23bfaf72ab2c"

# Now submit with shorter command
asca submit \
  --version "1.0.0" \
  --platform "IOS" \
  --release-notes "Bug fixes and performance improvements" \
  --locale "en-US"

# ==============================================================================
# Method 3: List available builds first, then submit
# ==============================================================================

echo "Method 3: List builds and submit"

# List the last 5 builds
asca builds --app-id "6461211731" --limit 5

# Submit a specific build
asca submit \
  --build-id "27c6cafd-aeca-4beb-b045-23bfaf72ab2c" \
  --version "1.0.0" \
  --release-notes "Bug fixes"

# ==============================================================================
# Method 4: Cancel pending submissions before submitting new one
# ==============================================================================

echo "Method 4: Cancel then submit"

# Cancel any pending submissions
asca cancel --app-id "6461211731"

# Then submit new build
asca submit \
  --build-id "27c6cafd-aeca-4beb-b045-23bfaf72ab2c" \
  --version "1.0.1" \
  --release-notes "Major update with new features"

# ==============================================================================
# Method 5: Using with CI/CD (GitHub Actions example)
# ==============================================================================

echo "Method 5: CI/CD Integration"

# In your CI/CD pipeline, credentials should be in secrets
# Example for GitHub Actions:

# export ASC_ISSUER_ID="${{ secrets.ASC_ISSUER_ID }}"
# export ASC_KEY_ID="${{ secrets.ASC_KEY_ID }}"
# echo "${{ secrets.ASC_PRIVATE_KEY }}" > AuthKey.p8
# export ASC_KEY_PATH="./AuthKey.p8"
# export APP_ID="${{ secrets.APP_ID }}"

# asca submit \
#   --build-id "$BUILD_ID" \
#   --version "$VERSION" \
#   --release-notes "$RELEASE_NOTES"

# ==============================================================================
# Other useful commands
# ==============================================================================

# Show help
asca --help
asca submit --help
asca builds --help
asca cancel --help

# Show version
asca --version

# ==============================================================================
# Tips:
# ==============================================================================

# 1. Store credentials in environment variables or a .env file
# 2. Never commit your .p8 file to git
# 3. Use CI/CD secrets for automation
# 4. Check builds status before submitting: asca builds --app-id YOUR_APP_ID
# 5. The CLI uses the same intelligent error recovery as the API

