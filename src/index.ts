/**
 * App Store Connect API - Automated App Review Submission
 * 
 * A powerful, production-ready TypeScript library for automating Apple App Store Connect submissions.
 * Handles the entire review submission workflow including version management, build association,
 * release notes, and intelligent error recovery with automatic retry mechanisms.
 * 
 * @module appstoreconnect-api
 * @author Your Name
 * @license MIT
 * 
 * @example
 * ```typescript
 * import { submitToAppReview, getBuilds } from 'appstoreconnect-api'
 * 
 * // Submit your app for review
 * await submitToAppReview({
 *   issuerId: 'your-issuer-id',
 *   keyId: 'your-key-id',
 *   privateKeyPath: './AuthKey.p8',
 *   appId: 'your-app-id',
 *   buildId: 'build-id',
 *   versionString: '1.0.0',
 *   platform: 'IOS',
 *   releaseNotes: 'Bug fixes and improvements',
 *   locale: 'en-US'
 * })
 * ```
 */

import * as fs from 'fs/promises'

import axios from 'axios'
import * as jwt from 'jsonwebtoken'

/**
 * Configuration options for App Store Connect API authentication and submission.
 * 
 * To obtain these credentials:
 * 1. Go to https://appstoreconnect.apple.com/access/integrations/api
 * 2. Create an API key with App Manager or Admin role
 * 3. Download the .p8 private key file
 * 4. Note your Issuer ID, Key ID, and App ID
 * 
 * @interface AppStoreConnectOptions
 */
export interface AppStoreConnectOptions {
  /** 
   * Your Issuer ID from App Store Connect API Keys section.
   * Format: UUID (e.g., "415d0cda-7a87-4d29-a982-14b67efae93b")
   */
  issuerId: string;

  /** 
   * Your Key ID from App Store Connect API Keys section.
   * Format: 10-character alphanumeric string (e.g., "RB5XWU46WG")
   */
  keyId: string;

  /** 
   * Absolute or relative path to your .p8 private key file.
   * Example: './keys/AuthKey_RB5XWU46WG.p8'
   */
  privateKeyPath: string;

  /** 
   * Your app's unique identifier.
   * Find this in App Store Connect under App Information.
   * Format: Numeric string (e.g., "6461211731")
   */
  appId: string;

  /** 
   * The build ID to submit for review.
   * Get this from TestFlight or use the getBuilds() function.
   * Format: UUID (e.g., "27c6cafd-aeca-4beb-b045-23bfaf72ab2c")
   */
  buildId: string;

  /** 
   * Version string for the app (e.g., "1.0.0", "2.1.3").
   * Optional if using an existing version that's already been created.
   * Must match the version in your app's Info.plist
   */
  versionString?: string;

  /** 
   * Target platform for the submission.
   * Must match your app's primary platform in App Store Connect.
   */
  platform: 'IOS' | 'MACOS' | 'TVOS';

  /** 
   * Release notes (What's New) text for this version.
   * Will be displayed to users in the App Store.
   * Maximum length: 4000 characters
   */
  releaseNotes: string;

  /** 
   * Locale for the release notes (e.g., 'en-US', 'pt-BR', 'de-DE').
   * Must be a locale that's already configured for your app in App Store Connect.
   * Use the error message to see available locales if incorrect.
   */
  locale: string;
}

/** Base URL for Apple App Store Connect API v1 */
const BASE_URL = 'https://api.appstoreconnect.apple.com/v1'

/**
 * Generates a signed JWT token for App Store Connect API authentication.
 * Uses ES256 algorithm with your private key from the .p8 file.
 * Tokens are valid for 20 minutes as per Apple's specifications.
 * 
 * @private
 * @param options - JWT generation options containing credentials
 * @returns Signed JWT token string
 * @throws {Error} If the private key file cannot be read or is invalid
 */
async function generateJWT(options: { issuerId: string; keyId: string; privateKeyPath: string }): Promise<string> {
  const privateKey = await fs.readFile(options.privateKeyPath, 'utf8')
  const payload = {
    iss: options.issuerId,
    exp: Math.floor(Date.now() / 1000) + 1200, // 20 min
    aud: 'appstoreconnect-v1',
  }
  const signOptions: jwt.SignOptions = {
    algorithm: 'ES256',
    header: { alg: 'ES256', kid: options.keyId, typ: 'JWT' },
  }
  return jwt.sign(payload, privateKey, signOptions)
}

