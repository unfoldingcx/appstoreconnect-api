/**
 * AI-Powered Release Notes Generator
 * 
 * This module generates release notes automatically by:
 * 1. Fetching the last published build from App Store Connect
 * 2. Getting git commits since that build's publish date
 * 3. Using OpenAI to generate human-readable release notes
 * 
 * @module ai-release-notes
 * @author JOAO PEDRO BARBOSA VIANA <pitter@unfolding.cx>
 */

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import chalk from 'chalk'
import OpenAI from 'openai'
import { simpleGit, type SimpleGit, type DefaultLogFields } from 'simple-git'

import type { Build } from './index.js'

/**
 * JWT credentials for App Store Connect API
 */
export interface JWTCredentials {
  issuerId: string
  keyId: string
  privateKeyPath: string
}

/**
 * Options for generating AI release notes
 */
export interface GenerateReleaseNotesOptions {
  /** App Store Connect JWT credentials */
  credentials: JWTCredentials

  /** App ID from App Store Connect */
  appId: string

  /** Path to git repository (defaults to current directory) */
  gitRepoPath?: string

  /** Locale for release notes (e.g., 'en-US', 'pt-BR', 'es-ES') */
  locale?: string

  /** OpenAI API key */
  openaiApiKey: string

  /** OpenAI Organization ID (optional) */
  openaiOrgId?: string

  /** Maximum number of commits to analyze (default: 100) */
  maxCommits?: number

  /** Override: Use commits since this date instead of last build date */
  sinceDate?: Date

  /** Override: Use commits from last N days */
  sinceDays?: number
}

/**
 * Commit information from git log
 */
export interface CommitInfo {
  hash: string
  date: Date
  message: string
  author: string
  filesChanged?: number
  insertions?: number
  deletions?: number
}

/**
 * Result of release notes generation
 */
export interface ReleaseNotesResult {
  releaseNotes: string
  commitCount: number
  sinceDate: Date
  locale: string
  lastBuildVersion?: string
}

/**
 * Checks if a directory is a git repository
 * 
 * @param repoPath - Path to check
 * @returns True if directory contains a .git folder
 */
export function isGitRepository(repoPath: string = process.cwd()): boolean {
  const gitPath = path.join(repoPath, '.git')
  return fs.existsSync(gitPath)
}

/**
 * Gets the last published build for an app from App Store Connect.
 * Returns the build from the most recent app store version that is "READY_FOR_SALE"
 * (i.e., approved by Apple and available to users in the App Store).
 * 
 * This is different from just getting the latest TestFlight build - this gets
 * the build that's actually live in the App Store.
 * 
 * @param appId - App ID from App Store Connect
 * @param credentials - JWT credentials
 * @returns The build from the last published version, or undefined if none found
 * 
 * @example
 * ```typescript
 * const build = await getLastPublishedBuild('123456', {
 *   issuerId: 'xxx',
 *   keyId: 'yyy',
 *   privateKeyPath: './keys/AuthKey.p8'
 * })
 * 
 * if (build) {
 *   console.log(`Last published build: ${build.attributes.version}`)
 *   console.log(`Uploaded: ${build.attributes.uploadedDate}`)
 * }
 * ```
 */
