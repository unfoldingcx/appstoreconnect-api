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
	const logs: string[] = []

	logs.push('========================================')
	logs.push('EXECUTING: Cancel Operation')
	logs.push('========================================')

	const credentials = await this.getCredentials('appStoreConnectApi')

	logs.push(`Credentials loaded: issuerId=${credentials.issuerId}, keyId=${credentials.keyId}, appId=${credentials.appId}, hasPrivateKey=${!!(credentials.privateKey)}`)

	// Write private key to temporary file
	const tmpDir = os.tmpdir()
	const keyPath = path.join(tmpDir, `asc-key-${Date.now()}.p8`)
	logs.push(`Writing private key to: ${keyPath}`)
	
	// Check private key format
	const privateKey = credentials.privateKey as string
	logs.push(`Private key length: ${privateKey.length} characters`)
	logs.push(`Private key starts with: ${privateKey.substring(0, 30)}...`)
	
	// Fix potential formatting issues with the private key
	let formattedKey = privateKey
		.replace(/\\n/g, '\n')  // Replace escaped newlines
		.replace(/\\r/g, '')    // Remove carriage returns
		.trim()                 // Remove extra whitespace
	
	// If the key doesn't have proper line breaks between header/footer and content
	if (!formattedKey.includes('\n') || formattedKey.split('\n').length < 3) {
		logs.push('WARNING: Private key appears to be on a single line, attempting to fix...')
		
		// Extract the base64 content between the markers
		const keyMatch = formattedKey.match(/-----BEGIN PRIVATE KEY-----(.+?)-----END PRIVATE KEY-----/)
		if (keyMatch && keyMatch[1]) {
			const base64Content = keyMatch[1].trim()
			
			// Properly format with line breaks every 64 characters
			const formattedBase64 = base64Content.match(/.{1,64}/g)?.join('\n') || base64Content
			
			// Reconstruct the key with proper formatting
			formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedBase64}\n-----END PRIVATE KEY-----`
			logs.push(`Reformatted key with proper line breaks`)
		}
	}
	
	logs.push(`Formatted key length: ${formattedKey.length} characters`)
	logs.push(`Formatted key lines: ${formattedKey.split('\n').length}`)
	fs.writeFileSync(keyPath, formattedKey)
	
	// Verify file was written
	const fileExists = fs.existsSync(keyPath)
	const fileSize = fileExists ? fs.statSync(keyPath).size : 0
	logs.push(`File written: ${fileExists}, size: ${fileSize} bytes`)

	try {
		logs.push('Calling cancelPendingReviewSubmissions API...')
		const startTime = Date.now()
		const result = await cancelPendingReviewSubmissions(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: keyPath
			}
		)
		const duration = Date.now() - startTime

		logs.push(`API Response received in ${duration}ms: ${result}`)
		logs.push(`Result: ${result ? 'Submissions were canceled' : 'No pending submissions found'}`)

		const response = [
			{
				json: {
					success: true,
					message: result ? 'Successfully canceled pending submissions' : 'No pending submissions to cancel',
					canceled: result,
					debug_logs: logs,
					execution_time_ms: duration,
				},
			} as INodeExecutionData,
		]

		logs.push('Operation completed successfully')
		return response
	} catch (error) {
		logs.push(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
		if (error instanceof Error && error.stack) {
			logs.push(`Stack: ${error.stack}`)
		}

		return [
			{
				json: {
					success: false,
					message: `Error: ${error instanceof Error ? error.message : String(error)}`,
					canceled: false,
					debug_logs: logs,
					error: error instanceof Error ? error.message : String(error),
				},
			} as INodeExecutionData,
		]
	} finally {
		// Clean up temporary key file
		if (fs.existsSync(keyPath)) {
			logs.push(`Cleaning up temp file: ${keyPath}`)
			fs.unlinkSync(keyPath)
		}
	}
}

