import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import {
	getBuilds,
} from '@unfoldingcx/appstoreconnect-api'
import {
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow'
import axios from 'axios'
import pkg from 'jsonwebtoken'
const { sign } = pkg

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
	
	// Check private key format
	const privateKey = credentials.privateKey as string
	logs.push(`Private key length: ${privateKey.length} characters`)
	logs.push(`Private key starts with: ${privateKey.substring(0, 30)}...`)
	logs.push(`Private key ends with: ...${privateKey.substring(privateKey.length - 30)}`)
	
	// Fix potential formatting issues with the private key
	const formattedKey = privateKey
		.replace(/\\n/g, '\n')  // Replace escaped newlines
		.replace(/\\r/g, '')    // Remove carriage returns
		.trim()                 // Remove extra whitespace
	
	logs.push(`Formatted key length: ${formattedKey.length} characters`)
	fs.writeFileSync(keyPath, formattedKey)
	
	// Verify file was written
	const fileExists = fs.existsSync(keyPath)
	const fileSize = fileExists ? fs.statSync(keyPath).size : 0
	logs.push(`File written: ${fileExists}, size: ${fileSize} bytes`)

	try {
		logs.push('Calling getBuilds API...')
		const startTime = Date.now()
		
		// Add more detailed logging
		logs.push(`Calling with appId: ${credentials.appId}`)
		logs.push(`Calling with issuerId: ${credentials.issuerId}`)
		logs.push(`Calling with keyId: ${credentials.keyId}`)
		logs.push(`Calling with keyPath: ${keyPath}`)
		logs.push(`Calling with limit: ${limit}`)
		
		// Try to generate JWT directly to test if that's the issue
		try {
			logs.push('Testing JWT generation...')
			const privateKeyContent = fs.readFileSync(keyPath, 'utf8')
			logs.push(`Read private key from file: ${privateKeyContent.substring(0, 50)}...`)
			
			const payload = {
				iss: credentials.issuerId as string,
				exp: Math.floor(Date.now() / 1000) + 1200, // 20 min
				aud: 'appstoreconnect-v1',
			}
			const signOptions = {
				algorithm: 'ES256' as const,
				header: { alg: 'ES256', kid: credentials.keyId as string, typ: 'JWT' },
			}
			
			const jwt = sign(payload, privateKeyContent, signOptions)
			logs.push(`JWT generated successfully, length: ${jwt.length}`)
			
			// Try direct API call
			logs.push('Testing direct API call...')
			const directResponse = await axios.get(
				'https://api.appstoreconnect.apple.com/v1/builds',
				{
					headers: {
						Authorization: `Bearer ${jwt}`,
						'Content-Type': 'application/json',
					},
					params: {
						sort: '-uploadedDate',
						'filter[app]': credentials.appId,
						'filter[processingState]': 'VALID,PROCESSING',
						limit: 10,
					}
				}
			)
			
			logs.push(`Direct API call successful: ${directResponse.data.data?.length || 0} builds`)
		} catch (testError) {
			logs.push(`JWT/API Test Error: ${testError instanceof Error ? testError.message : String(testError)}`)
		}
		
		// Note: The main library's getBuilds has a filter for VALID,PROCESSING only
		// We might want to get all builds regardless of state
		const builds = await getBuilds(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: keyPath
			},
			Math.max(limit, 100)  // Get at least 100 to make sure we see something
		)
		const duration = Date.now() - startTime
		
		logs.push(`API Response received in ${duration}ms: Found ${builds.length} builds`)
		if (duration < 100 && builds.length === 0) {
			logs.push(`WARNING: Response too fast (${duration}ms) - API call likely failed silently`)
			logs.push('The main library might be catching and suppressing errors')
		}
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

