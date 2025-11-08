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
	console.log('[ASCA] ========================================')
	console.log('[ASCA] EXECUTING: Cancel Operation')
	console.log('[ASCA] ========================================')

	const credentials = await this.getCredentials('appStoreConnectApi')

	console.log('[ASCA] Credentials loaded:', {
		issuerId: credentials.issuerId,
		keyId: credentials.keyId,
		appId: credentials.appId,
		hasPrivateKey: !!(credentials.privateKey),
	})

	// Write private key to temporary file
	const tmpDir = os.tmpdir()
	const keyPath = path.join(tmpDir, `asc-key-${Date.now()}.p8`)
	console.log('[ASCA] Writing private key to:', keyPath)
	fs.writeFileSync(keyPath, credentials.privateKey as string)

	try {
		console.log('[ASCA] Calling cancelPendingReviewSubmissions...')
		const result = await cancelPendingReviewSubmissions(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: keyPath
			}
		)

		console.log('[ASCA] API Response:', result)

		const response = [
			{
				json: {
					success: true,
					message: result ? 'Successfully canceled pending submissions' : 'No pending submissions to cancel',
					canceled: result,
				},
			} as INodeExecutionData,
		]

		console.log('[ASCA] Returning response:', JSON.stringify(response, null, 2))
		return response
	} catch (error) {
		console.error('[ASCA] ERROR in Cancel operation:', error)
		throw error
	} finally {
		// Clean up temporary key file
		if (fs.existsSync(keyPath)) {
			console.log('[ASCA] Cleaning up temp file:', keyPath)
			fs.unlinkSync(keyPath)
		}
	}
}

