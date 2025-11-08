#!/usr/bin/env node

/**
 * CLI for App Store Connect API - Automated Review Submission
 * 
 * This CLI tool allows you to submit apps to Apple App Review directly from the terminal.
 * 
 * @module @unfoldingcx/appstoreconnect-api/cli
 * @author JOAO PEDRO BARBOSA VIANA <pitter@unfolding.cx>
 */

import chalk from 'chalk'

import {
  submitToAppReview,
  getBuilds,
  formatBuildInfo,
  cancelPendingReviewSubmissions,
  type AppStoreConnectOptions,
} from './index.js'

interface CLIArgs {
  command?: string
  issuerId?: string
  keyId?: string
  privateKeyPath?: string
  appId?: string
  buildId?: string
  versionString?: string
  platform?: 'IOS' | 'MACOS' | 'TVOS'
  releaseNotes?: string
  locale?: string
  limit?: number
  help?: boolean
  version?: boolean
}

const VERSION = '1.0.1'

function showHelp() {
  console.log(`
${chalk.cyan.bold('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.cyan.bold('║')}   ${chalk.white.bold('App Store Connect API - CLI Tool')}                           ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}   ${chalk.gray('Automate Apple App Review Submissions')}                      ${chalk.cyan.bold('║')}
${chalk.cyan.bold('╚═══════════════════════════════════════════════════════════════╝')}

${chalk.yellow.bold('USAGE:')}
  ${chalk.white('asca')} ${chalk.cyan('<command>')} ${chalk.gray('[options]')}

${chalk.yellow.bold('COMMANDS:')}
  ${chalk.green('submit')}              Submit an app to Apple App Review
  ${chalk.green('builds')}              List available builds for an app
  ${chalk.green('cancel')}              Cancel pending review submissions
  ${chalk.green('version')}             Show version information
  ${chalk.green('help')}                Show this help message

${chalk.yellow.bold('SUBMIT COMMAND:')}
  ${chalk.white('asca submit')} ${chalk.gray('[options]')}

  ${chalk.blue('OPTIONS:')}
    ${chalk.cyan('--issuer-id')} ${chalk.gray('<id>')}         Your Issuer ID ${chalk.dim('(or env: ASC_ISSUER_ID)')}
    ${chalk.cyan('--key-id')} ${chalk.gray('<id>')}            Your Key ID ${chalk.dim('(or env: ASC_KEY_ID)')}
    ${chalk.cyan('--key-path')} ${chalk.gray('<path>')}        Path to .p8 file ${chalk.dim('(or env: ASC_KEY_PATH)')}
    ${chalk.cyan('--app-id')} ${chalk.gray('<id>')}            Your App ID ${chalk.dim('(or env: APP_ID)')}
    ${chalk.cyan('--build-id')} ${chalk.gray('<id>')}          Build UUID ${chalk.dim('(or env: BUILD_ID)')}
    ${chalk.cyan('--version')} ${chalk.gray('<version>')}      Version string ${chalk.dim('(e.g., 1.0.0)')}
    ${chalk.cyan('--platform')} ${chalk.gray('<platform>')}    Platform: IOS, MACOS, or TVOS ${chalk.dim('(default: IOS)')}
    ${chalk.cyan('--release-notes')} ${chalk.gray('<notes>')}  Release notes text
    ${chalk.cyan('--locale')} ${chalk.gray('<locale>')}        Locale code ${chalk.dim('(default: en-US)')}
    ${chalk.cyan('-h, --help')}              Show help

${chalk.yellow.bold('BUILDS COMMAND:')}
  ${chalk.white('asca builds')} ${chalk.gray('[options]')}

  ${chalk.blue('OPTIONS:')}
    ${chalk.cyan('--issuer-id')} ${chalk.gray('<id>')}    Your Issuer ID ${chalk.dim('(or env: ASC_ISSUER_ID)')}
    ${chalk.cyan('--key-id')} ${chalk.gray('<id>')}       Your Key ID ${chalk.dim('(or env: ASC_KEY_ID)')}
    ${chalk.cyan('--key-path')} ${chalk.gray('<path>')}   Path to .p8 file ${chalk.dim('(or env: ASC_KEY_PATH)')}
    ${chalk.cyan('--app-id')} ${chalk.gray('<id>')}       Your App ID ${chalk.dim('(or env: APP_ID)')}
    ${chalk.cyan('--limit')} ${chalk.gray('<number>')}    Number of builds to show ${chalk.dim('(default: 10)')}
    ${chalk.cyan('-h, --help')}         Show help

${chalk.yellow.bold('CANCEL COMMAND:')}
  ${chalk.white('asca cancel')} ${chalk.gray('[options]')}

  ${chalk.blue('OPTIONS:')}
    ${chalk.cyan('--issuer-id')} ${chalk.gray('<id>')}    Your Issuer ID ${chalk.dim('(or env: ASC_ISSUER_ID)')}
    ${chalk.cyan('--key-id')} ${chalk.gray('<id>')}       Your Key ID ${chalk.dim('(or env: ASC_KEY_ID)')}
    ${chalk.cyan('--key-path')} ${chalk.gray('<path>')}   Path to .p8 file ${chalk.dim('(or env: ASC_KEY_PATH)')}
    ${chalk.cyan('--app-id')} ${chalk.gray('<id>')}       Your App ID ${chalk.dim('(or env: APP_ID)')}
    ${chalk.cyan('-h, --help')}         Show help

${chalk.yellow.bold('ENVIRONMENT VARIABLES:')}
  ${chalk.magenta('ASC_ISSUER_ID')}       Your App Store Connect Issuer ID
  ${chalk.magenta('ASC_KEY_ID')}          Your App Store Connect Key ID
  ${chalk.magenta('ASC_KEY_PATH')}        Path to your .p8 private key file
  ${chalk.magenta('APP_ID')}              Your app's unique identifier
  ${chalk.magenta('BUILD_ID')}            Build UUID ${chalk.dim('(for submit command)')}
  ${chalk.magenta('VERSION_STRING')}      Version string ${chalk.dim('(for submit command)')}
  ${chalk.magenta('PLATFORM')}            Platform: IOS, MACOS, or TVOS
  ${chalk.magenta('RELEASE_NOTES')}       Release notes text
  ${chalk.magenta('LOCALE')}              Locale code ${chalk.dim('(e.g., en-US)')}

${chalk.yellow.bold('EXAMPLES:')}
  ${chalk.gray('# Submit with command line arguments')}
  ${chalk.white('asca submit')} ${chalk.cyan('\\')}
    ${chalk.cyan('--issuer-id')} ${chalk.green('"xxx"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--key-id')} ${chalk.green('"yyy"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--key-path')} ${chalk.green('"./AuthKey.p8"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--app-id')} ${chalk.green('"123456"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--build-id')} ${chalk.green('"abc-def"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--version')} ${chalk.green('"1.0.0"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--platform')} ${chalk.green('"IOS"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--release-notes')} ${chalk.green('"Bug fixes"')} ${chalk.cyan('\\')}
    ${chalk.cyan('--locale')} ${chalk.green('"en-US"')}

  ${chalk.gray('# Submit with environment variables')}
  ${chalk.magenta('export ASC_ISSUER_ID')}=${chalk.green('"xxx"')}
  ${chalk.magenta('export ASC_KEY_ID')}=${chalk.green('"yyy"')}
  ${chalk.magenta('export ASC_KEY_PATH')}=${chalk.green('"./AuthKey.p8"')}
  ${chalk.magenta('export APP_ID')}=${chalk.green('"123456"')}
  ${chalk.magenta('export BUILD_ID')}=${chalk.green('"abc-def"')}
  ${chalk.white('asca submit')} ${chalk.cyan('--version')} ${chalk.green('"1.0.0"')} ${chalk.cyan('--release-notes')} ${chalk.green('"Bug fixes"')}

  ${chalk.gray('# List available builds')}
  ${chalk.white('asca builds')} ${chalk.cyan('--app-id')} ${chalk.green('"123456"')} ${chalk.cyan('--limit')} ${chalk.green('5')}

  ${chalk.gray('# Cancel pending submissions')}
  ${chalk.white('asca cancel')} ${chalk.cyan('--app-id')} ${chalk.green('"123456"')}

${chalk.yellow.bold('DOCUMENTATION:')}
  ${chalk.blue.underline('https://github.com/unfoldingcx/appstoreconnect-api')}

${chalk.gray(`VERSION: ${VERSION}`)}
`)
}

