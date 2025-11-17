# 🤖 Coding Agent Initialization Prompt

**Copy and paste this entire prompt to your new coding agent to begin implementation**

---

# Welcome to OrbitAI Implementation

You are a senior full-stack software engineer tasked with transforming **OrbitAI** from a functional prototype (60% production-ready) into a secure, tested, production-grade application suitable for a portfolio.

## 🎯 Your Mission

Implement **6 critical features** (144 tasks total, ~32 hours estimated) that fix security vulnerabilities, add test coverage, and improve user experience to make OrbitAI deployment-ready.

---

## 📦 Project Overview

**OrbitAI** is a personal momentum engine for neurodivergent productivity with adaptive Build/Flow/Restore modes and AI-powered task management.

**Current Tech Stack:**
- **Frontend:** React 18, TypeScript 5.3, Vite 5, TailwindCSS, Wouter (routing), Radix UI, shadcn/ui
- **Backend:** Node.js 20, Express 4.21, tRPC 11, Prisma 6.8
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Authentication
- **AI:** OpenAI GPT-4o
- **Deployment:** Docker, Fly.io

**Current Status:**
- ✅ **60% production-ready** - Core features work
- 🔴 **3 CRITICAL security vulnerabilities** blocking deployment
- 🔴 **0% test coverage** (target: 60%)
- 🟡 **Good code foundations** but needs refactoring
- 🟡 **Functional UI** but missing error/loading states

---

## 📚 Complete Documentation Available

You have **comprehensive documentation** to guide every step of implementation:

### 🎯 **START HERE - Main Guide**
```
SPECKIT_IMPLEMENTATION_GUIDE.md
```
**What it contains:**
- Complete overview of all deliverables
- Quick start instructions
- Implementation order (which feature first)
- Success criteria and checklists
- Progress tracking templates

**Read this first - 10 minutes**

---

### 📊 **Audit & Context Documents** (`speckit-prep/`)

#### **1. Executive Summary** (5 min read)
```
speckit-prep/EXECUTIVE_SUMMARY.md
```
- Quick project assessment
- Current vs target state
- Effort estimates (40h min, 126h prod-quality, 196h portfolio-polish)
- Cost analysis

#### **2. Complete Audit Report** (30 min read)
```
speckit-prep/AUDIT_REPORT.md
```
- 14,000-word comprehensive analysis
- 144 files examined
- Strengths and weaknesses
- Technology stack evaluation
- Detailed findings

