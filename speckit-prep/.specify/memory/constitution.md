# OrbitAI Constitution

**Immutable Architectural Principles & Development Standards**  
**Version:** 1.0  
**Effective Date:** November 17, 2025  
**Status:** ACTIVE

---

## Preamble

This constitution establishes the core principles that govern all development decisions for OrbitAI. These rules are **immutable** for the current major version and must be followed by all contributors, automated tools, and AI assistants.

**Purpose:**
- Ensure consistent, high-quality code
- Prevent security vulnerabilities
- Maintain performance standards
- Deliver delightful user experience
- Enable sustainable growth

**Scope:** All code, documentation, and infrastructure in the OrbitAI repository

---

## Article I: Test-Driven Development

### Section 1.1: Mandatory Testing
**PRINCIPLE:** No code ships without tests.

**RULES:**
1. **Critical Path Coverage:** All authentication, task CRUD, and payment flows MUST have 80%+ test coverage
2. **Test-First:** For new features, write failing tests BEFORE implementation
3. **No Merge Without Tests:** Pull requests without tests for new code SHALL be rejected
4. **Breaking Changes:** Any change that modifies existing behavior MUST update relevant tests

**EXCEPTIONS:** None for production code. Prototypes in `/experimental` may skip tests.

**ENFORCEMENT:**
- CI pipeline MUST run tests on every commit
- Coverage reports MUST be generated on every PR
- Merges to `main` MUST require passing tests

**PENALTIES:**
- PRs without tests: Auto-reject
- Declining coverage: Deployment blocked

---

### Section 1.2: Testing Standards
**RULES:**
1. **Unit Tests:** Cover individual functions, pure logic
2. **Integration Tests:** Cover API endpoints, database operations, external service interactions
3. **E2E Tests:** Cover critical user journeys (signup → create task → complete task)
4. **Test Naming:** `describe('ComponentName', () => { it('does expected behavior', ...) })`

**REQUIRED TOOLS:**
- Vitest for unit/integration tests
- Testing Library for React components
- Playwright (future) for E2E tests

**FORBIDDEN:**
- Mocking away all dependencies (defeats purpose of integration tests)
- Tests that pass regardless of implementation (tautological tests)
- Skipping tests in production code (`test.skip` without JIRA ticket reference)

---

## Article II: Type Safety & Static Analysis

### Section 2.1: TypeScript Strictness
**PRINCIPLE:** Type safety prevents runtime errors.

**RULES:**
1. **No `any` Type:** Use `unknown` and narrow, or define proper types
2. **Strict Mode Enabled:** `tsconfig.json` MUST have `"strict": true`
3. **No Type Assertions Without Justification:** `as` keyword requires comment explaining why
4. **All Exports Typed:** Public APIs MUST have explicit return types

**EXCEPTIONS:**
- Third-party library workarounds (document with comment)
- Temporary `// @ts-expect-error` with ticket reference for fixes

**ENFORCEMENT:**
- `npm run check` MUST pass with 0 errors
- Pre-commit hook runs TypeScript compiler
- CI fails on type errors

**EXAMPLE - FORBIDDEN:**
```typescript
const data: any = await fetchData(); // ❌ WRONG
return data.user.name; // No type safety!
```

**EXAMPLE - CORRECT:**
```typescript
const data = await fetchData(); // Type inferred from tRPC
return data.user.name; // ✅ Type-safe
```

---

### Section 2.2: Schema Validation
**PRINCIPLE:** Validate all external input.

**RULES:**
1. **API Boundaries:** Every REST/tRPC endpoint MUST validate input with Zod schemas
2. **Database Writes:** Use Prisma types; no raw SQL without prepared statements
3. **Environment Variables:** Validate on startup with Zod schema
4. **User Input:** Sanitize HTML, validate formats (email, UUID, dates)

**FORBIDDEN:**
- Trusting client-sent data without validation
- Using `eval()` or `Function()` on user input
- Storing user input in database without sanitization

**ENFORCEMENT:**
- Code review MUST check for validation
- Penetration testing during release cycle

---

## Article III: Security Standards

### Section 3.1: Authentication & Authorization
**PRINCIPLE:** Protect user data at all costs.

**RULES:**
1. **All Mutations Protected:** Every tRPC mutation MUST use `authedProcedure`
2. **User ID from Token:** NEVER trust client-sent user IDs; always extract from JWT
3. **Row-Level Security:** Database MUST enforce RLS (Row-Level Security)
4. **Session Management:** Use Supabase auth; no custom session handling
5. **Password Requirements:** Minimum 6 characters, optional complexity

