# Development Guide for n8n-nodes-appstoreconnect

This guide helps you develop and test the n8n community node locally.

## Setup

### Prerequisites

- Node.js 18+ or Bun
- n8n instance (local or running)
- Understanding of n8n node development

### Installation

```bash
cd n8n-nodes
bun install  # or npm install
```

## Development Workflow

### Build

```bash
bun run build
```

This compiles TypeScript and copies the SVG icon to dist/.

### Watch Mode

```bash
bun run dev
```

Auto-compiles TypeScript when files change.

### Type Checking

```bash
bun run type-check
```

Validates TypeScript without generating output.

## File Structure

```
src/
├── credentials/
│   └── AppStoreConnectApi.credentials.ts    # Credential type definition
├── nodes/
│   └── AppStoreConnect/
│       ├── AppStoreConnect.node.ts          # Main node implementation
│       ├── appStoreConnect.svg              # Node icon
│       └── operations/
│           ├── Submit.operation.ts          # Submit operation
│           ├── GetBuilds.operation.ts       # Get builds operation
│           ├── Cancel.operation.ts          # Cancel operation
│           └── GenerateReleaseNotes.operation.ts  # Release notes (partial)
└── index.ts                                 # Main export
```

## Understanding the Code

### Credentials Type (`AppStoreConnectApi.credentials.ts`)

Defines the credential fields shown to users:

```typescript
export class AppStoreConnectApi implements ICredentialType {
  name = 'appStoreConnectApi';
  
  properties: INodeProperties[] = [
    {
      displayName: 'Issuer ID',
      name: 'issuerId',
      type: 'string',
      // ...
    },
    // More properties...
  ];
}
```

### Node Implementation (`AppStoreConnect.node.ts`)

Implements the main node with operations:

```typescript
export class AppStoreConnect implements INodeType {
  description: INodeTypeDescription = {
    // Node metadata, properties, and operation definitions
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Routes to correct operation handler
  };
}
```

### Operation Files

Each operation is a separate module:

```typescript
export async function executeSubmitOperation(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  // Get parameters from n8n
  const param = this.getNodeParameter('paramName', index) as string;
  
  // Call the library function
  // Return result as INodeExecutionData[]
}
```

## Key Concepts

### IExecuteFunctions

n8n passes this context to your functions. Use it to:

- `this.getNodeParameter(name, index)` - Get input parameters
- `this.getCredentials(name)` - Get stored credentials
- `this.getInputData()` - Get data from previous nodes
- `this.continueOnFail()` - Check if errors should be caught

### INodeExecutionData

The return type for node outputs:

```typescript
return [{
  json: {
    success: true,
    data: resultData
  }
}];
```

### Parameters

Parameters are defined in `description.properties` and can be:

- Conditional: Shown only when specific conditions are met
- Required: Must be provided by user
- Optional: Can be left empty
- Dynamic: Dropdown options from API calls

## Testing in n8n

### Local Installation

```bash
# Build the package
bun run build

# Link to your n8n installation
npm link

# In your n8n user data directory:
cd ~/.n8n
npm link n8n-nodes-appstoreconnect
```

### Using Docker

If running n8n in Docker:

```bash
# Build the package
bun run build

# Copy to Docker volume
docker cp dist/ n8n_container:/home/node/.n8n/node_modules/n8n-nodes-appstoreconnect/

# Restart n8n
docker restart n8n_container
```

### Testing Nodes in n8n UI

1. Start your n8n instance
2. Create a new workflow
3. Add a node - search for "App Store Connect"
4. Configure credentials
5. Set parameters
6. Execute and check results

### Debugging

Enable n8n debug logs:

```bash
DEBUG=n8n* n8n start
```

Or for a specific node:

```bash
DEBUG=n8n:*nodes:appstoreconnect n8n start
```

## Adding New Operations

To add a new operation:

1. Create a new file in `src/nodes/AppStoreConnect/operations/`:

```typescript
// src/nodes/AppStoreConnect/operations/MyOperation.operation.ts
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

export async function executeMyOperation(
  this: IExecuteFunctions,
  index: number
): Promise<INodeExecutionData[]> {
  // Implementation
  return [{
    json: { /* result */ }
  }];
}
```

2. Import in `AppStoreConnect.node.ts`:

```typescript
import { executeMyOperation } from './operations/MyOperation.operation';
```

3. Add to description.properties:

```typescript
{
  displayName: 'My Operation',
  name: 'myOperation',
  type: 'options',
  options: [
    {
      name: 'My Operation',
      value: 'myOperation',
    },
    // ... other options
  ],
  default: 'submit',
}
```

4. Add parameters for the operation:

```typescript
{
  displayName: 'My Parameter',
  name: 'myParameter',
  type: 'string',
  displayOptions: {
    show: {
      operation: ['myOperation'],
    },
  },
}
```

5. Handle in execute:

```typescript
if (operation === 'myOperation') {
  responseData = await executeMyOperation.call(this, i);
}
```

## Common Issues

### Module Not Found

If you get "n8n-nodes-appstoreconnect not found" when loading n8n:

1. Ensure dist/ folder exists
2. Verify package.json "n8n" field points to correct files
3. Restart n8n after installing

### Credentials Not Appearing

If credentials don't show in the UI:

1. Check that `displayName` and `name` are set
2. Verify the credential class extends `ICredentialType`
3. Ensure it's exported in index.ts
4. Restart n8n

### Operation Not Showing

If an operation doesn't appear in the dropdown:

1. Verify it's in the options array
2. Check that `value` matches the operation name
3. Ensure it's handled in the execute method
4. Restart n8n

## Performance Tips

1. **Limit API Calls**: Cache build lists or results when possible
2. **Error Handling**: Use `try/catch` to provide meaningful errors
3. **Async Operations**: Make sure promises are properly awaited
4. **Memory**: Avoid storing large datasets in memory

## Best Practices

1. **Type Safety**: Always use proper TypeScript types
2. **Error Messages**: Provide clear, actionable error messages
3. **Documentation**: Comment complex logic
4. **Validation**: Validate credentials and parameters early
5. **Logging**: Use console.log sparingly (visible in n8n logs)

## Publishing

See [N8N_PUBLISHING.md](../../N8N_PUBLISHING.md) for publishing to npm.

## Resources

- [n8n Nodes Development](https://docs.n8n.io/integrations/creating-nodes/introduction/)
- [Node Property Types](https://docs.n8n.io/integrations/creating-nodes/node-ui/node-parameters/)
- [Creating Credentials](https://docs.n8n.io/integrations/creating-nodes/creating-credentials/)
- [n8n Types Reference](https://github.com/n8n-io/n8n/tree/master/packages/workflow/src)

## Support

For issues or questions:

- Check existing n8n node examples: [n8n-nodes-base](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes)
- Review [n8n Community Forum](https://community.n8n.io/)
- Open an issue: [GitHub Issues](https://github.com/unfoldingcx/appstoreconnect-api/issues)