function showVersion() {
  console.log(chalk.cyan.bold(`App Store Connect API CLI`) + chalk.gray(` v${VERSION}`))
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {}
  const argv = process.argv.slice(2)

  if (argv.length === 0) {
    return { help: true }
  }

  // First argument might be a command
  if (!argv[0].startsWith('-')) {
    args.command = argv.shift()
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    switch (arg) {
      case '--issuer-id':
        args.issuerId = argv[++i]
        break
      case '--key-id':
        args.keyId = argv[++i]
        break
      case '--key-path':
      case '--private-key-path':
        args.privateKeyPath = argv[++i]
        break
      case '--app-id':
        args.appId = argv[++i]
        break
      case '--build-id':
        args.buildId = argv[++i]
        break
      case '--version':
        if (args.command === 'submit' || args.command === undefined) {
          args.versionString = argv[++i]
        } else {
          args.version = true
        }
        break
      case '--platform':
        args.platform = argv[++i] as 'IOS' | 'MACOS' | 'TVOS'
        break
      case '--release-notes':
        args.releaseNotes = argv[++i]
        break
      case '--locale':
        args.locale = argv[++i]
        break
      case '--limit':
        args.limit = parseInt(argv[++i], 10)
        break
      case '-h':
      case '--help':
        args.help = true
        break
      case '-v':
        args.version = true
        break
    }
  }

  return args
}