/**
 * Represents a build from App Store Connect.
 * Contains essential information about uploaded builds including their processing state.
 * 
 * @interface Build
 * @example
 * ```typescript
 * const builds = await getBuilds('6461211731', jwtOptions, 10)
 * builds.forEach(build => {
 *   console.log(`Build ${build.attributes.version}: ${build.attributes.processingState}`)
 * })
 * ```
 */
export interface Build {
  /** Unique identifier for the build (UUID format) */
  id: string;

  /** Build attributes containing metadata */
  attributes: {
    /** Version string of the build (e.g., "1.0.0") */
    version: string;

    /** ISO 8601 timestamp of when the build was uploaded */
    uploadedDate: string;

    /** 
     * Current processing state of the build.
     * Common values: "VALID", "PROCESSING", "INVALID", "FAILED"
     * Only "VALID" builds can be submitted for review.
     */
    processingState: string;

    /** ISO 8601 timestamp of when the build expires (90 days from upload) */
    expirationDate?: string;
  };
}

/**
 * Internal HTTP client for App Store Connect API requests.
 * Handles authentication, error parsing, and provides clean error messages.
 * Automatically generates fresh JWT tokens for each request.
 * 
 * @private
 * @param method - HTTP method (GET, POST, PATCH, DELETE)
 * @param endpoint - API endpoint path (e.g., '/apps/123/builds')
 * @param jwtOptions - Authentication credentials
 * @param data - Request body data (for POST/PATCH requests)
 * @param params - URL query parameters
 * @returns API response data
 * @throws {Error} Enhanced error with status code, endpoint, and Apple's error details
 */
async function apiRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  jwtOptions: { issuerId: string; keyId: string; privateKeyPath: string },
  data?: any,
  params?: any
): Promise<any> {
  const token = await generateJWT(jwtOptions)
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
  const url = `${BASE_URL}${endpoint}`
  const config = { headers, params }

  try {
    let response
    switch (method) {
      case 'GET':
        response = await axios.get(url, config)
        break
      case 'POST':
        response = await axios.post(url, data, config)
        break
      case 'PATCH':
        response = await axios.patch(url, data, config)
        break
      case 'DELETE':
        response = await axios.delete(url, config)
        break
      default:
        throw new Error(`Unsupported method: ${method}`)
    }
    return response.data
  } catch (error: any) {
    // Extract useful error information from axios error
    if (error.response) {
      const { status, statusText, data } = error.response
      // Uncomment below for debugging:
      // console.error('API Request Failed:', JSON.stringify({ status, statusText, endpoint, method, errors: data?.errors || data?.error || data }, null, 2))
      throw new Error(
        `API request failed [${status} ${statusText}] at ${method} ${endpoint}: ${JSON.stringify(data?.errors?.[0] || data?.error || data)
        }`
      )
    } else if (error.request) {
      console.error('No response received from API:', { endpoint, method })
      throw new Error(`No response received from API at ${method} ${endpoint}`)
    } else {
      console.error('Error setting up request:', error.message)
      throw error
    }
  }
}

/**
 * Retrieves available builds for a specific app from App Store Connect.
 * Returns builds sorted by upload date (most recent first) with VALID or PROCESSING status.
 * 
 * This is particularly useful for:
 * - Finding the correct build ID before submission
 * - Verifying build processing status
 * - Debugging build association issues
 * 
 * @param appId - Your app's unique identifier from App Store Connect
 * @param jwtOptions - Authentication credentials (issuerId, keyId, privateKeyPath)
 * @param limit - Maximum number of builds to return (default: 5)
 * @returns Array of Build objects, or empty array if request fails
 * 
 * @example
 * ```typescript
 * const jwtOptions = {
 *   issuerId: 'your-issuer-id',
 *   keyId: 'your-key-id',
 *   privateKeyPath: './AuthKey.p8'
 * }
 * 
 * const builds = await getBuilds('6461211731', jwtOptions, 10)
 * console.log(`Found ${builds.length} builds`)
 * 
 * // Find a specific build
 * const latestBuild = builds[0]
 * if (latestBuild.attributes.processingState === 'VALID') {
 *   console.log(`Latest build ${latestBuild.id} is ready for submission`)
 * }
 * ```
 */
export async function getBuilds(
  appId: string,
  jwtOptions: { issuerId: string; keyId: string; privateKeyPath: string },
  limit: number = 5
): Promise<Build[]> {
  try {
    const response = await apiRequest(
      'GET',
      `/builds`,
      jwtOptions,
      undefined,
      {
        sort: '-uploadedDate',
        'filter[app]': appId,
        'filter[processingState]': 'VALID,PROCESSING',
        limit,
      }
    )
    return response.data || []
  } catch (error: any) {
    console.error('Failed to fetch builds:', error.message)
    return []
  }
}

