import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import {
	cancelPendingReviewSubmissions,
} from '@unfoldingcx/appstoreconnect-api'
import {
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow'

export async function executeCancelOperation(
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
		.trim()                 // Remove extra whitespace
	
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
		const result = await cancelPendingReviewSubmissions(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: keyPath
			}
		)

		return [
			{
				json: {
					success: true,
					message: result ? 'Successfully canceled pending submissions' : 'No pending submissions to cancel',
					canceled: result,
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