**FORBIDDEN:**
- Storing passwords in plain text (use Supabase's hashing)
- Bypassing authentication for convenience
- Exposing sensitive data in error messages
- Logging authentication tokens

**ENFORCEMENT:**
- Security audit before every release
- Automated scanning with `npm audit`
- Manual penetration testing quarterly

---

### Section 3.2: Data Protection
**RULES:**
1. **Encryption at Rest:** Supabase provides this by default; verify enabled
2. **Encryption in Transit:** HTTPS only; enforce with HSTS headers
3. **Secrets Management:** Environment variables only; never commit secrets
4. **API Keys:** Rotate quarterly; revoke on exposure
5. **PII Handling:** Minimize collection; respect user deletion requests (GDPR)

**FORBIDDEN:**
- Hardcoding API keys in source code
- Committing `.env` files
- Sharing secrets in Slack/email
- Storing credit cards (use Stripe only)

**ENFORCEMENT:**
- `gitleaks` scan on every commit
- Pre-commit hook checks for patterns like `sk-`, `password=`
- Secrets rotation schedule

---

### Section 3.3: Rate Limiting & Abuse Prevention
**RULES:**
1. **API Rate Limits:** 100 requests per 15 minutes per IP
2. **AI Endpoint Limits:** 20 requests per hour per user
3. **Cost Caps:** $10/month AI budget per user
4. **CAPTCHA:** On signup and password reset (future)

**ENFORCEMENT:**
- `express-rate-limit` middleware on all routes
- Monitor Redis for rate limit hits
- Alert on unusual spending patterns

---

## Article IV: Performance Budgets

### Section 4.1: Loading Performance
**PRINCIPLE:** Fast apps retain users.

**BUDGETS:**
| Metric | Target | Max Allowed | Measure With |
|--------|--------|-------------|--------------|
| Initial Bundle Size | <150KB gzipped | 200KB | `npm run build` |
| First Contentful Paint | <1.5s | 2.5s | Lighthouse |
| Time to Interactive | <3s | 5s | Lighthouse |
| Largest Contentful Paint | <2s | 3s | Lighthouse |

**RULES:**
1. **Code Splitting:** Routes MUST be lazy-loaded
2. **Image Optimization:** Use WebP with JPEG fallback
3. **Tree Shaking:** Ensure imports are tree-shakeable
4. **No Unnecessary Dependencies:** Audit before adding new libraries

**ENFORCEMENT:**
- Lighthouse CI on every PR
- Bundle size report in PR comments
- Fail PR if budget exceeded without justification

---

### Section 4.2: Runtime Performance
**BUDGETS:**
- **React Re-renders:** <10 per user interaction on dashboard
- **API Response Time:** <200ms for task CRUD operations
- **Database Queries:** <100ms for 95th percentile

**RULES:**
1. **Memoization:** Use `useMemo`, `useCallback`, `React.memo` for expensive operations
2. **Virtualization:** Lists >50 items MUST be virtualized
3. **Debouncing:** Search inputs MUST debounce (300ms)
4. **Pagination:** Never fetch all records; use cursor-based pagination

**ENFORCEMENT:**
- React DevTools Profiler audits
- Database query logging in development
- Performance monitoring in production (future: DataDog)

---

## Article V: Accessibility Requirements

### Section 5.1: WCAG 2.1 Level AA Compliance
**PRINCIPLE:** Everyone deserves access.

**RULES:**
1. **Keyboard Navigation:** All interactive elements MUST be keyboard-accessible
2. **Screen Reader Support:** All images MUST have alt text; all buttons MUST have labels
3. **Color Contrast:** Text MUST meet 4.5:1 ratio (3:1 for large text)
4. **Focus Indicators:** Visible focus states on all interactive elements
5. **ARIA Labels:** Icon-only buttons MUST have `aria-label`

**FORBIDDEN:**
- `<div onClick>` without keyboard handler
- Images without alt text
- Removing focus outlines without replacement
- Color as only indicator of state

**ENFORCEMENT:**
- Lighthouse accessibility score >90 required
- Automated accessibility testing in CI (aXe)
- Manual screen reader testing before release

---

### Section 5.2: Responsive Design
**RULES:**
1. **Mobile-First:** Design for 375px viewport first, scale up
2. **Touch Targets:** Minimum 44x44px for all interactive elements
3. **Breakpoints:** 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
4. **Testing:** Verify on iPhone 12, iPad, Android phone

**ENFORCEMENT:**
- Test suite includes mobile viewport tests
- Real device testing before release

---

## Article VI: Error Handling Standards

### Section 6.1: User-Facing Errors
**PRINCIPLE:** Never show raw errors to users.

**RULES:**
1. **Graceful Degradation:** App MUST remain functional when one feature fails
2. **Error Boundaries:** Wrap all routes in React error boundaries
3. **User-Friendly Messages:** Show actionable messages ("Try again" button)
4. **No Stack Traces:** Never expose internal errors to users

**EXAMPLES:**
```typescript
// ❌ WRONG
toast({ title: "Error: ECONNREFUSED 127.0.0.1:5001" });

// ✅ CORRECT
toast({ 
  title: "Connection failed",
  description: "We couldn't reach the server. Check your internet and try again.",
  action: <Button onClick={retry}>Retry</Button>
});
```

**ENFORCEMENT:**
- Code review checks error handling
- Sentry integration for error tracking (future)

---

### Section 6.2: Logging Standards
**RULES:**
1. **Production Logging:** Use structured logger (pino), not `console.log`
2. **Log Levels:** ERROR (failures), WARN (recoverable issues), INFO (important events), DEBUG (development only)
3. **No PII in Logs:** Redact user emails, passwords, tokens
4. **Contextual:** Include user ID, request ID, timestamp

**FORBIDDEN:**
- `console.log` in production code (strip with Vite plugin)
- Logging passwords, API keys, tokens
- Over-logging (slows app, costs money)

**ENFORCEMENT:**
- Pre-commit hook prevents console.logs
- Log aggregation service (future)

---

## Article VII: Code Style & Documentation

### Section 7.1: Code Style
**PRINCIPLE:** Consistency enables collaboration.

**RULES:**
1. **Linter:** ESLint MUST pass with 0 warnings
2. **Formatter:** Prettier MUST auto-format on save
3. **Naming Conventions:**
   - **Files:** Pages: `kebab-case.tsx`, Components: `PascalCase.tsx`, Utils: `kebab-case.ts`
   - **Functions:** CRUD: `create/read/update/delete`, Dates: `*At` suffix
   - **Components:** PascalCase
   - **Variables:** camelCase
   - **Constants:** SCREAMING_SNAKE_CASE
4. **File Length:** Max 300 lines (split if longer)
5. **Function Length:** Max 50 lines (extract helpers)

**ENFORCEMENT:**
- Pre-commit hook runs ESLint + Prettier
- CI fails on linter errors

---

### Section 7.2: Documentation
**RULES:**
1. **API Contracts:** Every tRPC procedure MUST have JSDoc comment
2. **Complex Logic:** Non-obvious code MUST have explanatory comments
3. **README:** Keep up-to-date with setup instructions
4. **ADRs:** Architectural Decision Records for major changes

**EXAMPLES:**
```typescript
/**
 * Creates a new task for the authenticated user.
 * 
 * @param input - Task creation data (title, description, priority, etc.)
 * @returns The created task with generated ID and timestamps
 * @throws TRPCError - UNAUTHORIZED if user not authenticated
 */
export const create = authedProcedure
  .input(taskCreateSchema)
  .mutation(async ({ ctx, input }) => { ... });
```

**ENFORCEMENT:**
- Code review checks for documentation
- Stale docs flagged in backlog grooming

---

## Article VIII: Git Workflow & Commit Standards

### Section 8.1: Branching Strategy
**RULES:**
1. **Protected Branches:** `main` (production), `staging` (pre-production)
2. **Feature Branches:** `feature/SEC-01-implement-auth` (include ticket ID)
3. **Branch Lifetime:** Delete after merge; max 2 weeks
4. **No Force Push:** On `main` or `staging`

---

### Section 8.2: Commit Messages
**FORMAT:** `type(scope): description`

**TYPES:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructure (no behavior change)
- `test`: Add/update tests
- `docs`: Documentation only
- `style`: Formatting, linting
- `perf`: Performance improvement
- `chore`: Dependencies, config

**EXAMPLES:**
```
feat(auth): implement JWT validation on tRPC procedures
fix(tasks): resolve schema mismatch between frontend and Prisma
refactor(context): split OrbitContext into separate concerns
test(auth): add integration tests for login flow
docs(readme): update environment variable setup instructions
```

**ENFORCEMENT:**
- Conventional commits linter
- CI rejects malformed commit messages

---

### Section 8.3: Pull Request Standards
**RULES:**
1. **Size:** Max 500 lines changed (break into smaller PRs)
2. **Description:** MUST include:
   - What changed
   - Why it changed
   - How to test
   - Screenshots (for UI changes)
3. **Checklist:**
   - [ ] Tests written and passing
   - [ ] Linter passing
   - [ ] TypeScript errors: 0
   - [ ] Accessibility tested
   - [ ] Mobile tested (if UI change)
   - [ ] Documentation updated
4. **Reviews:** Minimum 1 approval; 2 for security-sensitive changes

**ENFORCEMENT:**
- PR template auto-fills checklist
- Branch protection rules

---

## Article IX: Deployment & Release

### Section 9.1: Deployment Stages
**PIPELINE:**
1. **Development:** Local (`npm run dev`)
2. **Staging:** Fly.io staging app (auto-deploy on merge to `staging`)
3. **Production:** Fly.io production (manual trigger on `main`)

**RULES:**
1. **Staging First:** All changes MUST deploy to staging before production
2. **Soak Time:** Minimum 24 hours on staging
3. **Rollback Plan:** Every deployment MUST have rollback procedure
4. **Database Migrations:** Test on staging; backup production before running

---

### Section 9.2: Release Versioning
**SEMVER:** `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes (e.g., API redesign)
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

**RULES:**
1. **Tag Releases:** `git tag v1.2.3`
2. **Changelog:** Document all user-facing changes
3. **Breaking Changes:** Announce 1 week before release

---

## Article X: Monitoring & Observability

### Section 10.1: Production Monitoring
**REQUIREMENTS:**
1. **Error Tracking:** Sentry for frontend/backend errors (future)
2. **Performance Monitoring:** Fly.io metrics + Lighthouse CI
3. **Uptime Monitoring:** Fly.io health checks
4. **Cost Monitoring:** OpenAI API usage alerts

**ALERTS:**
- Error rate >1% for 5 minutes → Slack notification
- API response time >1s for 95th percentile → Investigate
- OpenAI costs >$50/day → Alert immediately

---

### Section 10.2: Health Checks
**REQUIRED ENDPOINTS:**
- `GET /api/health` → `200 OK` (basic check)
- `GET /api/health/db` → Verify database connection (future)

**RULES:**
- Health checks MUST NOT require authentication
- Health checks MUST respond within 2 seconds
- Health checks MUST return JSON with `{ status: "ok" }` on success

---

## Article XI: Amendment Process

### Section 11.1: Proposing Changes
**PROCESS:**
1. Create RFC (Request for Comments) document in `.specify/rfcs/`
2. Propose in team meeting
3. 2-week comment period
4. Vote: Unanimous approval required
5. Update constitution
6. Announce changes to all contributors

**EXAMPLE RFC:**
```markdown
# RFC-001: Allow TypeScript `any` for Third-Party Library Wrappers

## Motivation
Some third-party libraries have poor type definitions...

## Proposal
Amendment to Article II, Section 2.1...

## Alternatives Considered
...

## Impact
Low-risk change, affects <5 files...
```

---

### Section 11.2: Emergency Amendments
**RULES:**
- Security vulnerabilities MAY bypass normal process
- Must be ratified within 1 week post-fix
- Document in `.specify/amendments/`

---

## Article XII: Enforcement

### Section 12.1: Automated Enforcement
**TOOLS:**
- Pre-commit hooks (Husky + lint-staged)
- CI pipeline (GitHub Actions)
- Branch protection rules
- Lighthouse CI
- Dependency scanning (`npm audit`)

---

### Section 12.2: Manual Review
**CODE REVIEW CHECKLIST:**
- [ ] Tests exist and pass
- [ ] No `any` types
- [ ] No `console.log`
- [ ] Accessibility considered
- [ ] Security implications reviewed
- [ ] Performance impact assessed
- [ ] Documentation updated

---

### Section 12.3: Penalties
**VIOLATIONS:**
- Minor (style issues): Fix in next PR
- Moderate (missing tests): PR blocked
- Severe (security issue): Immediate rollback + postmortem

---

## Conclusion

This constitution exists to maintain OrbitAI's quality standards as the codebase and team grow. When in doubt, prioritize:

1. **Security** over convenience
2. **User experience** over developer preferences
3. **Long-term maintainability** over short-term speed
4. **Simplicity** over cleverness

**Ratified:** November 17, 2025  
**Next Review:** May 17, 2026  
**Version:** 1.0  
**Signatories:** Development Team

---

**End of Constitution**


