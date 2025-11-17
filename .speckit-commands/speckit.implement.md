---
description: Execute the implementation of a SpecKit feature following TDD and constitutional principles
---

## Command: /speckit.implement

**Purpose:** Implement a specific feature from the specs/ directory using Test-Driven Development (TDD) and following the project constitution.

## Usage

```
/speckit.implement [feature-number]
```

**Examples:**
- `/speckit.implement 001` - Implement JWT Authentication Middleware
- `/speckit.implement 002` - Implement Input Validation

## Prerequisites

Before starting implementation, you MUST:

1. **Read the feature documentation** in this order:
   ```bash
   specs/[feature-number]-[feature-name]/
   ├── spec.md         # 1. Read first - WHAT to build
   ├── plan.md         # 2. Read second - HOW to build it
   ├── tasks.md        # 3. Read third - Step-by-step tasks ⭐
   ├── research.md     # 4. Reference - WHY these choices
   └── data-model.md   # 5. Reference - Data structures
   ```

2. **Review the constitution:**
   ```bash
   speckit-prep/.specify/memory/constitution.md
   ```
   
3. **Check security requirements:**
   ```bash
   speckit-prep/SECURITY_VULNERABILITIES.md
   ```

## Implementation Workflow

### Phase 1: Setup (Tasks T001-T005)

**Before writing any code:**

1. **Checkout the feature branch:**
   ```bash
   git checkout -b [feature-number]-[feature-name]
   ```

2. **Read all documentation:**
   - spec.md - Understand user scenarios
   - plan.md - Understand technical approach
   - tasks.md - Your checklist
   - research.md - Technology decisions

3. **Install any new dependencies:**
   ```bash
   npm install [packages-from-plan.md]
   ```

4. **Verify project structure:**
   - Confirm directories exist as per plan.md
   - Create any missing directories

---

### Phase 2: Test-Driven Development (Tasks T006-T010)

**Write tests FIRST, before any implementation:**

1. **For each component/function:**
   - Write failing test(s)
   - Verify tests fail (red)
   - Implement minimum code to pass
   - Verify tests pass (green)
   - Refactor if needed
   - Repeat

2. **Test file naming:**
   - Component: `ComponentName.test.tsx`
   - Utility: `utilityName.test.ts`
   - API: `endpoint.test.ts`

3. **Test structure:**
   ```typescript
   import { describe, it, expect, beforeEach } from 'vitest';
   
   describe('ComponentName or FunctionName', () => {
     beforeEach(() => {
       // Setup
     });
   
     it('should do expected behavior', () => {
       // Arrange
       // Act
       // Assert
     });
   
     it('should handle error case', () => {
       // Test error handling
     });
   });
   ```

4. **Run tests:**
   ```bash
   npm test -- [test-file]
   ```

---

### Phase 3: Implementation (Tasks T011-T018)

**Implement feature following TDD cycle:**

1. **For each task in tasks.md:**
   - [ ] Read task description
   - [ ] Identify file(s) to modify/create
   - [ ] Write test (if not already written)
   - [ ] Run test (should fail)
   - [ ] Implement minimum code to pass test
   - [ ] Run test (should pass)
   - [ ] Refactor if needed
   - [ ] Commit with conventional commit message

2. **File creation guidelines:**
   - Use exact file paths from plan.md
   - Follow naming conventions from constitution
   - Use TypeScript strict mode
   - No `any` types
   - Import from established patterns

3. **Code quality checks:**
   - ESLint passing: `npm run lint`
   - TypeScript passing: `npm run check`
   - Tests passing: `npm test`
   - No console.logs in production code

4. **Constitution compliance:**
   - Article I: Tests exist and pass
   - Article II: Type-safe, no `any`
   - Article III: Authentication enforced
   - Article VI: Graceful error handling
   - Article VII: Proper code style

---

### Phase 4: Integration (Tasks T019-T021)

**Integrate all components:**

1. **Run integration tests:**
   ```bash
   npm test
   ```

2. **Manual testing:**
   - Start dev server: `npm run dev`
   - Test all user scenarios from spec.md
   - Verify acceptance criteria met

3. **Performance check:**
   - Bundle size: `npm run build`
   - Load time: Test in browser
   - No memory leaks: Chrome DevTools

4. **Accessibility check:**
   - Lighthouse audit
   - Keyboard navigation
   - Screen reader testing

---

### Phase 5: Documentation (Tasks T022-T024)

**Update documentation:**

1. **Code documentation:**
   - JSDoc comments on all public APIs
   - Inline comments for complex logic
   - Update README if needed

2. **Update tasks.md:**
   - Mark completed tasks with `[x]`
   - Note any deviations from plan
   - Document issues encountered

3. **Create PR description:**
   - Reference spec number
   - List all changes
   - Include screenshots (if UI)
   - Note breaking changes
   - Checklist of verification steps

---

## Constitutional Requirements

**MUST follow these rules from constitution.md:**

### Article I: Testing
- [ ] All new code has tests
- [ ] Tests written before implementation (TDD)
- [ ] Coverage on critical paths: 80%+
- [ ] All tests passing

