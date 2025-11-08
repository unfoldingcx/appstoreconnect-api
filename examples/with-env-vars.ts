/**
 * Environment Variables Example
 * 
 * This example shows how to use environment variables for configuration,
 * which is ideal for CI/CD pipelines and keeping credentials secure.
 * 
 * Required Environment Variables:
 * - ASC_ISSUER_ID: Your App Store Connect Issuer ID
 * - ASC_KEY_ID: Your App Store Connect Key ID
 * - ASC_KEY_PATH: Path to your .p8 private key file
 * - APP_ID: Your app's unique identifier
 * - BUILD_ID: Build UUID to submit
 * - VERSION_STRING: Version string (e.g., "1.0.0")
 * - RELEASE_NOTES: Release notes text (optional)
 * - LOCALE: Locale for release notes (optional, defaults to "en-US")
 * - PLATFORM: Platform (optional, defaults to "IOS")
 */

import { submitToAppReview } from '../src/index'

// Validate required environment variables
const requiredEnvVars = [
  'ASC_ISSUER_ID',
  'ASC_KEY_ID',
  'ASC_KEY_PATH',
  'APP_ID',
  'BUILD_ID',
  'VERSION_STRING'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => console.error(`   - ${varName}`))
  process.exit(1)
}

async function main() {
  console.log('🚀 Starting App Store submission with environment variables...\n')

  try {
    await submitToAppReview({
      issuerId: process.env.ASC_ISSUER_ID!,
      keyId: process.env.ASC_KEY_ID!,
      privateKeyPath: process.env.ASC_KEY_PATH!,
      appId: process.env.APP_ID!,
      buildId: process.env.BUILD_ID!,
      versionString: process.env.VERSION_STRING!,
      platform: (process.env.PLATFORM as 'IOS' | 'MACOS' | 'TVOS') || 'IOS',
      releaseNotes: process.env.RELEASE_NOTES || 'Bug fixes and performance improvements.',
      locale: process.env.LOCALE || 'en-US'
    })

    console.log('\n✅ 🎉 Successfully submitted to App Review!')
  } catch (error: any) {
    console.error('\n❌ Submission failed:', error.message)
    process.exit(1)
  }
}

main()

