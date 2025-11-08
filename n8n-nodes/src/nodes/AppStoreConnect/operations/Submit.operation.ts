import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import {
	submitToAppReview,
	getBuilds,
	AppStoreConnectOptions,
} from '@unfoldingcx/appstoreconnect-api'
import {
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow'

export async function executeSubmitOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('appStoreConnectApi')

	// Write private key to temporary file
	const tmpDir = os.tmpdir()
	const keyPath = path.join(tmpDir, `asc-key-${Date.now()}.p8`)
	
	// Fix potential formatting issues with the private key
	let formattedKey = (credentials.privateKey as string)
		.replace(/\\n/g, '\n')  // Replace escaped newlines
		.replace(/\\r/g, '')    // Remove carriage returns
		.trim()                // Remove extra whitespace
	
	// If the key doesn't have proper line breaks between header/footer and content
	if (!formattedKey.includes('\n') || formattedKey.split('\n').length < 3) {
		// Extract the base64 content between the markers
		const keyMatch = formattedKey.match(/-----BEGIN PRIVATE KEY-----(.+?)-----END PRIVATE KEY-----/)
		if (keyMatch && keyMatch[1]) {
			const base64Content = keyMatch[1].trim()
			
			// Properly format with line breaks every 64 characters
			const formattedBase64 = base64Content.match(/.{1,64}/g)?.join('\n') || base64Content
			
			// Reconstruct the key with proper formatting
			formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedBase64}\n-----END PRIVATE KEY-----`
		}
	}
	
	fs.writeFileSync(keyPath, formattedKey)

	try {
		// Get input parameters
		let buildId = this.getNodeParameter('buildId', index) as string
		const versionString = this.getNodeParameter('versionString', index) as string
		const platform = this.getNodeParameter('platform', index, 'IOS') as string
		const locale = this.getNodeParameter('locale', index, 'en-US') as string
		const releaseNotes = this.getNodeParameter('releaseNotes', index, '') as string
		const useAiNotes = this.getNodeParameter('useAiNotes', index, false) as boolean

		// Handle 'latest' build ID
		if (buildId === 'latest') {
			const builds = await getBuilds(
				credentials.appId as string,
				{
					issuerId: credentials.issuerId as string,
					keyId: credentials.keyId as string,
					privateKeyPath: keyPath
				},
				100
			)

			const latestValidBuild = builds.find(b => b.attributes.processingState === 'VALID')
			if (!latestValidBuild) {
				throw new Error('No valid builds found. Cannot use "latest" without at least one valid build.')
			}
			buildId = latestValidBuild.id
		}

		// Prepare submission parameters
		const submitParams: AppStoreConnectOptions = {
			issuerId: credentials.issuerId as string,
			keyId: credentials.keyId as string,
			privateKeyPath: keyPath,
			appId: credentials.appId as string,
			buildId,
			versionString,
			platform: platform as 'IOS' | 'MACOS' | 'TVOS',
			locale,
			releaseNotes: releaseNotes || 'Released via n8n',
		}

		// Execute submission
		await submitToAppReview(submitParams)

		return [
			{
				json: {
					success: true,
					message: 'Successfully submitted to App Review',
					buildId,
					versionString,
					releaseNotes,
				},
			} as INodeExecutionData,
		]
	} finally {
		// Clean up temporary key file
		if (fs.existsSync(keyPath)) {
			fs.unlinkSync(keyPath)
		}
	}
}

