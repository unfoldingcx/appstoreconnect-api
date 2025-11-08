#!/usr/bin/env node

/**
 * CLI for App Store Connect API - Automated Review Submission
 * 
 * This CLI tool allows you to submit apps to Apple App Review directly from the terminal.
 * 
 * @module @unfoldingcx/appstoreconnect-api/cli
 * @author JOAO PEDRO BARBOSA VIANA <pitter@unfolding.cx>
 */

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as readline from 'readline'

import chalk from 'chalk'

import {
  submitToAppReview,
  getBuilds,
  formatBuildInfo,
  cancelPendingReviewSubmissions,
  type AppStoreConnectOptions,
} from './index.js'
import { generateAIReleaseNotes } from './ai-release-notes.js'

interface Config {
  issuerId?: string
  keyId?: string
  privateKeyPath?: string
  appId?: string
  platform?: 'IOS' | 'MACOS' | 'TVOS'
  locale?: string
  openaiApiKey?: string
  openaiOrgId?: string
}

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
  sinceDays?: number
  gitPath?: string
  openaiKey?: string
  openaiOrg?: string
  aiReleaseNotes?: boolean
  help?: boolean
  version?: boolean
}

const VERSION = '1.1.0'
const CONFIG_DIR = path.join(os.homedir(), '.config')
const CONFIG_FILE = path.join(CONFIG_DIR, 'asca.json')

// Config management functions
function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch {
    // Ignore errors, return empty config
  }
  return {}
}

function saveConfig(config: Config): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true })
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8')
  } catch (error: any) {
    throw new Error(`Failed to save config: ${error.message}`)
  }
}

function askQuestion(rl: readline.Interface, question: string, defaultValue?: string): Promise<string> {
  return new Promise((resolve) => {
    const prompt = defaultValue
      ? `${question} ${chalk.dim(`(${defaultValue})`)}: `
      : `${question}: `

    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue || '')
    })
  })
}

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
  ${chalk.green('release-notes')}       Generate AI-powered release notes (preview)
  ${chalk.green('config')}              Configure default credentials (interactive)
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
    ${chalk.cyan('--release-notes')} ${chalk.gray('<notes>')}  Release notes text ${chalk.dim('(or use --ai-release-notes)')}
    ${chalk.cyan('--ai-release-notes')}         ${chalk.magenta('🤖 Auto-generate notes with AI')}
    ${chalk.cyan('--locale')} ${chalk.gray('<locale>')}        Locale code ${chalk.dim('(default: en-US)')}
    ${chalk.cyan('--since-days')} ${chalk.gray('<number>')}    For AI: use commits from last N days
    ${chalk.cyan('--openai-key')} ${chalk.gray('<key>')}       OpenAI API key ${chalk.dim('(for --ai-release-notes)')}
    ${chalk.cyan('--openai-org')} ${chalk.gray('<id>')}        OpenAI Org ID ${chalk.dim('(optional)')}
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

${chalk.yellow.bold('RELEASE-NOTES COMMAND:')}
  ${chalk.white('asca release-notes')} ${chalk.gray('[options]')} ${chalk.dim('(alias: rn)')}

  ${chalk.gray('Generate AI-powered release notes from git commits.')}
  ${chalk.gray('Preview only - does not submit to App Store Connect.')}

  ${chalk.blue('OPTIONS:')}
    ${chalk.cyan('--issuer-id')} ${chalk.gray('<id>')}         Your Issuer ID ${chalk.dim('(or env/config)')}
    ${chalk.cyan('--key-id')} ${chalk.gray('<id>')}            Your Key ID ${chalk.dim('(or env/config)')}
    ${chalk.cyan('--key-path')} ${chalk.gray('<path>')}        Path to .p8 file ${chalk.dim('(or env/config)')}
    ${chalk.cyan('--app-id')} ${chalk.gray('<id>')}            Your App ID ${chalk.dim('(or env/config)')}
    ${chalk.cyan('--locale')} ${chalk.gray('<locale>')}        Locale for notes ${chalk.dim('(default: en-US)')}
    ${chalk.cyan('--since-days')} ${chalk.gray('<number>')}    Use commits from last N days
    ${chalk.cyan('--git-path')} ${chalk.gray('<path>')}        Path to git repo ${chalk.dim('(default: current dir)')}
    ${chalk.cyan('--openai-key')} ${chalk.gray('<key>')}       OpenAI API key ${chalk.dim('(or env/config)')}
    ${chalk.cyan('--openai-org')} ${chalk.gray('<id>')}        OpenAI Org ID ${chalk.dim('(optional)')}
    ${chalk.cyan('-h, --help')}                 Show help

