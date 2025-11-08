# Publishing Guide

## Publishing to npm

1. **Ensure everything is committed:**
   ```bash
   git status
   ```

2. **Update version** (if needed):
   ```bash
   npm version patch  # or minor, or major
   ```

3. **Build the project:**
   ```bash
   bun run build
   ```

4. **Test locally:**
   ```bash
   npm link
   asca --version
   npm unlink -g @unfoldingcx/appstoreconnect-api
   ```

5. **Publish to npm:**
   ```bash
   npm publish --access public
   ```

6. **Verify:**
   ```bash
   npm view @unfoldingcx/appstoreconnect-api
   ```

## Publishing the GitHub Action

The GitHub Action is automatically available when you push to GitHub!

### How GitHub Actions Work:

1. **Users reference your repo:**
   ```yaml
   uses: unfoldingcx/appstoreconnect-api@v1
   ```

2. **GitHub fetches from your repository** at the specified ref (tag/branch/commit)

3. **The `action.yml` file** in your repo root defines the action

### To Publish/Update:

1. **Commit and push** your changes:
   ```bash
   git add action.yml
   git commit -m "Add GitHub Action"
   git push
   ```

2. **Create a release tag:**
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0 with GitHub Action"
   git push origin v1.1.0
   ```

3. **Create a major version tag** (for easier user reference):
   ```bash
   git tag -fa v1 -m "Update v1 to latest"
   git push origin v1 --force
   ```

Now users can use:
- `@v1.1.0` - Specific version (immutable)
- `@v1` - Latest v1.x.x (updates when you update v1 tag)
- `@main` - Latest from main branch (not recommended for production)

### Publishing to GitHub Marketplace (Optional)

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Choose your tag (e.g., v1.1.0)
4. Check "Publish this Action to the GitHub Marketplace"
5. Fill in details and publish

This makes your action discoverable in GitHub's marketplace!

## Version Strategy

### npm Package Version
- Follow semver: `1.1.0`
- Update via: `npm version patch|minor|major`

### GitHub Action Version
- Create git tags: `v1.1.0`
- Update major tag: `v1` → points to latest v1.x.x
- Users typically use: `@v1` (auto-updates to latest v1.x.x)

### Keep Them in Sync

When releasing:
```bash
# Update version in package.json
npm version minor  # e.g., 1.1.0 → 1.2.0

# Build and test
bun run build
npm publish --access public

# Tag for GitHub Action
git tag -a v1.2.0 -m "Release v1.2.0"
git tag -fa v1 -m "Update v1 to v1.2.0"
git push origin v1.2.0
git push origin v1 --force

# Create GitHub Release
gh release create v1.2.0 --generate-notes
```

## Pre-Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version bumped in package.json
- [ ] Build succeeds (`bun run build`)
- [ ] CLI works (`npm link && asca --version`)
- [ ] GitHub Action example is valid
- [ ] No sensitive data in code
- [ ] LICENSE file is correct

## Post-Release

1. **Announce** on social media/forums
2. **Monitor** GitHub issues for bug reports
3. **Update** documentation based on user feedback
4. **Tag** the release on GitHub

---

**Ready to publish!** 🚀

