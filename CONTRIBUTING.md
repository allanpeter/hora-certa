# Contributing to Hora Certa

Thank you for your interest in contributing to Hora Certa!

## Development Workflow

### 1. Setup

```bash
# Clone repository
git clone <repo-url>
cd hora-certa

# Install dependencies
pnpm install

# Start local services
docker-compose up -d

# Create .env file
cp .env.example .env

# Run database migrations
pnpm --filter backend run migration:run

# Start development servers
pnpm dev
```

### 2. Branch Naming

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation
- `refactor/refactor-name` - Code refactoring

### 3. Commit Messages

Use clear, descriptive commit messages:

```
feat: Add appointment reminder system
fix: Resolve payment webhook timing issue
docs: Update database schema documentation
refactor: Simplify authentication middleware
```

### 4. Code Style

- Use TypeScript with strict mode
- Follow Prettier formatting (runs on commit)
- Use ESLint rules (see .eslintrc files)
- Write meaningful variable/function names
- Add comments for complex logic

### 5. Testing

```bash
# Run all tests
pnpm test

# Run backend tests
pnpm test:backend

# Run frontend tests
pnpm test:frontend
```

### 6. Pull Request Process

1. Create a feature branch from `main`
2. Make your changes and commit with clear messages
3. Push to your fork
4. Open a pull request with:
   - Clear title describing changes
   - Description of what was changed and why
   - Link to relevant issues
   - Screenshots (for UI changes)

5. Ensure all checks pass:
   - Linting
   - Tests
   - Type checking
   - Build succeeds

### 7. Backend Development

**Creating a new module:**

```bash
nest generate resource modules/feature-name
```

**Writing services:**
- Keep business logic in services
- Keep controllers thin
- Use DTOs for validation
- Write unit tests for services

**Database:**
```bash
# Generate migration from entities
pnpm --filter backend run migration:generate src/database/migrations/MigrationName

# Run migrations
pnpm --filter backend run migration:run
```

### 8. Frontend Development

**Component structure:**

```tsx
// Header of file: imports
import React from 'react';

// Component
const MyComponent: React.FC<Props> = ({ prop1 }) => {
  // Logic
  const [state, setState] = React.useState(false);

  // Render
  return <div>{/* JSX */}</div>;
};

export default MyComponent;
```

**Using hooks:**
- Use custom hooks from `src/hooks`
- Use React Query for server state
- Use Zustand for global UI state
- Keep components pure

### 9. Documentation

- Update README.md for new features
- Add comments for complex logic
- Keep PRD.md in sync with implementation
- Document breaking changes

### 10. Performance Tips

**Backend:**
- Use database indexes
- Cache frequently accessed data
- Optimize queries
- Use pagination

**Frontend:**
- Lazy load heavy components
- Memoize expensive calculations
- Cache API responses
- Optimize images

## Code Review

When reviewing code:
- Check for correctness
- Ensure tests are adequate
- Look for performance issues
- Verify security practices
- Ensure code style consistency

## Reporting Issues

When reporting bugs:
1. Check if issue already exists
2. Provide reproduction steps
3. Include error logs
4. Specify environment details
5. Attach screenshots if relevant

## Getting Help

- Check PRD.md for feature details
- Review existing code in similar modules
- Ask in pull request comments
- Create discussion issues

## License

By contributing, you agree that your contributions will be licensed under the project's license.

Thank you for contributing to Hora Certa!
