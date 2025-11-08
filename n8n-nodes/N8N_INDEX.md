# n8n App Store Connect Node - Complete Index

Welcome! This is your guide to all n8n-related documentation and resources for the App Store Connect API integration.

## 📍 Quick Navigation

### For End Users (Non-Technical)

- **[N8N_QUICK_START.md](N8N_QUICK_START.md)** ← Start here!
  - Installation instructions
  - Credential setup
  - First workflow examples
  - Common troubleshooting

- **[n8n-nodes/README.md](n8n-nodes/README.md)**
  - Detailed feature documentation
  - All operations explained
  - Usage examples
  - Supported languages

### For Developers

- **[n8n-nodes/DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md)**
  - Local development setup
  - File structure explanation
  - Adding new operations
  - Testing guide
  - Debugging tips

- **[N8N_NODE_SUMMARY.md](N8N_NODE_SUMMARY.md)**
  - Technical architecture
  - Component breakdown
  - API integration details
  - Future enhancements

### For Publishing

- **[N8N_PUBLISHING.md](N8N_PUBLISHING.md)**
  - Step-by-step publishing guide
  - Version management
  - Pre-publication checklist
  - Troubleshooting publication issues

## 🚀 Quick Start Paths

### Path 1: I just want to use it (5 minutes)

1. Read: [N8N_QUICK_START.md](N8N_QUICK_START.md) (2 min)
2. Install: Follow installation steps (1 min)
3. Setup: Create credentials (2 min)
4. Done! Start building workflows

### Path 2: I want to understand it (20 minutes)

1. Read: [N8N_QUICK_START.md](N8N_QUICK_START.md) (5 min)
2. Read: [n8n-nodes/README.md](n8n-nodes/README.md) (10 min)
3. Try: Build a test workflow (5 min)

### Path 3: I want to develop it (1 hour)

1. Setup: Follow [n8n-nodes/DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md) (15 min)
2. Read: [N8N_NODE_SUMMARY.md](N8N_NODE_SUMMARY.md) (20 min)
3. Explore: Review source code in `n8n-nodes/src/` (15 min)
4. Build: Try adding a small feature (10 min)

### Path 4: I want to publish it (30 minutes)

1. Build: Ensure clean build in `n8n-nodes/` (5 min)
2. Read: [N8N_PUBLISHING.md](N8N_PUBLISHING.md) (10 min)
3. Verify: Run pre-publication checks (5 min)
4. Publish: Follow publishing steps (5 min)
5. Verify: Check npm registry (5 min)

## 📁 Repository Structure

```
appstoreconnect-api/
├── n8n-nodes/                    # n8n Node Package
│   ├── src/
│   │   ├── credentials/          # Credential type
│   │   ├── nodes/                # Node implementation
│   │   └── index.ts              # Main export
│   ├── dist/                     # Compiled output
│   ├── README.md                 # User documentation
│   ├── DEVELOPMENT.md            # Developer guide
│   └── package.json              # n8n node config
│
├── src/                          # Main library
│   ├── index.ts                  # Core API
│   ├── ai-release-notes.ts       # AI features
│   └── cli.ts                    # CLI interface
│
├── N8N_QUICK_START.md           # Quick start guide (START HERE)
├── N8N_INDEX.md                 # This file
├── N8N_NODE_SUMMARY.md          # Technical overview
├── N8N_PUBLISHING.md            # Publishing guide
│
├── README.md                    # Main project README
├── GITHUB_ACTION.md             # GitHub Action docs
├── AI_RELEASE_NOTES.md          # AI features docs
└── package.json                 # Main library config
```

## 📚 Documentation Map

| Document | Audience | Purpose | Read Time |
|----------|----------|---------|-----------|
| [N8N_QUICK_START.md](N8N_QUICK_START.md) | Everyone | Get started quickly | 5 min |
| [N8N_INDEX.md](N8N_INDEX.md) | Everyone | Navigate documentation | 3 min |
| [n8n-nodes/README.md](n8n-nodes/README.md) | Users | Feature documentation | 15 min |
| [n8n-nodes/DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md) | Developers | Development guide | 20 min |
| [N8N_NODE_SUMMARY.md](N8N_NODE_SUMMARY.md) | Developers | Technical architecture | 15 min |
| [N8N_PUBLISHING.md](N8N_PUBLISHING.md) | Maintainers | Publishing guide | 10 min |
| [README.md](README.md) | Everyone | Main project info | 10 min |

## 🎯 Common Tasks

### I want to...