/**
 * Formats build information into a human-readable string.
 * Useful for displaying build details in logs or user interfaces.
 * 
 * @param build - Build object from getBuilds()
 * @returns Formatted multi-line string with build details
 * 
 * @example
 * ```typescript
 * const builds = await getBuilds('6461211731', jwtOptions)
 * builds.forEach(build => {
 *   console.log(formatBuildInfo(build))
 * })
 * 
 * // Output:
 * //   • Build ID: 27c6cafd-aeca-4beb-b045-23bfaf72ab2c
 * //     Version: 1.0.0
 * //     Status: VALID
 * //     Uploaded: 11/8/2025, 3:45:00 PM
 * ```
 */
export function formatBuildInfo(build: Build): string {
  const uploadDate = new Date(build.attributes.uploadedDate).toLocaleString()
  return `  • Build ID: ${build.id}
    Version: ${build.attributes.version}
    Status: ${build.attributes.processingState}
    Uploaded: ${uploadDate}`
}

/**
 * Cancels all pending review submissions for an app.
 * 
 * This function is automatically called by submitToAppReview() when encountering
 * a 409 INVALID_STATE error (indicating a build is already in review).
 * You can also call it manually to cancel pending submissions before submitting a new build.
 * 
 * **Important**: This will cancel ALL submissions in "WAITING_FOR_REVIEW" or "IN_REVIEW" states.
 * Use with caution in production environments.
 * 
 * @param appId - Your app's unique identifier from App Store Connect
 * @param jwtOptions - Authentication credentials (issuerId, keyId, privateKeyPath)
 * @returns True if any submissions were canceled, false if none were found
 * 
 * @example
 * ```typescript
 * const jwtOptions = {
 *   issuerId: 'your-issuer-id',
 *   keyId: 'your-key-id',
 *   privateKeyPath: './AuthKey.p8'
 * }
 * 
 * // Cancel any pending submissions before submitting new build
 * const canceled = await cancelPendingReviewSubmissions('6461211731', jwtOptions)
 * if (canceled) {
 *   console.log('Previous submissions canceled, ready to submit new build')
 * }
 * ```
 */
export async function cancelPendingReviewSubmissions(
  appId: string,
  jwtOptions: { issuerId: string; keyId: string; privateKeyPath: string }
): Promise<boolean> {
  try {
    console.log(`🔍 Checking for pending review submissions...`)

    // Get all review submissions for the app
    const submissions = await apiRequest(
      'GET',
      `/apps/${appId}/reviewSubmissions`,
      jwtOptions,
      undefined,
      { 'filter[state]': 'WAITING_FOR_REVIEW,IN_REVIEW' }
    )

    if (!submissions.data || submissions.data.length === 0) {
      console.log(`   No pending submissions found.`)
      return false
    }

    console.log(`   Found ${submissions.data.length} pending submission(s). Canceling...`)

    // Cancel each pending submission using PATCH with canceled: true
    for (const submission of submissions.data) {
      try {
        const cancelData = {
          data: {
            type: 'reviewSubmissions',
            id: submission.id,
            attributes: {
              canceled: true,
            },
          },
        }
        await apiRequest(
          'PATCH',
          `/reviewSubmissions/${submission.id}`,
          jwtOptions,
          cancelData
        )
        console.log(`   ✅ Canceled submission: ${submission.id}`)
      } catch (cancelError: any) {
        console.log(`   ⚠️  Could not cancel submission ${submission.id}: ${cancelError.message}`)
      }
    }

    return true
  } catch (error: any) {
    console.log(`   ⚠️  Error checking for pending submissions: ${error.message}`)
    return false
  }
}