export async function getLastPublishedBuild(
  appId: string,
  credentials: JWTCredentials
): Promise<Build | undefined> {
  console.log(chalk.blue('🔍 Fetching last published build from App Store (not TestFlight)...'))

  try {
    // Import the apiRequest function dynamically to avoid circular dependency
    const { default: axios } = await import('axios')
    const pkg = await import('jsonwebtoken')
    const { sign } = pkg.default
    const fs = await import('fs/promises')

    // Generate JWT token
    const privateKey = await fs.readFile(credentials.privateKeyPath, 'utf8').catch(() => {
      // Retry using path resolve
      const homeDirectory = os.homedir()
      const resolvedPath = path.resolve(credentials.privateKeyPath.replace('~', homeDirectory))
      return fs.readFile(resolvedPath, 'utf8').catch((error) => {
        console.error('Error reading private key file:', error)
        throw new Error('Failed to read private key file')
      })
    })

    if (!privateKey) {
      throw new Error('Failed to read private key file')
    }

    const payload = {
      iss: credentials.issuerId,
      exp: Math.floor(Date.now() / 1000) + 1200,
      aud: 'appstoreconnect-v1',
    }
    const signOptions = {
      algorithm: 'ES256' as const,
      header: { alg: 'ES256', kid: credentials.keyId, typ: 'JWT' },
    }
    const token = sign(payload, privateKey, signOptions)

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // Get app store versions that are READY_FOR_SALE (published to App Store)
    const versionsResponse = await axios.get(
      `https://api.appstoreconnect.apple.com/v1/apps/${appId}/appStoreVersions`,
      {
        headers,
        params: {
          'filter[appStoreState]': 'READY_FOR_SALE',
          limit: 1,
          include: 'build',
        }
      }
    )

    if (!versionsResponse.data.data || versionsResponse.data.data.length === 0) {
      console.log(chalk.yellow('⚠️  No published versions found (no READY_FOR_SALE versions)'))
      console.log(chalk.gray('   This might be the first release, or no versions are live yet.\n'))
      return undefined
    }

    const publishedVersion = versionsResponse.data.data[0]

    // The build should be in the 'included' array
    const includedBuilds = versionsResponse.data.included?.filter((item: any) => item.type === 'builds')
    const build = includedBuilds?.[0]

    if (!build) {
      // Fallback: try to get build ID from relationships
      const buildId = publishedVersion.relationships?.build?.data?.id

      if (!buildId) {
        console.log(chalk.yellow('⚠️  Published version has no associated build'))
        return undefined
      }

      // Fetch build details separately
      const buildResponse = await axios.get(
        `https://api.appstoreconnect.apple.com/v1/builds/${buildId}`,
        { headers }
      )

      const buildData = buildResponse.data.data

      if (!buildData) {
        console.log(chalk.yellow('⚠️  Could not fetch build details'))
        return undefined
      }

      const buildInfo: Build = {
        id: buildData.id,
        attributes: {
          version: buildData.attributes.version,
          uploadedDate: buildData.attributes.uploadedDate,
          processingState: buildData.attributes.processingState,
          expirationDate: buildData.attributes.expirationDate,
        }
      }

      console.log(chalk.green(`✅ Found published build: ${chalk.cyan(buildInfo.attributes.version)}`))
      console.log(chalk.gray(`   Version: ${publishedVersion.attributes.versionString}`))
      console.log(chalk.gray(`   Build uploaded: ${new Date(buildInfo.attributes.uploadedDate).toLocaleString()}`))
      console.log(chalk.gray(`   Status: READY_FOR_SALE (live in App Store)\n`))

      return buildInfo
    }

    const buildInfo: Build = {
      id: build.id,
      attributes: {
        version: build.attributes.version,
        uploadedDate: build.attributes.uploadedDate,
        processingState: build.attributes.processingState,
        expirationDate: build.attributes.expirationDate,
      }
    }

    console.log(chalk.green(`✅ Found published build: ${chalk.cyan(buildInfo.attributes.version)}`))
    console.log(chalk.gray(`   Version: ${publishedVersion.attributes.versionString}`))
    console.log(chalk.gray(`   Build uploaded: ${new Date(buildInfo.attributes.uploadedDate).toLocaleString()}`))
    console.log(chalk.gray(`   Status: READY_FOR_SALE (live in App Store)\n`))

    return buildInfo
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(chalk.yellow('⚠️  No published versions found in App Store'))
      console.log(chalk.gray('   This might be the first release.\n'))
      return undefined
    }
    console.error(error.response.data)
    console.error(chalk.red('❌ Failed to fetch published build:'), error.message)
    throw error
  }
}

/**
 * Gets git commits since a specific date using simple-git.
 * Includes commit metadata similar to `git log --since="date" --shortstat --oneline`
 * 
 * @param repoPath - Path to git repository
 * @param sinceDate - Get commits since this date
 * @param maxCommits - Maximum number of commits to retrieve (default: 100)
 * @returns Array of commit information
 * 
 * @example
 * ```typescript
 * const since = new Date('2024-01-01')
 * const commits = await getGitCommitsSince('/path/to/repo', since)
 * 
 * commits.forEach(commit => {
 *   console.log(`${commit.hash.substring(0, 7)}: ${commit.message}`)
 * })
 * ```
 */
