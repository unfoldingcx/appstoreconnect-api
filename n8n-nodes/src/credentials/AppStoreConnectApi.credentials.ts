import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow'

export class AppStoreConnectApi implements ICredentialType {
  name = 'appStoreConnectApi'

  displayName = 'App Store Connect API'

  properties: INodeProperties[] = [
    {
      displayName: 'Issuer ID',
      name: 'issuerId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your App Store Connect Issuer ID from Keys configuration',
      placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    },
    {
      displayName: 'Key ID',
      name: 'keyId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your App Store Connect Key ID from Keys configuration',
      placeholder: 'XXXXXXXXXX',
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      default: '',
      required: true,
      typeOptions: {
        alwaysOpenEditWindow: true,
      },
      description: 'Your App Store Connect private key content (.p8 file)',
      placeholder: '-----BEGIN PRIVATE KEY-----\n...',
    },
    {
      displayName: 'App ID',
      name: 'appId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your App Store Connect App ID (bundle ID)',
      placeholder: '6461211731',
    },
    {
      displayName: 'OpenAI API Key',
      name: 'openaiApiKey',
      type: 'string',
      default: '',
      required: false,
      typeOptions: {
        password: true,
      },
      description: 'Optional: OpenAI API Key for AI-powered release notes generation',
      placeholder: 'sk-...',
    },
    {
      displayName: 'OpenAI Organization ID',
      name: 'openaiOrgId',
      type: 'string',
      default: '',
      required: false,
      description: 'Optional: OpenAI Organization ID (leave empty if using personal account)',
      placeholder: 'org-...',
    },
  ]
}