/**
 * Submits an app build to Apple App Review with a complete automated workflow.
 * 
 * This function handles the entire submission process including:
 * 1. Creating or retrieving the app store version
 * 2. Associating the build with the version (with automatic retry if conflicts occur)
 * 3. Updating release notes for the specified locale
 * 4. Creating a review submission
 * 5. Adding the version to the submission
 * 6. Submitting to App Review
 * 
 * **Intelligent Error Recovery:**
 * - Automatically uses existing versions if a 409 conflict occurs
 * - Cancels pending submissions if a build is already in review
 * - Displays available builds if build association fails
 * - Shows available locales if the specified locale is not found
 * 
 * **Prerequisites:**
 * - App must be set up in App Store Connect with at least one locale configured
 * - Build must be uploaded to TestFlight and have "VALID" processing state
 * - API key must have App Manager or Admin role
 * - App information (metadata, screenshots, etc.) must be complete in App Store Connect
 * 
 * @param options - Complete configuration object for the submission
 * @throws {Error} If any step fails with detailed error message indicating which step
 * 
 * @example Basic usage
 * ```typescript
 * import { submitToAppReview } from 'appstoreconnect-api'
 * 
 * try {
 *   await submitToAppReview({
 *     issuerId: '415d0cda-7a87-4d29-a982-14b67efae93b',
 *     keyId: 'RB5XWU46WG',
 *     privateKeyPath: './keys/AuthKey.p8',
 *     appId: '6461211731',
 *     buildId: '27c6cafd-aeca-4beb-b045-23bfaf72ab2c',
 *     versionString: '1.0.0',
 *     platform: 'IOS',
 *     releaseNotes: 'Bug fixes and performance improvements.',
 *     locale: 'en-US'
 *   })
 *   console.log('Successfully submitted to App Review!')
 * } catch (error) {
 *   console.error('Submission failed:', error.message)
 * }
 * ```
 * 
 * @example With environment variables
 * ```typescript
 * import { submitToAppReview } from 'appstoreconnect-api'
 * import * as path from 'path'
 * 
 * await submitToAppReview({
 *   issuerId: process.env.ASC_ISSUER_ID!,
 *   keyId: process.env.ASC_KEY_ID!,
 *   privateKeyPath: path.join(__dirname, '../keys/AuthKey.p8'),
 *   appId: process.env.APP_ID!,
 *   buildId: process.env.BUILD_ID!,
 *   versionString: process.env.VERSION_STRING,
 *   platform: 'IOS',
 *   releaseNotes: process.env.RELEASE_NOTES!,
 *   locale: 'en-US'
 * })
 * ```
 * 
 * @example With build discovery
 * ```typescript
 * import { submitToAppReview, getBuilds } from 'appstoreconnect-api'
 * 
 * const jwtOptions = {
 *   issuerId: 'your-issuer-id',
 *   keyId: 'your-key-id',
 *   privateKeyPath: './AuthKey.p8'
 * }
 * 
 * // Get latest valid build
 * const builds = await getBuilds('your-app-id', jwtOptions, 1)
 * const latestBuild = builds.find(b => b.attributes.processingState === 'VALID')
 * 
 * if (!latestBuild) {
 *   throw new Error('No valid builds found')
 * }
 * 
 * await submitToAppReview({
 *   ...jwtOptions,
 *   appId: 'your-app-id',
 *   buildId: latestBuild.id,
 *   versionString: latestBuild.attributes.version,
 *   platform: 'IOS',
 *   releaseNotes: 'Bug fixes and improvements',
 *   locale: 'en-US'
 * })
 * ```
 */