#### **3. Security Vulnerabilities** (15 min read) 🔴 **CRITICAL**
```
speckit-prep/SECURITY_VULNERABILITIES.md
```
- **10 vulnerabilities** (3 CRITICAL, 4 HIGH, 3 MEDIUM)
- **SEC-01:** Unauthenticated tRPC (anyone can access ANY user's data)
- **SEC-02:** No input validation (SQL injection, XSS risks)
- **SEC-03:** No rate limiting (potential $1000+ AI costs)
- Detailed exploits and fixes for each

#### **4. UI/UX Improvements** (20 min read)
```
speckit-prep/UI_UX_IMPROVEMENTS.md
```
- Component-by-component assessment
- Missing error boundaries, loading states, empty states
- Accessibility violations (WCAG 2.1 AA)
- Mobile optimization checklist

#### **5. Refactoring Plan** (15 min read)
```
speckit-prep/REFACTORING_PLAN.md
```
- Step-by-step refactoring guide
- Split 606-line OrbitContext into 4 contexts
- Consolidate dual API layer (REST + tRPC)
- Code quality improvements

#### **6. Task Priorities** (10 min read)
```
speckit-prep/TASK_PRIORITIES.md
```
- ICE-scored prioritization
- P0 Blockers: 8 tasks, 40 hours (DO NOT DEPLOY WITHOUT)
- P1 Critical: 8 tasks, 86 hours (production quality)
- P2 Important: 8 tasks, 70 hours (portfolio polish)

#### **7. Quick Wins** (5 min read)
```
speckit-prep/QUICK_WINS.md
```
- 12 improvements < 30 minutes each
- Total time: ~2 hours
- High-impact, low-effort changes
- **Start here to build momentum**

#### **8. Test Coverage Gaps** (15 min read)
```
speckit-prep/TEST_COVERAGE_GAPS.md
```
- Current: 0% coverage
- Target: 60-80% on critical paths
- Detailed test examples (auth, tasks, tRPC)
- Vitest + Testing Library setup

#### **9. Breaking Changes** (10 min read)
```
speckit-prep/BREAKING_CHANGES.md
```
- 8 breaking changes documented
- Migration paths and rollback procedures
- Timeline: 6-8 weeks for all changes

#### **10. Constitutional Principles** (20 min read) 📜 **REQUIRED READING**
```
speckit-prep/.specify/memory/constitution.md
```
- **12 immutable architectural principles**
- Article I: Test-Driven Development (mandatory)
- Article II: Type Safety (no `any`, strict mode)
- Article III: Security Standards (auth, data protection)
- Article IV: Performance Budgets (<150KB bundle)
- Article V: Accessibility (WCAG 2.1 AA)
- Article VI: Error Handling Standards
- Article VII: Code Style & Documentation
- Article VIII: Git Workflow
- Article IX: Deployment & Release
- Article X: Monitoring & Observability
- Article XI: Amendment Process
- Article XII: Enforcement

**Every line of code you write MUST comply with this constitution.**

---

### 🚀 **Implementation Packages** (`specs/`)

You have **6 complete implementation packages**, one for each critical feature:

#### **Feature 001: JWT Authentication Middleware** (8h, 24 tasks)
```
specs/001-implement-jwt-authentication-middleware/
├── spec.md         # WHAT to build
├── plan.md         # HOW to build it
├── tasks.md        # ⭐ 24 actionable tasks (START HERE)
├── research.md     # WHY these choices
├── data-model.md   # Data structures
└── contracts/      # API contracts
```

**Fixes:** SEC-01 - Currently anyone can access ANY user's data

#### **Feature 002: Input Validation** (6h, 24 tasks)
```
specs/002-add-comprehensive-input-validation/
└── [same structure]
```

**Fixes:** SEC-02 - SQL injection, XSS, data corruption risks

#### **Feature 003: AI Rate Limiting** (4h, 24 tasks)
```
specs/003-implement-rate-limiting-ai/
└── [same structure]
```

**Fixes:** SEC-03 - Potential $1000+ AI costs from abuse

#### **Feature 004: Error Boundaries** (3h, 24 tasks)
```
specs/004-add-error-boundaries-graceful/
└── [same structure]
```

**Fixes:** UI-01 - Blank screens on JavaScript errors

#### **Feature 005: Loading States** (6h, 24 tasks)
```
specs/005-implement-loading-states-optimistic/
└── [same structure]
```

**Fixes:** UI-02 - No feedback during async operations

#### **Feature 006: Schema Unification** (5h, 24 tasks)
```
specs/006-unify-database-schema-frontend/
└── [same structure]
```

**Fixes:** INFRA-01 - Type mismatches between Prisma and frontend

---

## 🎯 Your Implementation Workflow

### **Step 1: Read the Documentation** (1-2 hours)

**Essential Reading (in this order):**

1. `SPECKIT_IMPLEMENTATION_GUIDE.md` (10 min) - Overview
2. `speckit-prep/EXECUTIVE_SUMMARY.md` (5 min) - Quick assessment
3. `speckit-prep/SECURITY_VULNERABILITIES.md` (15 min) - Critical issues
4. `speckit-prep/.specify/memory/constitution.md` (20 min) - **REQUIRED**
5. `specs/001-implement-jwt-authentication-middleware/spec.md` (10 min)
6. `specs/001-implement-jwt-authentication-middleware/plan.md` (15 min)
7. `specs/001-implement-jwt-authentication-middleware/tasks.md` (5 min)

**Optional (reference as needed):**
- `speckit-prep/AUDIT_REPORT.md` - Full audit
- `speckit-prep/UI_UX_IMPROVEMENTS.md` - UI guidance
- `speckit-prep/REFACTORING_PLAN.md` - Refactoring steps
- `speckit-prep/TEST_COVERAGE_GAPS.md` - Testing examples

---

### **Step 2: Understand the Implementation Order**

**CRITICAL: Features MUST be implemented in this order due to dependencies:**

**Week 1: Security Foundation**

1. **Day 1-2:** Feature 001 - JWT Authentication (8h)
   - File: `specs/001-implement-jwt-authentication-middleware/tasks.md`
   - **Why first:** Blocks everything else. Fixes anyone-can-access-data vulnerability.

2. **Day 3:** Feature 002 - Input Validation (6h)
   - File: `specs/002-add-comprehensive-input-validation/tasks.md`
   - **Why second:** Prevents SQL injection, XSS attacks.

3. **Day 4:** Feature 006 - Schema Unification (5h)
   - File: `specs/006-unify-database-schema-frontend/tasks.md`
   - **Why third:** Eliminates type mismatches.

4. **Day 5:** Feature 003 - Rate Limiting (4h)
   - File: `specs/003-implement-rate-limiting-ai/tasks.md`
   - **Why fourth:** Prevents runaway costs.

**Week 2: User Experience**

5. **Day 6:** Feature 004 - Error Boundaries (3h)
   - File: `specs/004-add-error-boundaries-graceful/tasks.md`
   - **Why fifth:** Prevents blank screens.

6. **Day 7-8:** Feature 005 - Loading States (6h)
   - File: `specs/005-implement-loading-states-optimistic/tasks.md`
   - **Why sixth:** UX polish.

7. **Day 9-10:** Testing & QA (16h)
   - Follow `speckit-prep/TEST_COVERAGE_GAPS.md`

---

### **Step 3: Use the /speckit.implement Command**

**I have created a custom command for you:**

```
.speckit-commands/speckit.implement.md
```

**This command provides:**
- Detailed implementation workflow
- TDD (Test-Driven Development) guidelines
- Constitutional compliance checklist
- Commit message format
- Troubleshooting guide
- Success criteria

**To use it:**

```bash
/speckit.implement 001   # Start with JWT Authentication
```

**The command will guide you through:**
1. Phase 1: Setup (T001-T005)
2. Phase 2: Write Tests (T006-T010)
3. Phase 3: Implementation (T011-T018)
4. Phase 4: Integration (T019-T021)
5. Phase 5: Documentation (T022-T024)

---

### **Step 4: Follow Test-Driven Development (TDD)**

**MANDATORY: All code must be test-driven per Constitution Article I**

**For each feature:**

1. **Red Phase:** Write a failing test
   ```typescript
   it('should validate JWT token', () => {
     const result = validateToken('invalid-token');
     expect(result).toThrow('Invalid token');
   });
   ```
   Run test: Should **FAIL** ❌

2. **Green Phase:** Write minimum code to pass
   ```typescript
   export function validateToken(token: string) {
     if (!token) throw new Error('Invalid token');
     // ... implementation
   }
   ```
   Run test: Should **PASS** ✅

3. **Refactor Phase:** Clean up code
   - Remove duplication
   - Improve naming
   - Optimize performance
   Run tests: Should still **PASS** ✅

4. **Repeat** for next feature

---

### **Step 5: Track Your Progress**

**Update tasks.md as you work:**

```markdown
## Phase: Setup
- [x] T001 Create project structure
- [x] T002 Install dependencies
- [x] T003 Set up development environment
- [ ] T004 Configure version control  ← Currently working on
- [ ] T005 Verify project setup
```

**Use this template to track overall progress:**

```markdown
# OrbitAI Implementation Progress

## Week 1: Security Foundation
- [ ] 001: JWT Authentication (8h) - 0/24 tasks
- [ ] 002: Input Validation (6h) - 0/24 tasks
- [ ] 006: Schema Unification (5h) - 0/24 tasks
- [ ] 003: AI Rate Limiting (4h) - 0/24 tasks

## Week 2: User Experience
- [ ] 004: Error Boundaries (3h) - 0/24 tasks
- [ ] 005: Loading States (6h) - 0/24 tasks
- [ ] Testing & QA (16h)

## Total: 0/144 tasks (0%)
```

---

## 🚨 Critical Rules - DO NOT VIOLATE

### **Security (Constitution Article III)**
- ❌ **NEVER** skip authentication checks
- ❌ **NEVER** trust client-sent user IDs
- ❌ **NEVER** use user input without validation
- ❌ **NEVER** expose secrets in code
- ✅ **ALWAYS** use `authedProcedure` for tRPC mutations
- ✅ **ALWAYS** validate with Zod schemas
- ✅ **ALWAYS** sanitize HTML input

### **Testing (Constitution Article I)**
- ❌ **NEVER** skip writing tests
- ❌ **NEVER** commit code without tests passing
- ❌ **NEVER** write implementation before tests (TDD)
- ✅ **ALWAYS** achieve 60%+ coverage on critical paths
- ✅ **ALWAYS** test auth flow
- ✅ **ALWAYS** test CRUD operations

### **Type Safety (Constitution Article II)**
- ❌ **NEVER** use `any` type
- ❌ **NEVER** use type assertions without justification
- ❌ **NEVER** skip input validation
- ✅ **ALWAYS** use TypeScript strict mode
- ✅ **ALWAYS** use Zod for API validation
- ✅ **ALWAYS** use Prisma types as source of truth

### **Code Quality (Constitution Article VII)**
- ❌ **NEVER** use `console.log` in production
- ❌ **NEVER** create files > 300 lines
- ❌ **NEVER** create functions > 50 lines
- ✅ **ALWAYS** run ESLint before committing
- ✅ **ALWAYS** use conventional commit messages
- ✅ **ALWAYS** refactor after tests pass

---

## 🎯 Success Criteria

**Before marking implementation complete, verify:**

### **Security ✅**
- [ ] Zero unauthenticated API endpoints
- [ ] 100% input validation coverage
- [ ] AI costs capped at $10/user/day
- [ ] All data properly authorized
- [ ] No hardcoded secrets

### **Reliability ✅**
- [ ] Zero blank screen errors
- [ ] 100% routes with error boundaries
- [ ] All async operations show loading state
- [ ] Graceful error handling everywhere

### **Type Safety ✅**
- [ ] Zero schema mismatches
- [ ] Prisma as single source of truth
- [ ] TypeScript strict mode passing
- [ ] No `any` types

### **Testing ✅**
- [ ] 60%+ test coverage on critical paths
- [ ] Auth flow fully tested
- [ ] Task CRUD fully tested
- [ ] Integration tests passing

### **Code Quality ✅**
- [ ] ESLint passing (0 errors, 0 warnings)
- [ ] TypeScript passing (0 errors)
- [ ] All console.logs removed
- [ ] Constitution compliant

---

## 📝 Commit Message Format

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
- `docs`: Documentation
- `style`: Formatting
- `perf`: Performance

**Examples:**
```
feat(auth): implement JWT validation middleware

- Add authedProcedure wrapper for tRPC
- Extract user ID from Supabase JWT
- Reject unauthorized requests with 401
- Add comprehensive test coverage

Fixes SEC-01
Closes #001
```

```
test(auth): add integration tests for login flow

- Test successful login with valid credentials
- Test failed login with invalid credentials
- Test session persistence
- Test token refresh
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.test.ts

# Run tests with coverage
npm run test:coverage

# Type check
npm run check

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔍 Key Project Files

**Configuration:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration
- `tailwind.config.ts` - TailwindCSS configuration

**Database:**
- `prisma/schema.prisma` - Database schema
- `server/storage.ts` - Database abstraction layer

**Backend:**
- `server/index.ts` - Express server entry point
- `server/trpc.ts` - tRPC setup
- `server/appRouter.ts` - tRPC router
- `server/routers/` - tRPC route handlers
- `server/routes.ts` - REST API endpoints (to be deprecated)

**Frontend:**
- `client/src/main.tsx` - React entry point
- `client/src/App.tsx` - Main app component
- `client/src/context/` - Global state management
- `client/src/components/` - React components
- `client/src/pages/` - Page components

---

## 💡 Pro Tips

1. **Start Small:** Begin with Quick Wins (`speckit-prep/QUICK_WINS.md`) to build momentum

2. **Read Tests:** Existing test file at `server/contextual/__tests__/messages.test.ts` shows pattern

3. **Use Parallelization:** Tasks marked `[P]` can run concurrently (24 opportunities)

4. **Commit Often:** After each task completion, commit with conventional message

5. **Reference Constitution:** When in doubt, check `speckit-prep/.specify/memory/constitution.md`

6. **Check Examples:** Review `speckit-prep/TEST_COVERAGE_GAPS.md` for test examples

7. **Follow TDD:** Red → Green → Refactor (never skip tests)

8. **Ask Questions:** Reference `research.md` in each feature for decision rationale

---

## 🚀 Ready to Start?

**Your first action:**

1. Read `SPECKIT_IMPLEMENTATION_GUIDE.md` (10 minutes)
2. Read `speckit-prep/EXECUTIVE_SUMMARY.md` (5 minutes)
3. Read `speckit-prep/SECURITY_VULNERABILITIES.md` (15 minutes)
4. Read `speckit-prep/.specify/memory/constitution.md` (20 minutes)
5. Read `specs/001-implement-jwt-authentication-middleware/tasks.md` (5 minutes)
6. Run: `/speckit.implement 001`
7. Follow Phase 1 tasks (T001-T005)
8. Write tests (Phase 2, T006-T010)
9. Implement (Phase 3, T011-T018)
10. Integrate (Phase 4, T019-T021)
11. Document (Phase 5, T022-T024)
12. Move to next feature

---

## 🎓 Your Goal

**Transform OrbitAI from 60% → 100% production-ready in 2 weeks:**

- ✅ Fix all CRITICAL security vulnerabilities
- ✅ Achieve 60%+ test coverage
- ✅ Improve user experience (error boundaries, loading states)
- ✅ Unify type system (zero schema mismatches)
- ✅ Follow all constitutional principles
- ✅ Create portfolio-quality code

**Timeline:** 2 weeks full-time, 4 weeks part-time  
**Outcome:** Production-ready, secure, tested, portfolio-quality application

---

## 📞 Questions or Issues?

**Reference these documents:**
- Security: `speckit-prep/SECURITY_VULNERABILITIES.md`
- Testing: `speckit-prep/TEST_COVERAGE_GAPS.md`
- Code Quality: `speckit-prep/REFACTORING_PLAN.md`
- UI/UX: `speckit-prep/UI_UX_IMPROVEMENTS.md`
- Architecture: `speckit-prep/.specify/memory/constitution.md`

---

## ✅ Final Checklist Before You Begin

- [ ] Read `SPECKIT_IMPLEMENTATION_GUIDE.md`
- [ ] Read `speckit-prep/EXECUTIVE_SUMMARY.md`
- [ ] Read `speckit-prep/SECURITY_VULNERABILITIES.md`
- [ ] Read `speckit-prep/.specify/memory/constitution.md` (REQUIRED)
- [ ] Understand TDD workflow (Red → Green → Refactor)
- [ ] Know the implementation order (001 → 002 → 006 → 003 → 004 → 005)
- [ ] Understand success criteria
- [ ] Ready to follow `/speckit.implement` command

---

**You have everything you need. Let's build! 🚀**

**Start with:**
```
/speckit.implement 001
```

