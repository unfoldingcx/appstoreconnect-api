import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow'

import { executeCancelOperation } from './operations/Cancel.operation'
import { executeGenerateReleaseNotesOperation } from './operations/GenerateReleaseNotes.operation'
import { executeGetBuildsOperation } from './operations/GetBuilds.operation'
import { executeSubmitOperation } from './operations/Submit.operation'

export class AppStoreConnect implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'App Store Connect',
    name: 'appStoreConnect',
    icon: 'file:appStoreConnect.svg',
    group: ['transform'],
    version: 1,
    description: 'Automate App Store Connect submissions, manage builds, and generate AI-powered release notes',
    defaults: {
      name: 'App Store Connect',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'appStoreConnectApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        required: true,
        options: [
          {
            name: 'Get Builds',
            value: 'getBuilds',
            description: 'Retrieve list of available builds',
            action: 'Get builds',
          },
          {
            name: 'Submit to Review',
            value: 'submit',
            description: 'Submit an app version to App Review',
            action: 'Submit to review',
          },
          {
            name: 'Cancel Pending Submissions',
            value: 'cancel',
            description: 'Cancel any pending App Review submissions',
            action: 'Cancel pending submissions',
          },
          {
            name: 'Generate AI Release Notes',
            value: 'generateReleaseNotes',
            description: 'Generate release notes from git commits using AI',
            action: 'Generate AI release notes',
          },
        ],
        default: 'getBuilds',
      },
      // ============ Submit Operation ============
      {
        displayName: 'Build ID',
        name: 'buildId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['submit'],
          },
        },
        description: 'Build ID to submit. Use "latest" to automatically fetch the latest valid build',
        placeholder: 'e.g., latest or xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      },
      {
        displayName: 'Version String',
        name: 'versionString',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['submit'],
          },
        },
        description: 'Semantic version for this release',
        placeholder: '1.0.0',
      },
      {
        displayName: 'Platform',
        name: 'platform',
        type: 'options',
        default: 'IOS',
        displayOptions: {
          show: {
            operation: ['submit'],
          },
        },
        options: [
          {
            name: 'iOS',
            value: 'IOS',
          },
          {
            name: 'macOS',
            value: 'MACOS',
          },
          {
            name: 'tvOS',
            value: 'TVOS',
          },
        ],
      },
      {
        displayName: 'Locale',
        name: 'locale',
        type: 'string',
        default: 'en-US',
        displayOptions: {
          show: {
            operation: ['submit'],
          },
        },
        description: 'Language locale for release notes',
        placeholder: 'en-US, pt-BR, fr-FR, etc.',
      },
      {
        displayName: 'Release Notes',
        name: 'releaseNotes',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['submit'],
            useAiNotes: [false],
          },
        },
        typeOptions: {
          rows: 5,
        },
        description: 'Release notes to submit (ignored if using AI notes)',
        placeholder: 'What\'s new in this version...',
      },
      {
        displayName: 'Use AI Release Notes',
        name: 'useAiNotes',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: ['submit'],
          },
        },
        description: 'Whether to generate release notes from git commits using AI',
      },
      {
        displayName: 'Since Days',
        name: 'sinceDays',
        type: 'number',
        default: undefined,
        displayOptions: {
          show: {
            operation: ['submit'],
            useAiNotes: [true],
          },
        },
        description: 'Optional: Number of days to look back in git history (default: auto-detect from last published build)',
      },
      // ============ Get Builds Operation ============
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 10,
        displayOptions: {
          show: {
            operation: ['getBuilds'],
          },
        },
        description: 'Maximum number of builds to return',
      },
      // ============ Generate Release Notes Operation ============
      {
        displayName: 'Locale',
        name: 'locale',
        type: 'string',
        default: 'en-US',
        displayOptions: {
          show: {
            operation: ['generateReleaseNotes'],
          },
        },
        description: 'Language locale for release notes',
        placeholder: 'en-US, pt-BR, fr-FR, etc.',
      },
      {
        displayName: 'Since Days',
        name: 'sinceDays',
        type: 'number',
        default: undefined,
        displayOptions: {
          show: {
            operation: ['generateReleaseNotes'],
          },
        },
        description: 'Optional: Number of days to look back in git history (default: since last published build)',
      },
      {
        displayName: 'Git Repository Path',
        name: 'gitRepoPath',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['generateReleaseNotes'],
          },
        },
        description: 'Optional: Path to git repository (default: current working directory)',
        placeholder: '/path/to/repo or leave empty for current directory',
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []
    const length = items.length
    let responseData

    for (let i = 0; i < length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string

        if (operation === 'submit') {
          responseData = await executeSubmitOperation.call(this, i)
        } else if (operation === 'getBuilds') {
          responseData = await executeGetBuildsOperation.call(this, i)
        } else if (operation === 'cancel') {
          responseData = await executeCancelOperation.call(this, i)
        } else if (operation === 'generateReleaseNotes') {
          responseData = await executeGenerateReleaseNotesOperation.call(this, i)
        } else {
          throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`)
        }

        returnData.push(...responseData)
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : String(error),
            },
          })
          continue
        }
        throw error
      }
    }

    return [returnData]
  }
}