function getEnvValue(cliValue: string | undefined, envVar: string): string | undefined {
  return cliValue || process.env[envVar]
}

async function handleSubmit(args: CLIArgs) {
  if (args.help) {
    showHelp()
    return
  }

  console.log(chalk.blue.bold('🚀 Starting App Store submission...\n'))

  // Get values from CLI args or environment variables
  const issuerId = getEnvValue(args.issuerId, 'ASC_ISSUER_ID')
  const keyId = getEnvValue(args.keyId, 'ASC_KEY_ID')
  const privateKeyPath = getEnvValue(args.privateKeyPath, 'ASC_KEY_PATH')
  const appId = getEnvValue(args.appId, 'APP_ID')
  const buildId = getEnvValue(args.buildId, 'BUILD_ID')
  const versionString = getEnvValue(args.versionString, 'VERSION_STRING')
  const platform = (args.platform || process.env.PLATFORM || 'IOS') as 'IOS' | 'MACOS' | 'TVOS'
  const releaseNotes = args.releaseNotes || process.env.RELEASE_NOTES || 'Bug fixes and performance improvements.'
  const locale = args.locale || process.env.LOCALE || 'en-US'

  // Validate required fields
  const missingFields: string[] = []
  if (!issuerId) missingFields.push('--issuer-id (or ASC_ISSUER_ID)')
  if (!keyId) missingFields.push('--key-id (or ASC_KEY_ID)')
  if (!privateKeyPath) missingFields.push('--key-path (or ASC_KEY_PATH)')
  if (!appId) missingFields.push('--app-id (or APP_ID)')
  if (!buildId) missingFields.push('--build-id (or BUILD_ID)')

  if (missingFields.length > 0) {
    console.error(chalk.red.bold('❌ Missing required fields:\n'))
    missingFields.forEach(field => console.error(chalk.red(`   • ${field}`)))
    console.error(chalk.yellow('\nUse --help for usage information\n'))
    process.exit(1)
  }

  try {
    const options: AppStoreConnectOptions = {
      issuerId: issuerId!,
      keyId: keyId!,
      privateKeyPath: privateKeyPath!,
      appId: appId!,
      buildId: buildId!,
      versionString,
      platform,
      releaseNotes,
      locale
    }

    await submitToAppReview(options)

    console.log(chalk.green.bold('\n✅ 🎉 Successfully submitted to App Review!\n'))
    process.exit(0)
  } catch (error: any) {
    console.error(chalk.red.bold('\n❌ Submission failed:'), chalk.red(error.message), '\n')
    process.exit(1)
  }
}