### Article II: Type Safety
- [ ] No `any` types
- [ ] TypeScript strict mode
- [ ] Explicit return types on exports
- [ ] Zod validation on API boundaries

### Article III: Security
- [ ] All mutations use `authedProcedure`
- [ ] User ID from JWT, not client
- [ ] Inputs validated with Zod
- [ ] HTML sanitized
- [ ] No secrets in code

### Article VI: Error Handling
- [ ] Try-catch on all async operations
- [ ] User-friendly error messages
- [ ] Error boundaries (React)
- [ ] Graceful degradation

### Article VII: Code Style
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] Files < 300 lines
- [ ] Functions < 50 lines
- [ ] Proper naming conventions

---

## Commit Guidelines

**Use conventional commits:**

```
type(scope): description

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructure
- `test`: Add/update tests
- `docs`: Documentation only
- `style`: Formatting
- `perf`: Performance improvement

**Examples:**
```
feat(auth): implement JWT validation middleware

- Add authedProcedure wrapper for tRPC
- Extract user ID from Supabase JWT
- Reject unauthorized requests with 401

Closes #001
```

---

## Task Tracking

**Update tasks.md as you progress:**

```markdown
## Phase: Setup
- [x] T001 Create project structure
- [x] T002 Install dependencies
- [ ] T003 Set up development environment  ← Currently working on
- [ ] T004 Configure version control
- [ ] T005 Install dependencies
```

---

## Troubleshooting

### Tests Failing
1. Read error message carefully
2. Check test setup/mocking
3. Verify imports are correct
4. Check data-model.md for expected structure

### Type Errors
1. Enable TypeScript errors: `npm run check`
2. Fix from top of file downward
3. No `any` - use `unknown` and narrow
4. Reference plan.md for type definitions

### ESLint Errors
1. Run: `npm run lint`
2. Auto-fix: `npm run lint:fix`
3. Check constitution for style rules

### Constitution Violations
1. Read constitution.md Article that's violated
2. Understand the "why" behind the rule
3. Refactor to comply
4. If rule blocks progress, document why and continue

---

## Success Criteria

**Before marking feature complete:**

- [ ] All tasks in tasks.md marked `[x]`
- [ ] All tests passing (`npm test`)
- [ ] ESLint passing (`npm run lint`)
- [ ] TypeScript passing (`npm run check`)
- [ ] Manual testing of all user scenarios
- [ ] Acceptance criteria from spec.md verified
- [ ] Documentation updated
- [ ] PR created with proper description
- [ ] Constitution checklist complete

---

## Example: Implementing Feature 001 (JWT Auth)

```bash
# 1. Read documentation
cat specs/001-implement-jwt-authentication-middleware/spec.md
cat specs/001-implement-jwt-authentication-middleware/plan.md
cat specs/001-implement-jwt-authentication-middleware/tasks.md

# 2. Checkout branch
git checkout -b 001-jwt-auth

# 3. Start with Phase 1: Setup (T001-T005)
# Follow tasks.md sequentially

# 4. Phase 2: Write tests (T006-T010)
# Create server/__tests__/auth.middleware.test.ts
npm test -- auth.middleware.test.ts  # Should fail

# 5. Phase 3: Implement (T011-T018)
# Create server/middleware/auth.ts
# Implement authedProcedure in server/trpc.ts
npm test  # Should pass

# 6. Phase 4: Integration (T019-T021)
npm test
npm run dev  # Manual testing

# 7. Phase 5: Documentation (T022-T024)
# Update tasks.md checkboxes
# Create PR

# 8. Commit and push
git add .
git commit -m "feat(auth): implement JWT authentication middleware"
git push origin 001-jwt-auth
```

---

## Reference Documents

**Always available to reference:**

### Feature Documentation
- `specs/[number]-[name]/spec.md` - Feature requirements
- `specs/[number]-[name]/plan.md` - Implementation approach
- `specs/[number]-[name]/tasks.md` - Task checklist
- `specs/[number]-[name]/research.md` - Technical decisions
- `specs/[number]-[name]/data-model.md` - Data structures

### Project Context
- `SPECKIT_IMPLEMENTATION_GUIDE.md` - Complete implementation guide
- `speckit-prep/EXECUTIVE_SUMMARY.md` - Project overview
- `speckit-prep/AUDIT_REPORT.md` - Complete audit findings
- `speckit-prep/SECURITY_VULNERABILITIES.md` - Security issues
- `speckit-prep/TASK_PRIORITIES.md` - Work prioritization
- `speckit-prep/.specify/memory/constitution.md` - Architectural principles

### Development Resources
- `README.md` - Project setup and development
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `tsconfig.json` - TypeScript configuration

---

## Notes

- **Parallelization:** Tasks marked `[P]` in tasks.md can be done concurrently
- **Deviations:** If you must deviate from plan, document why in tasks.md
- **Blockers:** If blocked, document in tasks.md and move to next parallelizable task
- **Questions:** Reference research.md for technical decision rationale

---

**End of Command Documentation**
