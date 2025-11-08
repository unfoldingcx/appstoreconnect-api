/**
 * AI Release Notes Generator - Example Usage
 * 
 * This example demonstrates how to use the AI release notes generator
 * to automatically create release notes from git commits.
 */

import * as path from 'path'

import {
  generateAIReleaseNotes,
  getLastPublishedBuild,
  getGitCommitsSince,
  generateReleaseNotesWithAI,
  isGitRepository,
} from '../src/ai-release-notes.js'

// ============================================================================
// Example 1: Generate release notes automatically
// ============================================================================

async function example1_AutomaticReleaseNotes() {
  console.log('=== Example 1: Automatic Release Notes ===\n')

  try {
    const result = await generateAIReleaseNotes({
      // App Store Connect credentials
      credentials: {
        issuerId: process.env.ASC_ISSUER_ID || 'your-issuer-id',
        keyId: process.env.ASC_KEY_ID || 'your-key-id',
        privateKeyPath: process.env.ASC_KEY_PATH || './keys/AuthKey.p8',
      },
      
      // App ID
      appId: process.env.APP_ID || 'your-app-id',
      
      // Git repository path (current directory by default)
      gitRepoPath: process.cwd(),
      
      // Target locale
      locale: 'en-US', // or 'pt-BR', 'es-ES', etc.
      
      // OpenAI credentials
      openaiApiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
      openaiOrgId: process.env.OPENAI_ORG_ID, // optional
      
      // Optional: limit commits
      maxCommits: 50,
    })

    console.log('Generated Release Notes:')
    console.log(result.releaseNotes)
    console.log(`\nBased on ${result.commitCount} commits since ${result.sinceDate.toLocaleDateString()}`)
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

// ============================================================================
// Example 2: Generate release notes for last 7 days
// ============================================================================

async function example2_Last7Days() {
  console.log('\n=== Example 2: Release Notes for Last 7 Days ===\n')

  try {
    const result = await generateAIReleaseNotes({
      credentials: {
        issuerId: process.env.ASC_ISSUER_ID || 'your-issuer-id',
        keyId: process.env.ASC_KEY_ID || 'your-key-id',
        privateKeyPath: process.env.ASC_KEY_PATH || './keys/AuthKey.p8',
      },
      appId: process.env.APP_ID || 'your-app-id',
      locale: 'pt-BR', // Brazilian Portuguese
      openaiApiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
      
      // Override: use last 7 days instead of last build date
      sinceDays: 7,
    })

    console.log('Notas de Lançamento:')
    console.log(result.releaseNotes)
  } catch (error: any) {
    console.error('Erro:', error.message)
  }
}

// ============================================================================
// Example 3: Generate release notes from specific date
// ============================================================================

async function example3_SpecificDate() {
  console.log('\n=== Example 3: Release Notes Since Specific Date ===\n')

  const sinceDate = new Date('2025-01-01')

  try {
    const result = await generateAIReleaseNotes({
      credentials: {
        issuerId: process.env.ASC_ISSUER_ID || 'your-issuer-id',
        keyId: process.env.ASC_KEY_ID || 'your-key-id',
        privateKeyPath: process.env.ASC_KEY_PATH || './keys/AuthKey.p8',
      },
      appId: process.env.APP_ID || 'your-app-id',
      locale: 'es-ES', // Spanish
      openaiApiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
      
      // Override: use specific date
      sinceDate,
    })

    console.log('Notas de la Versión:')
    console.log(result.releaseNotes)
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

// ============================================================================
// Example 4: Manual workflow - step by step
// ============================================================================

async function example4_ManualWorkflow() {
  console.log('\n=== Example 4: Manual Step-by-Step Workflow ===\n')

  try {
    const credentials = {
      issuerId: process.env.ASC_ISSUER_ID || 'your-issuer-id',
      keyId: process.env.ASC_KEY_ID || 'your-key-id',
      privateKeyPath: process.env.ASC_KEY_PATH || './keys/AuthKey.p8',
    }
    const appId = process.env.APP_ID || 'your-app-id'

    // Step 1: Check if we're in a git repository
    if (!isGitRepository()) {
      console.log('❌ Not a git repository')
      return
    }
    console.log('✅ Git repository detected\n')

    // Step 2: Get last published build
    const lastBuild = await getLastPublishedBuild(appId, credentials)
    if (!lastBuild) {
      console.log('No builds found')
      return
    }

    // Step 3: Get commits since that build
    const commits = await getGitCommitsSince(
      process.cwd(),
      new Date(lastBuild.attributes.uploadedDate),
      50
    )

    console.log(`Found ${commits.length} commits:\n`)
    commits.slice(0, 3).forEach(commit => {
      console.log(`  ${commit.hash.substring(0, 7)} - ${commit.message}`)
    })
    if (commits.length > 3) {
      console.log(`  ... and ${commits.length - 3} more\n`)
    }

    // Step 4: Generate release notes
    const releaseNotes = await generateReleaseNotesWithAI(
      commits,
      'en-US',
      process.env.OPENAI_API_KEY || 'your-openai-api-key',
      process.env.OPENAI_ORG_ID
    )

    console.log('Generated Release Notes:')
    console.log(releaseNotes)
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

// ============================================================================
// Example 5: Multiple locales
// ============================================================================

async function example5_MultipleLocales() {
  console.log('\n=== Example 5: Generate for Multiple Locales ===\n')

  const locales = ['en-US', 'pt-BR', 'es-ES']
  const baseOptions = {
    credentials: {
      issuerId: process.env.ASC_ISSUER_ID || 'your-issuer-id',
      keyId: process.env.ASC_KEY_ID || 'your-key-id',
      privateKeyPath: process.env.ASC_KEY_PATH || './keys/AuthKey.p8',
    },
    appId: process.env.APP_ID || 'your-app-id',
    openaiApiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    sinceDays: 14,
  }

  for (const locale of locales) {
    console.log(`\n📍 Generating for ${locale}...\n`)
    
    try {
      const result = await generateAIReleaseNotes({
        ...baseOptions,
        locale,
      })

      console.log(`Release Notes (${locale}):`)
      console.log('─'.repeat(60))
      console.log(result.releaseNotes)
      console.log('─'.repeat(60))
    } catch (error: any) {
      console.error(`Error for ${locale}:`, error.message)
    }
  }
}

// ============================================================================
// Run examples
// ============================================================================

async function main() {
  // Check for required environment variables
  const requiredEnvVars = ['ASC_ISSUER_ID', 'ASC_KEY_ID', 'ASC_KEY_PATH', 'APP_ID', 'OPENAI_API_KEY']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:')
    missingVars.forEach(varName => console.log(`   - ${varName}`))
    console.log('\nSet them in your environment or modify the examples to use hardcoded values.\n')
    console.log('Example:')
    console.log('export ASC_ISSUER_ID="your-issuer-id"')
    console.log('export ASC_KEY_ID="your-key-id"')
    console.log('export ASC_KEY_PATH="./keys/AuthKey.p8"')
    console.log('export APP_ID="your-app-id"')
    console.log('export OPENAI_API_KEY="sk-..."')
    console.log('export OPENAI_ORG_ID="org-..." # optional\n')
    process.exit(1)
  }

  // Run the example you want to test
  // Uncomment one of the following:
  
  await example1_AutomaticReleaseNotes()
  // await example2_Last7Days()
  // await example3_SpecificDate()
  // await example4_ManualWorkflow()
  // await example5_MultipleLocales()
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

