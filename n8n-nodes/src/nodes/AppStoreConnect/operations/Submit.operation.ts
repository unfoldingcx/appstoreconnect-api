import {
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import {
	submitToAppReview,
	getBuilds,
	AppStoreConnectOptions,
} from '@unfoldingcx/appstoreconnect-api';

export async function executeSubmitOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('appStoreConnectApi');

	// Get input parameters
	let buildId = this.getNodeParameter('buildId', index) as string;
	const versionString = this.getNodeParameter('versionString', index) as string;
	const platform = this.getNodeParameter('platform', index, 'IOS') as string;
	const locale = this.getNodeParameter('locale', index, 'en-US') as string;
	const releaseNotes = this.getNodeParameter('releaseNotes', index, '') as string;
	const useAiNotes = this.getNodeParameter('useAiNotes', index, false) as boolean;

	// Handle 'latest' build ID
	if (buildId === 'latest') {
		const builds = await getBuilds(
			credentials.appId as string,
			{
				issuerId: credentials.issuerId as string,
				keyId: credentials.keyId as string,
				privateKeyPath: '' // Not used in n8n context
			},
			100
		);

		const latestValidBuild = builds.find(b => b.attributes.processingState === 'VALID');
		if (!latestValidBuild) {
			throw new Error('No valid builds found. Cannot use "latest" without at least one valid build.');
		}
		buildId = latestValidBuild.id;
	}

	// Prepare submission parameters
	const submitParams: AppStoreConnectOptions = {
		issuerId: credentials.issuerId as string,
		keyId: credentials.keyId as string,
		privateKeyPath: '' as any, // Will use privateKeyContent instead
		appId: credentials.appId as string,
		buildId,
		versionString,
		platform: platform as 'IOS' | 'MACOS' | 'TVOS',
		locale,
		releaseNotes: releaseNotes || 'Released via n8n',
	};

	// Execute submission
	await submitToAppReview(submitParams);

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
	];
}