${chalk.yellow.bold('CONFIG COMMAND:')}
  ${chalk.white('asca config')}

  ${chalk.gray('Interactive setup wizard to save your default credentials.')}
  ${chalk.gray('Saves to')} ${chalk.cyan('~/.config/asca.json')}
  ${chalk.gray('Values from config can be overridden by env vars or CLI args.')}

  ${chalk.gray('Also includes optional OpenAI configuration for auto-generating')}
  ${chalk.gray('release notes from git history.')}

  ${chalk.blue('USAGE:')}
    ${chalk.white('asca config')}              ${chalk.gray('# Run interactive setup')}
    ${chalk.white('asca config --show')}       ${chalk.gray('# Show current config')}
    ${chalk.white('asca config --reset')}      ${chalk.gray('# Delete config file')}

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
  ${chalk.magenta('OPENAI_API_KEY')}      OpenAI API key ${chalk.dim('(for release-notes command)')}
  ${chalk.magenta('OPENAI_ORG_ID')}       OpenAI Org ID ${chalk.dim('(optional)')}

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

  ${chalk.gray('# Generate AI release notes (preview)')}
  ${chalk.white('asca release-notes')} ${chalk.cyan('--locale')} ${chalk.green('"pt-BR"')}
  ${chalk.white('asca rn')} ${chalk.cyan('--since-days')} ${chalk.green('7')} ${chalk.cyan('--locale')} ${chalk.green('"en-US"')}

  ${chalk.gray('# Submit with AI-generated release notes')}
  ${chalk.white('asca submit')} ${chalk.cyan('--build-id')} ${chalk.green('"abc"')} ${chalk.cyan('--version')} ${chalk.green('"1.0.0"')} ${chalk.cyan('--ai-release-notes')}
  ${chalk.white('asca submit')} ${chalk.cyan('--build-id')} ${chalk.green('"xyz"')} ${chalk.cyan('--version')} ${chalk.green('"2.0.0"')} ${chalk.cyan('--ai-release-notes')} ${chalk.cyan('--since-days')} ${chalk.green('14')}

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
    const cmd = argv.shift()
    // Handle aliases
    args.command = cmd === 'rn' ? 'release-notes' : cmd
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
      case '--since-days':
        args.sinceDays = parseInt(argv[++i], 10)
        break
      case '--git-path':
        args.gitPath = argv[++i]
        break
      case '--openai-key':
        args.openaiKey = argv[++i]
        break
      case '--openai-org':
        args.openaiOrg = argv[++i]
        break
      case '--ai-release-notes':
        args.aiReleaseNotes = true
        break
      case '-h':
      case '--help':
        args.help = true
        break
      case '-v':
        args.version = true
        break
      case '--show':
        (args as any).show = true
        break
      case '--reset':
        (args as any).reset = true
        break
    }
  }

  return args
}

function getEnvValue(cliValue: string | undefined, envVar: string, configKey?: keyof Config): string | undefined {
  // Priority: CLI args > Environment variables > Config file
  if (cliValue) return cliValue
  if (process.env[envVar]) return process.env[envVar]
  if (configKey) {
    const config = loadConfig()
    return config[configKey]
  }
  return undefined
}

