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
	const credentials = await this.getCredentials('appStoreConnectApi');
	const limit = this.getNodeParameter('limit', index, 10) as number;

	// Write private key to temporary file
	const tmpDir = os.tmpdir();
	const keyPath = path.join(tmpDir, `asc-key-${Date.now()}.p8`);
	fs.writeFileSync(keyPath, credentials.privateKey as string);

	try {
		const builds = await getBuilds(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: keyPath
			},
			limit
		);

		return [
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
		];
	} finally {
		// Clean up temporary key file
		if (fs.existsSync(keyPath)) {
			fs.unlinkSync(keyPath);
		}
	}
}

