# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-08

### 🎉 CLI Release

Added a powerful command-line interface for the package!

### ✨ New Features

- **CLI Tool** - New `asca` command-line interface
  - `asca submit` - Submit apps to review from the terminal
  - `asca builds` - List available builds
  - `asca cancel` - Cancel pending submissions
  - `asca help` - Show help and usage information
- **Global Installation** - Install globally with `npm install -g @unfoldingcx/appstoreconnect-api`
- **Environment Variable Support** - Use env vars for credentials in CLI
- **Multiple Aliases** - Use either `asca` or `appstoreconnect-api` command
- **Beautiful CLI Output** - Formatted help text with clear examples

### 📚 Documentation

- Added comprehensive CLI usage documentation to README
- Added `examples/cli-usage.sh` with practical CLI examples
- Updated all examples to use scoped package name `@unfoldingcx/appstoreconnect-api`

### 🔧 Technical

- Added `bin` field to package.json for CLI executable
- Created `src/cli.ts` with full command parsing
- CLI uses the same robust error handling as the API

---

## [1.0.0] - 2025-11-08

### 🎉 Initial Release

The first production-ready release of the App Store Connect API automation library!

### ✨ Features

- **Complete Review Submission Workflow**
  - Automated 6-step submission process from version creation to final submission
  - Support for iOS, macOS, and tvOS platforms
  - Multi-locale release notes support

- **Intelligent Error Recovery**
  - Automatic retry mechanism when build association fails
  - Automatic cancellation of pending submissions on conflicts
  - Helpful error messages with actionable suggestions
  - Display of available builds when build ID is invalid
  - Display of available locales when locale is invalid

- **Build Management**
  - `getBuilds()` function to query available builds
  - Filter by processing state (VALID, PROCESSING)
  - Sort by upload date (most recent first)
  - `formatBuildInfo()` helper for human-readable output

- **Submission Cancellation**
  - `cancelPendingReviewSubmissions()` to cancel pending reviews
  - Automatic cancellation when encountering conflicts
  - Support for multiple simultaneous submissions

- **Developer Experience**
  - Full TypeScript support with comprehensive type definitions
  - Detailed JSDoc documentation for all public APIs
  - Step-by-step progress logging with emoji indicators
  - Clear error messages with context and suggestions
  - Example files for common use cases

### 📚 Documentation

- Comprehensive README with installation, setup, and usage examples
- API reference documentation with detailed parameter descriptions
- CI/CD integration examples (GitHub Actions)
- Multiple example files for different use cases:
  - Basic usage
  - Auto-discovery of builds
  - Environment variables configuration
- Contributing guidelines
- MIT License

### 🔐 Security

- JWT-based authentication with ES256 algorithm
- 20-minute token expiration (per Apple's specifications)
- Secure credential handling recommendations
- No hardcoded credentials in examples

### 🛠️ Technical

- Written in TypeScript 5.0+
- Compatible with Node.js 18+
- Built with Bun for optimal performance
- Uses axios for HTTP requests
- Uses jsonwebtoken for JWT generation
- Comprehensive error handling and validation
- Clean separation of concerns

### 📦 Package

- Published to npm as `appstoreconnect-api`
- Includes TypeScript type definitions
- CommonJS and ESM module support
- Tree-shakeable exports
- Minimal dependencies

---

## Future Roadmap

### Planned for v1.1.0
- [ ] Support for phased releases
- [ ] Support for automatic release after approval
- [ ] Get app information and metadata
- [ ] Update app metadata programmatically

### Planned for v1.2.0
- [ ] Screenshot management
- [ ] App preview video management
- [ ] In-App Purchase management
- [ ] Beta testing (TestFlight) automation

### Planned for v2.0.0
- [ ] Full App Store Connect API coverage
- [ ] WebSocket support for real-time updates
- [ ] CLI tool for terminal usage
- [ ] Dashboard UI for managing submissions

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/unfoldingx/appstoreconnect-api/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/unfoldingx/appstoreconnect-api/discussions)
- 📧 **Email**: pitter@unfolding.cx

[1.0.0]: https://github.com/unfoldingx/appstoreconnect-api/releases/tag/v1.0.0