export async function submitToAppReview(options: AppStoreConnectOptions): Promise<void> {
  const jwtOptions = {
    issuerId: options.issuerId,
    keyId: options.keyId,
    privateKeyPath: options.privateKeyPath,
  }

  let versionId: string

  // Step 1: Create or Get App Store Version
  console.log(`📱 Step 1: Creating/Getting App Store Version ${options.versionString || '(auto)'}...`)
  try {
    const versionData = {
      data: {
        type: 'appStoreVersions',
        attributes: { platform: options.platform, versionString: options.versionString },
        relationships: { app: { data: { type: 'apps', id: options.appId } } },
      },
    }
    const versionResponse = await apiRequest('POST', '/appStoreVersions', jwtOptions, versionData)
    versionId = versionResponse.data.id
    console.log(`✅ Created new version: ${versionId}`)
  } catch (error: any) {
    if (error.message.includes('[409')) {
      // Version already exists, fetch it
      console.log(`⚠️  Version already exists, fetching existing version...`)
      try {
        const versions = await apiRequest('GET', `/apps/${options.appId}/appStoreVersions`, jwtOptions)
        if (versions.data.length === 0) {
          throw new Error('No existing versions found for this app.')
        }
        versionId = versions.data[0].id // Use the first one; can be customized
        console.log(`✅ Using existing version: ${versionId}`)
      } catch (fetchError: any) {
        throw new Error(`Failed to fetch existing versions: ${fetchError.message}`)
      }
    } else {
      throw new Error(`Step 1 failed - Create/Get Version: ${error.message}`)
    }
  }

  // Step 2: Associate Build with Version
  console.log(`\n🔗 Step 2: Associating build ${options.buildId} with version ${versionId}...`)

  const associateBuild = async (retryCount = 0): Promise<void> => {
    try {
      const buildLinkData = {
        data: {
          type: 'appStoreVersions',
          id: versionId,
          relationships: {
            build: {
              data: {
                type: 'builds',
                id: options.buildId,
              },
            },
          },
        },
      }

      await apiRequest('PATCH', `/appStoreVersions/${versionId}`, jwtOptions, buildLinkData)
      console.log(`✅ Build associated successfully`)
    } catch (error: any) {
      // Check if error is 409 with INVALID_STATE (build already in review)
      if (error.message.includes('[409') && error.message.includes('INVALID_STATE') && retryCount === 0) {
        console.log(`⚠️  A build is already waiting for review. Canceling pending submissions...`)

        const canceled = await cancelPendingReviewSubmissions(options.appId, jwtOptions)

        if (canceled) {
          console.log(`🔄 Retrying build association...`)
          return associateBuild(1) // Retry once
        }
      }

      // For any other error or if retry failed, show build list and throw
      console.error(`❌ Failed to associate build ${options.buildId}`)
      console.log(`📦 Fetching last 5 builds for your app...`)

      const builds = await getBuilds(options.appId, jwtOptions, 5)

      if (builds.length > 0) {
        console.log(`📋 Available builds (most recent first):`)
        builds.forEach((build) => {
          console.log(formatBuildInfo(build))
          console.log('') // empty line
        })
        console.log(`💡 Tip: Make sure you're using a valid build ID from the list above.`)
        console.log(`   The build must have status "VALID" to be submitted.\n`)
      } else {
        console.log(`⚠️  Could not fetch builds. Please check your app ID and credentials.`)
      }

      throw new Error(`Step 2 failed - Associate Build: ${error.message}`)
    }
  }

  await associateBuild()

  // Step 3: Update Release Notes
  console.log(`\n📝 Step 3: Updating release notes for locale ${options.locale}...`)
  try {
    const localizations = await apiRequest('GET', `/appStoreVersions/${versionId}/appStoreVersionLocalizations`, jwtOptions)
    let locId: string | null = null
    for (const loc of localizations.data) {
      if (loc.attributes.locale === options.locale) {
        locId = loc.id
        break
      }
    }
    if (!locId) {
      const availableLocales = localizations.data.map((loc: any) => loc.attributes.locale).join(', ')
      throw new Error(
        `Locale '${options.locale}' not found. Available locales: ${availableLocales || 'none'}`
      )
    }

    const notesData = {
      data: {
        type: 'appStoreVersionLocalizations',
        id: locId,
        attributes: { whatsNew: options.releaseNotes },
      },
    }
    await apiRequest('PATCH', `/appStoreVersionLocalizations/${locId}`, jwtOptions, notesData)
    console.log(`✅ Release notes updated for ${options.locale}`)
  } catch (error: any) {
    throw new Error(`Step 3 failed - Update Release Notes: ${error.message}`)
  }

  // Step 4: Create Review Submission
  console.log(`\n🚀 Step 4: Creating review submission...`)
  let submissionId: string
  try {
    const submissionData = {
      data: {
        type: 'reviewSubmissions',
        attributes: { platform: options.platform },
        relationships: { app: { data: { type: 'apps', id: options.appId } } },
      },
    }
    const submissionResponse = await apiRequest('POST', '/reviewSubmissions', jwtOptions, submissionData)
    submissionId = submissionResponse.data.id
    console.log(`✅ Created submission: ${submissionId}`)
  } catch (error: any) {
    throw new Error(`Step 4 failed - Create Review Submission: ${error.message}`)
  }

  // Step 5: Add Version as Item to Submission
  console.log(`\n➕ Step 5: Adding version to submission...`)
  try {
    const itemData = {
      data: {
        type: 'reviewSubmissionItems',
        relationships: {
          reviewSubmission: { data: { type: 'reviewSubmissions', id: submissionId } },
          appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } },
        },
      },
    }
    await apiRequest('POST', '/reviewSubmissionItems', jwtOptions, itemData)
    console.log(`✅ Version added to submission`)
  } catch (error: any) {
    throw new Error(`Step 5 failed - Add Version to Submission: ${error.message}`)
  }

  // Step 6: Submit to Review
  console.log(`\n✈️  Step 6: Submitting to App Review...`)
  try {
    const submitData = {
      data: {
        type: 'reviewSubmissions',
        id: submissionId,
        attributes: { submitted: true },
      },
    }
    await apiRequest('PATCH', `/reviewSubmissions/${submissionId}`, jwtOptions, submitData)
    console.log(`\n✅ 🎉 Successfully submitted to App Review!`)
  } catch (error: any) {
    throw new Error(`Step 6 failed - Submit to Review: ${error.message}`)
  }
}