async function handleSubmit(args: CLIArgs) {
  if (args.help) {
    showHelp()
    return
  }

  console.log(chalk.blue.bold('🚀 Starting App Store submission...\n'))

  // Get values from CLI args, environment variables, or config file
  const issuerId = getEnvValue(args.issuerId, 'ASC_ISSUER_ID', 'issuerId')
  const keyId = getEnvValue(args.keyId, 'ASC_KEY_ID', 'keyId')
  const privateKeyPath = getEnvValue(args.privateKeyPath, 'ASC_KEY_PATH', 'privateKeyPath')
  const appId = getEnvValue(args.appId, 'APP_ID', 'appId')
  const buildId = getEnvValue(args.buildId, 'BUILD_ID')
  const versionString = getEnvValue(args.versionString, 'VERSION_STRING')
  const config = loadConfig()
  const platform = (args.platform || process.env.PLATFORM || config.platform || 'IOS') as 'IOS' | 'MACOS' | 'TVOS'
  const locale = args.locale || process.env.LOCALE || config.locale || 'en-US'
  
  let releaseNotes = args.releaseNotes || process.env.RELEASE_NOTES
  
  // Check if we should generate AI release notes
  if (args.aiReleaseNotes) {
    if (releaseNotes) {
      console.log(chalk.yellow('⚠️  Both --release-notes and --ai-release-notes provided.'))
      console.log(chalk.yellow('   Using --ai-release-notes (will override manual notes)\n'))
    }
    
    const openaiKey = args.openaiKey || process.env.OPENAI_API_KEY || config.openaiApiKey
    const openaiOrg = args.openaiOrg || process.env.OPENAI_ORG_ID || config.openaiOrgId
    
    if (!openaiKey) {
      console.error(chalk.red.bold('❌ OpenAI API key required for --ai-release-notes\n'))
      console.error(chalk.yellow('Set it via:'))
      console.error(chalk.cyan('  • asca config'), chalk.gray('(save to config)'))
      console.error(chalk.cyan('  • --openai-key "sk-..."'), chalk.gray('(command line)'))
      console.error(chalk.cyan('  • export OPENAI_API_KEY="sk-..."'), chalk.gray('(environment variable)\n'))
      process.exit(1)
    }
    
    console.log(chalk.blue('🤖 Generating release notes with AI...\n'))
    
    try {
      const result = await generateAIReleaseNotes({
        credentials: {
          issuerId: issuerId!,
          keyId: keyId!,
          privateKeyPath: privateKeyPath!,
        },
        appId: appId!,
        gitRepoPath: args.gitPath || process.cwd(),
        locale,
        openaiApiKey: openaiKey,
        openaiOrgId: openaiOrg,
        sinceDays: args.sinceDays,
      })
      
      releaseNotes = result.releaseNotes
      
      console.log(chalk.cyan.bold('📝 Generated Release Notes:\n'))
      console.log(chalk.white('─'.repeat(60)))
      console.log(chalk.white(releaseNotes))
      console.log(chalk.white('─'.repeat(60)))
      console.log(chalk.gray(`\nCharacters: ${chalk.cyan(releaseNotes.length)}/4000`))
      console.log(chalk.gray(`Based on ${chalk.cyan(result.commitCount)} commit(s)\n`))
    } catch (error: any) {
      console.error(chalk.red.bold('❌ Failed to generate AI release notes:'), chalk.red(error.message))
      console.error(chalk.yellow('\n💡 You can:'))
      console.error(chalk.yellow('   • Use --release-notes "..." to provide notes manually'))
      console.error(chalk.yellow('   • Use --since-days N to adjust the date range'))
      console.error(chalk.yellow('   • Check your OpenAI API key\n'))
      process.exit(1)
    }
  }
  
  // Use default if still no release notes
  if (!releaseNotes) {
    releaseNotes = 'Bug fixes and performance improvements.'
  }

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

  const issuerId = getEnvValue(args.issuerId, 'ASC_ISSUER_ID', 'issuerId')
  const keyId = getEnvValue(args.keyId, 'ASC_KEY_ID', 'keyId')
  const privateKeyPath = getEnvValue(args.privateKeyPath, 'ASC_KEY_PATH', 'privateKeyPath')
  const appId = getEnvValue(args.appId, 'APP_ID', 'appId')
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

  const issuerId = getEnvValue(args.issuerId, 'ASC_ISSUER_ID', 'issuerId')
  const keyId = getEnvValue(args.keyId, 'ASC_KEY_ID', 'keyId')
  const privateKeyPath = getEnvValue(args.privateKeyPath, 'ASC_KEY_PATH', 'privateKeyPath')
  const appId = getEnvValue(args.appId, 'APP_ID', 'appId')

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

async function handleReleaseNotes(args: CLIArgs) {
  if (args.help) {
    showHelp()
    return
  }

  console.log(chalk.cyan.bold('\n🤖 AI Release Notes Generator\n'))

  const config = loadConfig()
  
  // Get values from CLI args, environment variables, or config file
  const issuerId = getEnvValue(args.issuerId, 'ASC_ISSUER_ID', 'issuerId')
  const keyId = getEnvValue(args.keyId, 'ASC_KEY_ID', 'keyId')
  const privateKeyPath = getEnvValue(args.privateKeyPath, 'ASC_KEY_PATH', 'privateKeyPath')
  const appId = getEnvValue(args.appId, 'APP_ID', 'appId')
  const openaiKey = args.openaiKey || process.env.OPENAI_API_KEY || config.openaiApiKey
  const openaiOrg = args.openaiOrg || process.env.OPENAI_ORG_ID || config.openaiOrgId
  const locale = args.locale || process.env.LOCALE || config.locale || 'en-US'
  const gitPath = args.gitPath || process.cwd()
  const sinceDays = args.sinceDays

  // Validate required fields
  const missingFields: string[] = []
  if (!issuerId) missingFields.push('--issuer-id (or ASC_ISSUER_ID or config)')
  if (!keyId) missingFields.push('--key-id (or ASC_KEY_ID or config)')
  if (!privateKeyPath) missingFields.push('--key-path (or ASC_KEY_PATH or config)')
  if (!appId) missingFields.push('--app-id (or APP_ID or config)')
  if (!openaiKey) missingFields.push('--openai-key (or OPENAI_API_KEY or config)')

  if (missingFields.length > 0) {
    console.error(chalk.red.bold('❌ Missing required fields:\n'))
    missingFields.forEach(field => console.error(chalk.red(`   • ${field}`)))
    console.error(chalk.yellow('\n💡 Tip: Run'), chalk.cyan('asca config'), chalk.yellow('to save your credentials\n'))
    console.error(chalk.yellow('Use --help for usage information\n'))
    process.exit(1)
  }

  try {
    const result = await generateAIReleaseNotes({
      credentials: {
        issuerId: issuerId!,
        keyId: keyId!,
        privateKeyPath: privateKeyPath!,
      },
      appId: appId!,
      gitRepoPath: gitPath,
      locale,
      openaiApiKey: openaiKey!,
      openaiOrgId: openaiOrg,
      sinceDays,
    })

    // Display the final result in a nice format
    console.log(chalk.cyan.bold('═'.repeat(70)))
    console.log(chalk.white.bold('\n📋 Release Notes Preview\n'))
    console.log(chalk.gray(`Locale: ${chalk.cyan(result.locale)}`))
    console.log(chalk.gray(`Commits analyzed: ${chalk.cyan(result.commitCount)}`))
    console.log(chalk.gray(`Since: ${chalk.cyan(result.sinceDate.toLocaleDateString())}`))
    if (result.lastBuildVersion) {
      console.log(chalk.gray(`Last build: ${chalk.cyan(result.lastBuildVersion)}`))
    }
    console.log('')
    console.log(chalk.cyan.bold('─'.repeat(70)))
    console.log(chalk.white(result.releaseNotes))
    console.log(chalk.cyan.bold('─'.repeat(70)))
    console.log('')
    console.log(chalk.gray(`Characters: ${chalk.cyan(result.releaseNotes.length)}/4000`))
    console.log('')
    console.log(chalk.green.bold('✅ Preview complete!'))
    console.log(chalk.gray('Use these notes with'), chalk.cyan('asca submit --release-notes "..."'), chalk.gray('when ready\n'))

    process.exit(0)
  } catch (error: any) {
    console.error(chalk.red.bold('\n❌ Failed to generate release notes:'), chalk.red(error.message), '\n')
    
    // Provide helpful hints based on error
    if (error.message.includes('git')) {
      console.error(chalk.yellow('💡 Make sure you are in a git repository\n'))
    } else if (error.message.includes('OpenAI') || error.message.includes('API')) {
      console.error(chalk.yellow('💡 Check your OpenAI API key and organization ID\n'))
    } else if (error.message.includes('No commits')) {
      console.error(chalk.yellow('💡 Try using --since-days to look back further\n'))
    }
    
    process.exit(1)
  }
}

async function handleConfig(args: CLIArgs) {
  // Handle --show flag
  if (args.help || (args as any).show) {
    const config = loadConfig()
    if (Object.keys(config).length === 0) {
      console.log(chalk.yellow('\n⚠️  No configuration found\n'))
      console.log(chalk.gray(`Run ${chalk.cyan('asca config')} to set up your credentials\n`))
      process.exit(0)
    }

    console.log(chalk.cyan.bold('\n📋 Current Configuration:\n'))
    console.log(chalk.gray(`Location: ${chalk.cyan(CONFIG_FILE)}\n`))

    console.log(chalk.cyan.bold('App Store Connect Credentials:\n'))
    if (config.issuerId) console.log(`${chalk.green('Issuer ID:')}      ${config.issuerId}`)
    if (config.keyId) console.log(`${chalk.green('Key ID:')}         ${config.keyId}`)
    if (config.privateKeyPath) console.log(`${chalk.green('Private Key:')}   ${config.privateKeyPath}`)
    if (config.appId) console.log(`${chalk.green('App ID:')}         ${config.appId}`)
    if (config.platform) console.log(`${chalk.green('Platform:')}       ${config.platform}`)
    if (config.locale) console.log(`${chalk.green('Locale:')}         ${config.locale}`)

    if (config.openaiApiKey || config.openaiOrgId) {
      console.log(chalk.cyan.bold('\nOpenAI Configuration (for auto-generating release notes):\n'))
      if (config.openaiApiKey) {
        const maskedKey = `${config.openaiApiKey.substring(0, 7)}...${config.openaiApiKey.slice(-4)}`
        console.log(`${chalk.green('API Key:')}        ${maskedKey}`)
      }
      if (config.openaiOrgId) console.log(`${chalk.green('Org ID:')}         ${config.openaiOrgId}`)
    }

    console.log(chalk.gray(`\nRun ${chalk.cyan('asca config')} to update\n`))
    process.exit(0)
  }

  // Handle --reset flag
  if ((args as any).reset) {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE)
      console.log(chalk.green.bold('\n✅ Configuration deleted\n'))
    } else {
      console.log(chalk.yellow('\n⚠️  No configuration found\n'))
    }
    process.exit(0)
  }

  // Interactive configuration
  console.log(chalk.cyan.bold('\n⚙️  App Store Connect API Configuration\n'))
  console.log(chalk.gray('This will save your default credentials to:'))
  console.log(chalk.cyan(`${CONFIG_FILE}\n`))
  console.log(chalk.gray('Press Enter to skip a field or keep the current value.\n'))

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  try {
    const currentConfig = loadConfig()

    const issuerId = await askQuestion(
      rl,
      chalk.yellow('Issuer ID'),
      currentConfig.issuerId
    )

    const keyId = await askQuestion(
      rl,
      chalk.yellow('Key ID'),
      currentConfig.keyId
    )

    const privateKeyPath = await askQuestion(
      rl,
      chalk.yellow('Private Key Path') + chalk.dim(' (e.g., ./keys/AuthKey.p8)'),
      currentConfig.privateKeyPath
    )

    const appId = await askQuestion(
      rl,
      chalk.yellow('Default App ID'),
      currentConfig.appId
    )

    const platform = await askQuestion(
      rl,
      chalk.yellow('Default Platform') + chalk.dim(' (IOS/MACOS/TVOS)'),
      currentConfig.platform || 'IOS'
    ) as 'IOS' | 'MACOS' | 'TVOS'

    const locale = await askQuestion(
      rl,
      chalk.yellow('Default Locale') + chalk.dim(' (e.g., en-US, pt-BR)'),
      currentConfig.locale || 'en-US'
    )

    // OpenAI configuration (optional)
    console.log(chalk.gray('\n--- Optional: OpenAI Configuration (for auto-generating release notes) ---\n'))

    const openaiApiKey = await askQuestion(
      rl,
      chalk.yellow('OpenAI API Key') + chalk.dim(' (optional, press Enter to skip)'),
      currentConfig.openaiApiKey
    )

    const openaiOrgId = await askQuestion(
      rl,
      chalk.yellow('OpenAI Org ID') + chalk.dim(' (optional, press Enter to skip)'),
      currentConfig.openaiOrgId
    )

    rl.close()

    // Build new config
    const newConfig: Config = {}
    if (issuerId) newConfig.issuerId = issuerId
    if (keyId) newConfig.keyId = keyId
    if (privateKeyPath) newConfig.privateKeyPath = privateKeyPath
    if (appId) newConfig.appId = appId
    if (platform) newConfig.platform = platform
    if (locale) newConfig.locale = locale
    if (openaiApiKey) newConfig.openaiApiKey = openaiApiKey
    if (openaiOrgId) newConfig.openaiOrgId = openaiOrgId

    // Save config
    saveConfig(newConfig)

    console.log(chalk.green.bold('\n✅ Configuration saved successfully!\n'))
    console.log(chalk.gray(`Location: ${chalk.cyan(CONFIG_FILE)}\n`))
    console.log(chalk.gray('You can now run commands without specifying these values.'))
    console.log(chalk.gray(`CLI args and env vars will override these defaults.\n`))

    process.exit(0)
  } catch (error: any) {
    rl.close()
    console.error(chalk.red.bold('\n❌ Configuration failed:'), chalk.red(error.message), '\n')
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
    case 'release-notes':
      await handleReleaseNotes(args)
      break
    case 'config':
      await handleConfig(args)
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

