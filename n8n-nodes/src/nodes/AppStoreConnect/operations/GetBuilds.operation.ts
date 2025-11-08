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
	const logs: string[] = []
	
	logs.push('========================================')
	logs.push('EXECUTING: Get Builds Operation')
	logs.push('========================================')
	
	const credentials = await this.getCredentials('appStoreConnectApi')
	const limit = this.getNodeParameter('limit', index, 10) as number
	
	logs.push(`Parameters: limit=${limit}`)
	logs.push(`Credentials loaded: issuerId=${credentials.issuerId}, keyId=${credentials.keyId}, appId=${credentials.appId}, hasPrivateKey=${!!(credentials.privateKey)}`)

	// Write private key to temporary file
	const tmpDir = os.tmpdir()
	const keyPath = path.join(tmpDir, `asc-key-${Date.now()}.p8`)
	logs.push(`Writing private key to: ${keyPath}`)
	fs.writeFileSync(keyPath, credentials.privateKey as string)

	try {
		logs.push('Calling getBuilds API...')
		const startTime = Date.now()
		const builds = await getBuilds(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: keyPath
			},
			limit
		)
		const duration = Date.now() - startTime
		
		logs.push(`API Response received in ${duration}ms: Found ${builds.length} builds`)
		logs.push(`Returning ${Math.min(limit, builds.length)} builds`)

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
					totalBuilds: 0,
					buildsReturned: 0,
					builds: [],
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

