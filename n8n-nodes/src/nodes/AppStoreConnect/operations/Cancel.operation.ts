import {
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import {
	cancelPendingReviewSubmissions,
} from '@unfoldingcx/appstoreconnect-api';

export async function executeCancelOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('appStoreConnectApi');

	const result = await cancelPendingReviewSubmissions(
		credentials.appId as string,
		{
			issuerId: credentials.issuerId as string,
			keyId: credentials.keyId as string,
			privateKeyPath: '' // Not used in n8n context
		}
	);

	return [
		{
			json: {
				success: true,
				message: result ? 'Successfully canceled pending submissions' : 'No pending submissions to cancel',
				canceled: result,
			},
		} as INodeExecutionData,
	];
}