export async function getGitCommitsSince(
  repoPath: string,
  sinceDate: Date,
  maxCommits: number = 100
): Promise<CommitInfo[]> {
  console.log(chalk.blue(`📝 Fetching git commits since ${chalk.cyan(sinceDate.toLocaleDateString())}...`))

  if (!isGitRepository(repoPath)) {
    throw new Error(`Not a git repository: ${repoPath}`)
  }

  const git: SimpleGit = simpleGit(repoPath)

  try {
    // Get commits since date with stats
    const log = await git.log({
      '--since': sinceDate.toISOString(),
      '--max-count': maxCommits.toString(),
      '--shortstat': null,
      '--no-merges': null,
    })

    if (log.all.length === 0) {
      console.log(chalk.yellow('⚠️  No commits found since that date\n'))
      return []
    }

    const commits: CommitInfo[] = log.all.map((commit: DefaultLogFields) => ({
      hash: commit.hash,
      date: new Date(commit.date),
      message: commit.message,
      author: commit.author_name,
      // Note: simple-git doesn't parse --shortstat, but we have the message
    }))

    console.log(chalk.green(`✅ Found ${chalk.cyan(commits.length)} commit(s)\n`))

    return commits
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to fetch git commits:'), error.message)
    throw error
  }
}

/**
 * Formats commits into a readable text summary for AI processing
 * 
 * @param commits - Array of commit information
 * @returns Formatted string with commit details
 */
export function formatCommitsForAI(commits: CommitInfo[]): string {
  if (commits.length === 0) {
    return 'No commits found.'
  }

  return commits
    .map(commit => {
      const shortHash = commit.hash.substring(0, 7)
      const date = commit.date.toISOString().split('T')[0]
      return `[${shortHash}] ${date} - ${commit.message} (${commit.author})`
    })
    .join('\n')
}

/**
 * Generates release notes using OpenAI based on git commits.
 * Creates user-friendly, localized release notes suitable for app stores.
 * 
 * @param commits - Array of commits to analyze
 * @param locale - Target locale for release notes (e.g., 'en-US', 'pt-BR')
 * @param openaiApiKey - OpenAI API key
 * @param openaiOrgId - OpenAI Organization ID (optional)
 * @returns Generated release notes text
 * 
 * @example
 * ```typescript
 * const notes = await generateReleaseNotesWithAI(commits, 'en-US', 'sk-...')
 * console.log(notes)
 * // Output:
 * // "🎉 What's New
 * // - Added dark mode support
 * // - Fixed login issues
 * // - Improved performance"
 * ```
 */
