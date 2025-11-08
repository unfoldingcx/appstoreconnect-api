/**
 * Auto-Discover Build Example
 * 
 * This example shows how to automatically find and submit
 * the latest valid build without manually specifying a build ID.
 */

import { getBuilds, formatBuildInfo, submitToAppReview } from '../src/index'

async function main() {
  const jwtOptions = {
    issuerId: 'your-issuer-id-here',
    keyId: 'your-key-id-here',
    privateKeyPath: './keys/AuthKey.p8'
  }

  const appId = 'your-app-id-here'

  console.log('🔍 Fetching available builds...\n')

  // Get the last 10 builds
  const builds = await getBuilds(appId, jwtOptions, 10)

  if (builds.length === 0) {
    console.error('❌ No builds found. Please upload a build to TestFlight first.')
    process.exit(1)
  }

  // Display all builds
  console.log(`📋 Found ${builds.length} build(s):\n`)
  builds.forEach((build, index) => {
    console.log(`${index + 1}. ${formatBuildInfo(build)}\n`)
  })

  // Find the latest VALID build
  const latestValidBuild = builds.find(b => b.attributes.processingState === 'VALID')

  if (!latestValidBuild) {
    console.error('❌ No valid builds found. Please wait for your build to finish processing.')
    process.exit(1)
  }

  console.log(`✅ Using latest valid build: ${latestValidBuild.attributes.version}\n`)

  // Submit to App Review
  try {
    await submitToAppReview({
      ...jwtOptions,
      appId,
      buildId: latestValidBuild.id,
      versionString: latestValidBuild.attributes.version,
      platform: 'IOS',
      releaseNotes: 'Bug fixes and performance improvements.',
      locale: 'en-US'
    })

    console.log('\n✅ 🎉 Successfully submitted to App Review!')
  } catch (error: any) {
    console.error('\n❌ Submission failed:', error.message)
    process.exit(1)
  }
}

main()