**Install the n8n node**
→ See [N8N_QUICK_START.md](N8N_QUICK_START.md#installation)

**Create my first workflow**
→ See [N8N_QUICK_START.md](N8N_QUICK_START.md#first-workflow)

**Submit an app to review**
→ See [n8n-nodes/README.md](n8n-nodes/README.md#submit-to-review)

**Get list of builds**
→ See [n8n-nodes/README.md](n8n-nodes/README.md#get-builds)

**Set up credentials**
→ See [N8N_QUICK_START.md](N8N_QUICK_START.md#setup-credentials)

**Troubleshoot an error**
→ See [N8N_QUICK_START.md](N8N_QUICK_START.md#troubleshooting)

**Develop locally**
→ See [n8n-nodes/DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md)

**Add a new operation**
→ See [n8n-nodes/DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md#adding-new-operations)

**Publish to npm**
→ See [N8N_PUBLISHING.md](N8N_PUBLISHING.md)

**Understand the architecture**
→ See [N8N_NODE_SUMMARY.md](N8N_NODE_SUMMARY.md)

## 🔧 Available Operations

All operations require **App Store Connect API credentials**.

### 1. Submit to Review
Submits an app version to Apple review process

```
Parameters: buildId, versionString, platform, locale, releaseNotes
Returns: Success status, version ID, build ID
```

### 2. Get Builds
Retrieves list of available builds for your app

```
Parameters: limit
Returns: List of builds with metadata, processing state, upload date
```

### 3. Cancel Pending Submissions
Cancels any pending app review submissions

```
Parameters: None
Returns: Cancellation status
```

### 4. Generate AI Release Notes
*Future feature* - Generates release notes from git commits

```
Parameters: locale, sinceDays, gitRepoPath
Returns: AI-generated release notes
```

## 🔐 Security Notes

- **Credentials are encrypted** - n8n encrypts all stored credentials
- **Private keys are safe** - Never logged or displayed in logs
- **Use environment variables** - When possible, reference env vars instead of hardcoding
- **Rotate keys periodically** - Keep API keys fresh for security

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Node not appearing | Restart n8n, check package name spelling |
| "Credential required" | Create credentials in n8n UI |
| "No valid builds" | Ensure build exists in TestFlight with VALID status |
| "409 Conflict error" | Use Cancel Pending first, then resubmit |
| Build won't install | Check n8n version compatibility |

See [N8N_QUICK_START.md](N8N_QUICK_START.md#troubleshooting) for more.

## 🔄 Update Path

### When a new version is released

1. Update your n8n instance
2. Or reinstall package: `npm update n8n-nodes-appstoreconnect`
3. Check release notes for breaking changes
4. Update workflows if needed

### Track updates

- npm package: https://www.npmjs.com/package/n8n-nodes-appstoreconnect
- GitHub releases: https://github.com/unfoldingcx/appstoreconnect-api/releases
- Changelog: [CHANGELOG.md](CHANGELOG.md)

## 🤝 Contributing

### Report a Bug

1. Check existing [GitHub Issues](https://github.com/unfoldingcx/appstoreconnect-api/issues)
2. Create new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - n8n version, node version

### Request a Feature

1. Open GitHub Issue with tag `[n8n-node]`
2. Describe use case
3. Explain why it's needed

### Contribute Code

1. Fork the repository
2. Create feature branch
3. Follow [DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md)
4. Create pull request

## 📖 Additional Resources

### Official n8n Documentation
- [n8n Docs](https://docs.n8n.io/)
- [Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/introduction/)
- [Community Nodes](https://n8n.io/integrations/community-nodes/)

### App Store Connect Documentation
- [App Store Connect API Docs](https://developer.apple.com/app-store-connect/api/)
- [Getting Started](https://developer.apple.com/documentation/appstoreconnectapi/app_store_connect_api)

### This Project
- [Main README](README.md)
- [GitHub Repository](https://github.com/unfoldingcx/appstoreconnect-api)
- [npm Package](https://www.npmjs.com/package/@unfoldingcx/appstoreconnect-api)

## 🆘 Getting Help

### Documentation
1. Check [N8N_QUICK_START.md](N8N_QUICK_START.md) for common questions
2. Search [n8n-nodes/README.md](n8n-nodes/README.md) for features
3. Review [Troubleshooting](#-common-issues--solutions) section

### Community Support
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Discord](https://discord.gg/nV6XnzjMAN)

### Report Issues
- [GitHub Issues](https://github.com/unfoldingcx/appstoreconnect-api/issues)
- Include: n8n version, node version, steps to reproduce, error message

## 📋 Checklist for First Use

- [ ] Read [N8N_QUICK_START.md](N8N_QUICK_START.md)
- [ ] Install node in n8n
- [ ] Get App Store Connect API credentials
- [ ] Create credentials in n8n
- [ ] Build first workflow (Get Builds)
- [ ] Test with real data
- [ ] Build submit workflow
- [ ] Test in staging environment
- [ ] Deploy to production

## 🎓 Learning Resources

### Beginner
1. [N8N_QUICK_START.md](N8N_QUICK_START.md) - Get started
2. [n8n-nodes/README.md](n8n-nodes/README.md) - Feature overview

### Intermediate
3. [n8n docs](https://docs.n8n.io/) - n8n concepts
4. Build more complex workflows

### Advanced
5. [n8n-nodes/DEVELOPMENT.md](n8n-nodes/DEVELOPMENT.md) - Develop
6. [N8N_NODE_SUMMARY.md](N8N_NODE_SUMMARY.md) - Architecture
7. Contribute improvements

## 📞 Contact

- **Author**: JOAO PEDRO BARBOSA VIANA <pitter@unfolding.cx>
- **Organization**: Unfolding.cx
- **License**: MIT
- **Repository**: https://github.com/unfoldingcx/appstoreconnect-api

---

**Start here:** [N8N_QUICK_START.md](N8N_QUICK_START.md) 🚀

