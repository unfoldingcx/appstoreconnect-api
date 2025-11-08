# Contributing to App Store Connect API

First off, thank you for considering contributing to this project! 🎉

The following is a set of guidelines for contributing to the App Store Connect API library. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by a simple principle: be respectful and professional. By participating, you are expected to uphold this principle.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include error messages and stack traces**
- **Specify your Node.js/Bun version and operating system**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass: `bun test`
6. Lint your code: `bun run lint:fix`
7. Commit your changes with a clear message
8. Push to your fork
9. Submit a pull request

## Development Setup

1. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/appstoreconnect-api.git
   cd appstoreconnect-api
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up your App Store Connect credentials** (for testing):
   - Create a `keys/` directory
   - Add your `.p8` file
   - Create a `.env` file with your credentials (never commit this!)

4. **Build the project:**
   ```bash
   bun run build
   ```

5. **Run the development version:**
   ```bash
   bun run dev
   ```

## Style Guidelines

### TypeScript Style Guide

- Use TypeScript for all code
- Enable strict type checking
- Add JSDoc comments for all exported functions and interfaces
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Prefer `async/await` over promise chains

### Code Formatting

We use Prettier and ESLint for code formatting:

```bash
# Format all files
bun run format

# Lint and fix
bun run lint:fix
```

### Documentation

- Add JSDoc comments for all exported functions, interfaces, and types
- Include `@param`, `@returns`, and `@throws` tags
- Provide usage examples in JSDoc comments
- Update the README.md if you add new features

### Example of Good Documentation:

```typescript
/**
 * Retrieves available builds for a specific app.
 * 
 * @param appId - Your app's unique identifier
 * @param jwtOptions - Authentication credentials
 * @param limit - Maximum number of builds to return (default: 5)
 * @returns Array of Build objects
 * 
 * @example
 * ```typescript
 * const builds = await getBuilds('123456', jwtOptions, 10)
 * console.log(`Found ${builds.length} builds`)
 * ```
 */
export async function getBuilds(
  appId: string,
  jwtOptions: JWTOptions,
  limit: number = 5
): Promise<Build[]> {
  // Implementation
}
```

## Commit Messages

Write clear, concise commit messages that describe what changed and why:

### Good commit messages:
```
✅ Add automatic retry mechanism for build association
🐛 Fix locale validation error message
📝 Update README with CI/CD examples
♻️ Refactor error handling in apiRequest function
```

### Bad commit messages:
```
fix bug
update
changes
wip
```

### Commit Message Format:

Use conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Updating build tasks, package manager configs, etc.

## Testing

If you add new functionality, please add tests:

1. Create test files in `src/__tests__/`
2. Run tests with `bun test`
3. Ensure all tests pass before submitting PR

## Questions?

Feel free to open an issue with your question or reach out via:
- GitHub Issues: [github.com/yourusername/appstoreconnect-api/issues](https://github.com/yourusername/appstoreconnect-api/issues)
- GitHub Discussions: [github.com/yourusername/appstoreconnect-api/discussions](https://github.com/yourusername/appstoreconnect-api/discussions)

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors page

Thank you for contributing! 🙏