async function handleBuilds(args: CLIArgs) {
  if (args.help) {
    showHelp()
    return
  }

  const issuerId = getEnvValue(args.issuerId, 'ASC_ISSUER_ID')
  const keyId = getEnvValue(args.keyId, 'ASC_KEY_ID')
  const privateKeyPath = getEnvValue(args.privateKeyPath, 'ASC_KEY_PATH')
  const appId = getEnvValue(args.appId, 'APP_ID')
  const limit = args.limit || 10

  // Validate required fields
  const missingFields: string[] = []
  if (!issuerId) missingFields.push('--issuer-id (or ASC_ISSUER_ID)')
  if (!keyId) missingFields.push('--key-id (or ASC_KEY_ID)')
  if (!privateKeyPath) missingFields.push('--key-path (or ASC_KEY_PATH)')
  if (!appId) missingFields.push('--app-id (or APP_ID)')

  if (missingFields.length > 0) {
    console.error(chalk.red.bold('❌ Missing required fields:\n'))
    missingFields.forEach(field => console.error(chalk.red(`   • ${field}`)))
    console.error(chalk.yellow('\nUse --help for usage information\n'))
    process.exit(1)
  }

  try {
    console.log(chalk.blue(`🔍 Fetching builds for app ${chalk.cyan(appId!)}...\n`))

    const builds = await getBuilds(
      appId!,
      {
        issuerId: issuerId!,
        keyId: keyId!,
        privateKeyPath: privateKeyPath!
      },
      limit
    )

    if (builds.length === 0) {
      console.log(chalk.yellow('⚠️  No builds found for this app.\n'))
      process.exit(0)
    }

    console.log(chalk.green.bold(`📋 Found ${builds.length} build(s)`) + chalk.gray(' (most recent first):\n'))
    builds.forEach((build, index) => {
      const statusColor = build.attributes.processingState === 'VALID' ? chalk.green :
        build.attributes.processingState === 'PROCESSING' ? chalk.yellow : chalk.red
      console.log(chalk.white(`${index + 1}. `) + formatBuildInfo(build).replace(build.attributes.processingState, statusColor(build.attributes.processingState)))
      console.log('')
    })

    const validBuilds = builds.filter(b => b.attributes.processingState === 'VALID')
    if (validBuilds.length > 0) {
      console.log(chalk.green.bold(`✅ ${validBuilds.length} build(s) ready for submission`) + chalk.gray(' (VALID state)\n'))
    } else {
      console.log(chalk.yellow('⚠️  No builds in VALID state.') + chalk.gray(' Wait for builds to finish processing.\n'))
    }

    process.exit(0)
  } catch (error: any) {
    console.error(chalk.red.bold('❌ Failed to fetch builds:'), chalk.red(error.message), '\n')
    process.exit(1)
  }
}

async function handleCancel(args: CLIArgs) {
  if (args.help) {
    showHelp()
    return
  }

  const issuerId = getEnvValue(args.issuerId, 'ASC_ISSUER_ID')
  const keyId = getEnvValue(args.keyId, 'ASC_KEY_ID')
  const privateKeyPath = getEnvValue(args.privateKeyPath, 'ASC_KEY_PATH')
  const appId = getEnvValue(args.appId, 'APP_ID')

  // Validate required fields
  const missingFields: string[] = []
  if (!issuerId) missingFields.push('--issuer-id (or ASC_ISSUER_ID)')
  if (!keyId) missingFields.push('--key-id (or ASC_KEY_ID)')
  if (!privateKeyPath) missingFields.push('--key-path (or ASC_KEY_PATH)')
  if (!appId) missingFields.push('--app-id (or APP_ID)')

  if (missingFields.length > 0) {
    console.error(chalk.red.bold('❌ Missing required fields:\n'))
    missingFields.forEach(field => console.error(chalk.red(`   • ${field}`)))
    console.error(chalk.yellow('\nUse --help for usage information\n'))
    process.exit(1)
  }

  try {
    const canceled = await cancelPendingReviewSubmissions(
      appId!,
      {
        issuerId: issuerId!,
        keyId: keyId!,
        privateKeyPath: privateKeyPath!
      }
    )

    if (canceled) {
      console.log(chalk.green.bold('\n✅ Pending submissions canceled successfully\n'))
    } else {
      console.log(chalk.blue('\n✅ No pending submissions found\n'))
    }

    process.exit(0)
  } catch (error: any) {
    console.error(chalk.red.bold('\n❌ Failed to cancel submissions:'), chalk.red(error.message), '\n')
    process.exit(1)
  }
}

async function main() {
  const args = parseArgs()

  // Handle version flag
  if (args.version && !args.command) {
    showVersion()
    return
  }

  // Handle help flag or no command
  if (args.help && !args.command) {
    showHelp()
    return
  }

  // Handle commands
  switch (args.command) {
    case 'submit':
      await handleSubmit(args)
      break
    case 'builds':
      await handleBuilds(args)
      break
    case 'cancel':
      await handleCancel(args)
      break
    case 'version':
      showVersion()
      break
    case 'help':
    case undefined:
      showHelp()
      break
    default:
      console.error(chalk.red.bold(`❌ Unknown command: ${args.command}\n`))
      console.error(chalk.yellow('Use --help for usage information\n'))
      process.exit(1)
  }
}

// Run CLI
main().catch(error => {
  console.error(chalk.red.bold('❌ Unexpected error:'), chalk.red(error.message))
  process.exit(1)
})

