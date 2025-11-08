# Publishing the n8n Community Node

This guide covers how to publish and maintain the `n8n-nodes-appstoreconnect` community node on npm.

## Prerequisites

1. npm account with publish permissions
2. Node.js/Bun installed locally
3. Git repository with the n8n-nodes directory

## Step 1: Prepare for Release

### Update Version Numbers

Edit `n8n-nodes/package.json` and update the version:

```json
{
  "name": "n8n-nodes-appstoreconnect",
  "version": "1.0.1"
}
```

### Follow Semantic Versioning

- `MAJOR.MINOR.PATCH`
- `1.0.0` → `1.1.0` for new features
- `1.0.0` → `1.0.1` for bug fixes
- `1.0.0` → `2.0.0` for breaking changes

### Update CHANGELOG (if exists)

Create or update a changelog in the n8n-nodes directory:

```markdown
## [1.0.1] - 2024-01-15

### Fixed
- Fixed compatibility with n8n 1.10+

## [1.0.0] - 2024-01-08

### Added
- Initial release with Submit, Get Builds, and Cancel operations
```

## Step 2: Build and Test Locally

### Build the Package

```bash
cd n8n-nodes
bun install
bun run build
```

Verify the dist folder contains:
- `dist/credentials/AppStoreConnectApi.credentials.js`
- `dist/nodes/AppStoreConnect/AppStoreConnect.node.js`
- `dist/nodes/AppStoreConnect/appStoreConnect.svg`
- `dist/index.js` and `dist/index.d.ts`

### Test Locally in n8n

You can test the node locally before publishing:

```bash
# Option 1: Using npm link (if using local n8n development)
cd n8n-nodes
npm link
cd /path/to/n8n
npm link n8n-nodes-appstoreconnect

# Option 2: Copy directly to n8n modules
cp -r n8n-nodes/dist/* ~/.n8n/node_modules/n8n-nodes-appstoreconnect/
```

## Step 3: Verify Package Contents

Check what will be published:

```bash
cd n8n-nodes
npm pack --dry-run
```

This should show:
- All necessary files in dist/
- README.md
- package.json
- .npmignore (if used)

Important: Ensure `.npmignore` excludes:
- src/ (source files)
- node_modules/
- tsconfig.json
- .gitignore
- *.test.ts

## Step 4: Publish to npm

### Authenticate

```bash
npm login
# Enter your npm credentials
```

### Publish

```bash
cd n8n-nodes
npm publish
```

The package will be published to: `https://www.npmjs.com/package/n8n-nodes-appstoreconnect`

### Verify Publication

Check the npm registry:

```bash
npm info n8n-nodes-appstoreconnect

# Or visit the URL
https://www.npmjs.com/package/n8n-nodes-appstoreconnect
```

## Step 5: After Publishing

### Update Main Package

Update the main package's README to reference the latest n8n node version:

```bash
npm run build  # Build main package
npm publish    # If needed
```

### Create GitHub Release (Optional)

Create a tag and release:

```bash
git tag -a n8n-nodes@1.0.1 -m "n8n node release v1.0.1"
git push origin n8n-nodes@1.0.1
```

Then create a GitHub release at:
`https://github.com/unfoldingcx/appstoreconnect-api/releases`

### Notify Users

1. Update CHANGELOG.md in the root of the repo
2. Update the main README.md with new version
3. Consider posting in n8n community (if applicable)

## Troubleshooting

### Package Already Exists

If you get an error about the package already existing:

```
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/n8n-nodes-appstoreconnect
npm ERR! You must sign up for private packages
```

This means either:
1. The version is already published - increment version and retry
2. You don't have permissions - ask a maintainer to add you as a collaborator

### Build Errors Before Publishing

Run type checking before publishing:

```bash
cd n8n-nodes
bun run type-check
```

### Large Bundle

If the published package is too large:

1. Update `.npmignore` to exclude more files
2. Run `npm pack --dry-run` to check size
3. Ensure no node_modules are being included

```bash
# Check actual size
ls -lh n8n-nodes/dist/
```

## Publishing Maintenance

### Version Management

Keep track of versions:

```bash
npm view n8n-nodes-appstoreconnect versions
```

### Deprecating Old Versions

```bash
npm deprecate n8n-nodes-appstoreconnect@1.0.0 "Please upgrade to 1.1.0 for bug fixes"
```

### Updating Existing Version

You cannot republish the same version. Always increment:

```bash
# Bad: This will fail
npm publish  # When 1.0.0 already exists

# Good: Update package.json to 1.0.1 first
vim n8n-nodes/package.json
npm publish
```

## n8n Community Node Requirements

The package.json must include:

```json
{
  "name": "n8n-nodes-appstoreconnect",
  "keywords": ["n8n-community-node-package"],
  "n8n": {
    "nodes": ["dist/nodes/AppStoreConnect/AppStoreConnect.node.js"],
    "credentials": ["dist/credentials/AppStoreConnectApi.credentials.js"]
  }
}
```

The keyword `n8n-community-node-package` is required for n8n to recognize and display the package in their community node registry.

## Getting Help

- [n8n Node Development Docs](https://docs.n8n.io/integrations/creating-nodes/introduction/)
- [npm Publish Documentation](https://docs.npmjs.com/packages-and-modules/publishing-a-package)
- [Community Node Registry](https://n8n.io/integrations/community-nodes/)

## License

All code is published under the MIT License. Ensure the LICENSE file is included in your package.

