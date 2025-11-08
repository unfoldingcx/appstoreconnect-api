/**
 * Basic Usage Example
 * 
 * This example shows how to submit an app to Apple App Review
 * using the @unfoldingcx/appstoreconnect-api library.
 */

import { submitToAppReview } from '../src/index'

async function main() {
  try {
    await submitToAppReview({
      // Your App Store Connect API credentials
      issuerId: 'your-issuer-id-here',        // Get from https://appstoreconnect.apple.com/access/integrations/api
      keyId: 'your-key-id-here',              // 10-character key ID
      privateKeyPath: './keys/AuthKey.p8',    // Path to your .p8 file

      // Your app details
      appId: 'your-app-id-here',              // Numeric app ID from App Store Connect
      buildId: 'your-build-id-here',          // Build UUID from TestFlight

      // Version information
      versionString: '1.0.0',                 // Must match your app's version
      platform: 'IOS',                        // IOS, MACOS, or TVOS

      // Release notes
      releaseNotes: 'Bug fixes and performance improvements.',
      locale: 'en-US'                         // Must match a locale configured in App Store Connect
    })

    console.log('✅ Successfully submitted to App Review!')
  } catch (error: any) {
    console.error('❌ Submission failed:', error.message)
    process.exit(1)
  }
}

main()

