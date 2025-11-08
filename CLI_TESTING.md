# Testing the CLI Locally

Before publishing your package, you should test the CLI to ensure it works correctly.

## Method 1: Using `npm link` (Recommended)

This creates a symlink to your local package, allowing you to test it as if it were installed globally.

### Steps:

1. **Build the project:**
   ```bash
   bun run build
   ```

2. **Link the package globally:**
   ```bash
   npm link
   ```

3. **Test the CLI:**
   ```bash
   asca --help
   asca --version
   ```

4. **Test with actual credentials** (optional):
   ```bash
   asca builds --app-id "YOUR_APP_ID" --limit 5
   ```

5. **When done testing, unlink:**
   ```bash
   npm unlink -g @unfoldingcx/appstoreconnect-api
   ```

## Method 2: Using `bun` directly

Run the TypeScript file directly without building:

```bash
bun src/cli.ts --help
bun src/cli.ts builds --app-id "YOUR_APP_ID"
bun src/cli.ts submit --help
```

## Method 3: Test the built JavaScript

After building, run the compiled CLI:

```bash
bun run build
node dist/cli.js --help
node dist/cli.js builds --app-id "YOUR_APP_ID"
```

## Testing Checklist

Before publishing, test these scenarios:

### Help Commands
- [ ] `asca --help` - Shows main help
- [ ] `asca help` - Shows main help
- [ ] `asca submit --help` - Shows submit help
- [ ] `asca builds --help` - Shows builds help
- [ ] `asca cancel --help` - Shows cancel help

### Version
- [ ] `asca --version` - Shows version number
- [ ] `asca version` - Shows version number

### Builds Command
- [ ] `asca builds --app-id "xxx" --limit 5` - Lists builds
- [ ] Test with environment variables
- [ ] Test with missing required fields (should show error)

### Submit Command
- [ ] Test with all command-line arguments
- [ ] Test with environment variables
- [ ] Test with mix of CLI args and env vars
- [ ] Test with missing required fields (should show helpful error)
- [ ] Test actual submission (use with caution!)

### Cancel Command
- [ ] `asca cancel --app-id "xxx"` - Cancels submissions
- [ ] Test with environment variables
- [ ] Test with no pending submissions

### Error Handling
- [ ] Unknown command shows helpful error
- [ ] Missing credentials show clear error message
- [ ] Invalid arguments show helpful error

## Common Issues

### "command not found: asca"

**Solution:** 
- Make sure you ran `npm link` after building
- Check that `dist/cli.js` exists
- Verify the shebang line in `dist/cli.js` is correct: `#!/usr/bin/env node`

### "Cannot find module"

**Solution:**
- Run `bun run build` to compile TypeScript to JavaScript
- Check that `dist/index.js` and `dist/cli.js` exist

### "Permission denied"

**Solution:**
- The CLI file needs execute permissions
- Run: `chmod +x dist/cli.js`

### CLI works with `npm link` but not after `npm install -g`

**Solution:**
- This usually means the package.json `bin` field is incorrect
- Verify: `"bin": { "asca": "./dist/cli.js" }`
- Rebuild and try again

## Publishing to npm

Once testing is complete:

1. **Update version** (if needed):
   ```bash
   npm version patch  # or minor, or major
   ```

2. **Build:**
   ```bash
   bun run build
   ```

3. **Test one more time:**
   ```bash
   npm link
   asca --help
   ```

4. **Publish:**
   ```bash
   npm publish --access public
   ```

5. **Verify installation:**
   ```bash
   npm install -g @unfoldingcx/appstoreconnect-api
   asca --version
   ```

## Uninstalling

To uninstall the global CLI:

```bash
npm uninstall -g @unfoldingcx/appstoreconnect-api
```

## Notes

- The CLI uses the same TypeScript code as the library API
- All error handling and features from the library are available in the CLI
- Environment variables are a great way to avoid typing credentials repeatedly
- The CLI is fully documented in the main README.md