export async function generateReleaseNotesWithAI(
  commits: CommitInfo[],
  locale: string = 'en-US',
  openaiApiKey: string,
  openaiOrgId?: string
): Promise<string> {
  console.log(chalk.blue(`🤖 Generating release notes with OpenAI for locale ${chalk.cyan(locale)}...`))

  if (commits.length === 0) {
    throw new Error('No commits provided to generate release notes')
  }

  const openai = new OpenAI({
    apiKey: openaiApiKey,
    organization: openaiOrgId,
  })

  const commitsText = formatCommitsForAI(commits)

  // Map locale to language name
  const localeLanguageMap: Record<string, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'pt-BR': 'Brazilian Portuguese',
    'pt-PT': 'Portuguese (Portugal)',
    'es-ES': 'Spanish (Spain)',
    'es-MX': 'Spanish (Mexico)',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ru-RU': 'Russian',
    'ar-SA': 'Arabic',
    'nl-NL': 'Dutch',
    'sv-SE': 'Swedish',
    'da-DK': 'Danish',
    'fi-FI': 'Finnish',
    'no-NO': 'Norwegian',
    'pl-PL': 'Polish',
    'tr-TR': 'Turkish',
    'th-TH': 'Thai',
    'vi-VN': 'Vietnamese',
    'id-ID': 'Indonesian',
    'ms-MY': 'Malay',
  }

  const language = localeLanguageMap[locale] || locale

  const systemPrompt = `You are a Product Owner and Marketing expert at writing Apple App Store release notes. Your task is to analyze git commit messages and create concise, user-friendly release notes that highlight the most important changes for end users.

Guidelines:
- Write in ${language}
- Focus on user-facing changes (features, fixes, improvements)
- Ignore technical/internal changes unless they significantly impact users
- Use clear, simple language that non-technical users can understand
- Group similar changes together
- Use emojis sparingly and appropriately
- Start with most important changes
- Use present tense or past tense consistently
- Don't mention commit hashes, authors, or technical details

Format:
- Use bullet points with "•"
- Each point should be a single line
- Keep each bullet concise and clear
`

  const userPrompt = `Based on these git commits, generate release notes for an app store update on Apple App Store:

${commitsText}

Generate release notes in ${language} that are clear, concise, and user-friendly.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    })

    const releaseNotes = response.choices[0]?.message?.content?.trim() || ''

    if (!releaseNotes) {
      throw new Error('OpenAI returned empty response')
    }

    console.log(chalk.green('✅ Release notes generated successfully!\n'))

    return releaseNotes
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to generate release notes with OpenAI:'), error.message)
    throw error
  }
}

/**
 * Main function to generate AI-powered release notes.
 * Orchestrates the entire process from fetching builds to generating notes.
 * 
 * This function:
 * 1. Fetches the last published build from App Store Connect
 * 2. Gets git commits since that build's date (or specified date/days)
 * 3. Generates release notes using OpenAI
 * 
 * @param options - Configuration options
 * @returns Release notes result with metadata
 * 
 * @example
 * ```typescript
 * const result = await generateAIReleaseNotes({
 *   credentials: {
 *     issuerId: 'xxx',
 *     keyId: 'yyy',
 *     privateKeyPath: './keys/AuthKey.p8'
 *   },
 *   appId: '123456',
 *   locale: 'pt-BR',
 *   openaiApiKey: 'sk-...',
 *   gitRepoPath: './'
 * })
 * 
 * console.log(result.releaseNotes)
 * console.log(`Based on ${result.commitCount} commits since ${result.sinceDate}`)
 * ```
 */
export async function generateAIReleaseNotes(
  options: GenerateReleaseNotesOptions
): Promise<ReleaseNotesResult> {
  const {
    credentials,
    appId,
    gitRepoPath = process.cwd(),
    locale = 'en-US',
    openaiApiKey,
    openaiOrgId,
    maxCommits = 100,
    sinceDate,
    sinceDays,
  } = options

  console.log(chalk.gray(`Repository: ${gitRepoPath}`))
  console.log(chalk.gray(`Locale: ${locale}\n`))

  // Validate git repository
  if (!isGitRepository(gitRepoPath)) {
    throw new Error(`Not a git repository: ${gitRepoPath}`)
  }

  // Determine the date to fetch commits from
  let fromDate: Date
  let lastBuildVersion: string | undefined

  if (sinceDate) {
    // Use explicitly provided date
    fromDate = sinceDate
    console.log(chalk.blue(`📅 Using provided date: ${chalk.cyan(fromDate.toLocaleDateString())}\n`))
  } else if (sinceDays) {
    // Use last N days
    fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - sinceDays)
    console.log(chalk.blue(`📅 Using last ${chalk.cyan(sinceDays)} days: since ${chalk.cyan(fromDate.toLocaleDateString())}\n`))
  } else {
    // Fetch last published build and use its date
    const lastBuild = await getLastPublishedBuild(appId, credentials)

    if (!lastBuild) {
      // No published builds found, default to last 30 days
      fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - 30)
      console.log(chalk.yellow(`⚠️  No published version found (READY_FOR_SALE)`))
      console.log(chalk.gray(`   This might be your first App Store release, or no version is live yet.`))
      console.log(chalk.blue(`📅 Using last 30 days: since ${chalk.cyan(fromDate.toLocaleDateString())}\n`))
      console.log(chalk.dim(`   💡 Tip: Use ${chalk.cyan('--since-days N')} to adjust the date range\n`))
    } else {
      fromDate = new Date(lastBuild.attributes.uploadedDate)
      lastBuildVersion = lastBuild.attributes.version
    }
  }

  // Fetch git commits
  const commits = await getGitCommitsSince(gitRepoPath, fromDate, maxCommits)

  if (commits.length === 0) {
    throw new Error(`No commits found since ${fromDate.toLocaleDateString()}. Cannot generate release notes.`)
  }

  // Display commits summary
  console.log(chalk.cyan.bold('📋 Commits Summary:\n'))
  const previewCount = Math.min(5, commits.length)
  commits.slice(0, previewCount).forEach(commit => {
    const shortHash = chalk.gray(commit.hash.substring(0, 7))
    const date = chalk.dim(commit.date.toLocaleDateString())
    console.log(`  ${shortHash} ${date} - ${commit.message}`)
  })
  if (commits.length > previewCount) {
    console.log(chalk.gray(`  ... and ${commits.length - previewCount} more\n`))
  } else {
    console.log('')
  }

  // Generate release notes with AI
  const releaseNotes = await generateReleaseNotesWithAI(
    commits,
    locale,
    openaiApiKey,
    openaiOrgId
  )

  return {
    releaseNotes,
    commitCount: commits.length,
    sinceDate: fromDate,
    locale,
    lastBuildVersion,
  }
}

