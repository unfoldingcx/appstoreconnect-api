import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import {
	getBuilds,
} from '@unfoldingcx/appstoreconnect-api';

export async function executeGetBuildsOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	console.log('[ASCA] ========================================')
	console.log('[ASCA] EXECUTING: Get Builds Operation')
	console.log('[ASCA] ========================================')
	
	const credentials = await this.getCredentials('appStoreConnectApi')
	const limit = this.getNodeParameter('limit', index, 10) as number
	
	console.log('[ASCA] Parameters:', { limit })
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
		console.log('[ASCA] Calling getBuilds...')
		const builds = await getBuilds(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: keyPath
			},
			limit
		)
		
		console.log('[ASCA] API Response: Found', builds.length, 'builds')

		const response = [
			{
				json: {
					success: true,
					totalBuilds: builds.length,
					buildsReturned: Math.min(limit, builds.length),
					builds: builds.slice(0, limit).map(build => ({
						id: build.id,
						version: build.attributes.version,
						processingState: build.attributes.processingState,
						uploadedDate: build.attributes.uploadedDate,
						expirationDate: build.attributes.expirationDate,
					})),
				},
			} as INodeExecutionData,
		]
		
		console.log('[ASCA] Returning', response[0].json.buildsReturned, 'builds')
		return response
	} catch (error) {
		console.error('[ASCA] ERROR in GetBuilds operation:', error)
		throw error
	} finally {
		// Clean up temporary key file
		if (fs.existsSync(keyPath)) {
			console.log('[ASCA] Cleaning up temp file:', keyPath)
			fs.unlinkSync(keyPath)
		}
	}
}

