import {
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

export async function executeGenerateReleaseNotesOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const credentials = await this.getCredentials('appStoreConnectApi');

	const locale = this.getNodeParameter('locale', index, 'en-US') as string;
	const sinceDays = this.getNodeParameter('sinceDays', index, undefined) as number | undefined;
	const gitRepoPath = this.getNodeParameter('gitRepoPath', index, undefined) as string | undefined;

	// Validate OpenAI credentials
	if (!credentials.openaiApiKey) {
		throw new Error('OpenAI API Key is required for generating release notes. Please add it to your credentials.');
	}

	// Note: AI Release Notes generation requires dynamic import of the module
	// This is because generateAIReleaseNotes is exported from a separate module
	// For now, we'll throw a helpful error guiding users to use the CLI instead
	throw new Error(
		'AI Release Notes generation is not yet available in the n8n node. ' +
		'Please use the CLI command: asca release-notes --app-id <ID> --locale ' + locale +
		(sinceDays ? ' --since-days ' + sinceDays : '') +
		(gitRepoPath ? ' --git-path ' + gitRepoPath : '') +
		'\n\nThe n8n node currently supports: Submit to Review, Get Builds, and Cancel Submissions. ' +
		'AI Release Notes features will be added in a future update.'
	);
}

