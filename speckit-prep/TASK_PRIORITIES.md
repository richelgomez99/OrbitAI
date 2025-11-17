# TASK PRIORITIES - OrbitAI

**Ordered by Impact × Urgency**  
**Decision Framework:** ICE Score (Impact × Confidence × Ease)

---

## PRIORITY FRAMEWORK

### P0 - BLOCKERS (Must fix before deployment)
**Criteria:** Breaks core functionality, security risk, data loss risk  
**Timeline:** Days

### P1 - CRITICAL (Required for production)
**Criteria:** Major bugs, poor UX, missing features that users expect  
**Timeline:** Weeks

### P2 - IMPORTANT (Needed for polish)
**Criteria:** Nice-to-have features, minor bugs, optimization  
**Timeline:** Months

### P3 - BACKLOG (Future improvements)
**Criteria:** Wishlist items, experimental features  
**Timeline:** Someday

---

## P0: BLOCKERS (DO NOT DEPLOY WITHOUT)

### 🔴 SEC-01: Implement Authentication on tRPC
**Impact:** 10/10 | **Effort:** 8h | **ICE:** 125

**Why P0:** All user data currently unprotected. Anyone can read/modify/delete ANY user's tasks.

**Tasks:**
1. Create `authedProcedure` with Supabase JWT validation
2. Replace all `publicProcedure` with `authedProcedure`
3. Add user ID to context from auth token
4. Implement Row-Level Security in Supabase
5. Write tests for auth enforcement

**Dependencies:** None  
**Owner:** Backend team  
**Estimated:** 8 hours

---

### 🔴 SEC-02: Add Input Validation to All Endpoints
**Impact:** 9/10 | **Effort:** 6h | **ICE:** 150

**Why P0:** SQL injection risk, data corruption, DoS vulnerability

**Tasks:**
1. Create comprehensive Zod schemas for all inputs
2. Validate route parameters (UUID format)
3. Sanitize HTML in string inputs
4. Add request size limits (100KB)
5. Test with malformed inputs

**Dependencies:** None  
**Owner:** Backend team  
**Estimated:** 6 hours

---

### 🔴 SEC-03: Implement Rate Limiting
**Impact:** 9/10 | **Effort:** 4h | **ICE:** 225

**Why P0:** OpenAI API costs can spiral to $1000+ in hours without limits

**Tasks:**
1. Install `express-rate-limit`
2. Add general API limit (100 req/15min)
3. Add AI endpoint limit (20 req/hour)
4. Track per-user costs
5. Add Redis for distributed limiting (optional)

**Dependencies:** Redis (optional)  
**Owner:** Backend team  
**Estimated:** 4 hours

---

### 🔴 UI-01: Add Error Boundaries
**Impact:** 9/10 | **Effort:** 3h | **ICE:** 300

**Why P0:** App crashes with white screen on any component error

**Tasks:**
1. Create ErrorBoundary component
2. Wrap entire app
3. Add per-route boundaries
4. Create error fallback UI
5. Log errors to Sentry (future)

**Dependencies:** None  
**Owner:** Frontend team  
**Estimated:** 3 hours

---

### 🔴 UI-02: Add Loading States to Forms
**Impact:** 8/10 | **Effort:** 6h | **ICE:** 133

**Why P0:** Users don't know if actions succeeded (poor UX)

**Tasks:**
1. Add loading spinner to AddTaskModal
2. Add loading to auth forms (login/signup)
3. Disable buttons during submission
4. Add toast notifications on success/error
5. Implement optimistic updates

**Dependencies:** Toast system (exists)  
**Owner:** Frontend team  
**Estimated:** 6 hours

---

### 🔴 ENV-01: Create .env.example
**Impact:** 7/10 | **Effort:** 1h | **ICE:** 700

**Why P0:** Prevents secret commits, improves developer onboarding

**Tasks:**
1. Create `.env.example` with all required vars
2. Document each variable in README
3. Add startup validation for required vars
4. Verify `.env` in `.gitignore`

**Dependencies:** None  
**Owner:** DevOps  
**Estimated:** 1 hour

---

### 🔴 CODE-01: Fix Schema Mismatches
**Impact:** 8/10 | **Effort:** 8h | **ICE:** 100

**Why P0:** Frontend types don't match Prisma schema (causes bugs)

**Tasks:**
1. Generate TypeScript types from Prisma
2. Update frontend Task interface to match
3. Add missing fields to database (tags, subtasks)
4. Fix date field naming (dueAt vs dueDate)
5. Test all CRUD operations

**Dependencies:** Database migration  
**Owner:** Full-stack  
**Estimated:** 8 hours

---

### 🔴 CODE-02: Remove Console.logs
**Impact:** 6/10 | **Effort:** 4h | **ICE:** 150

**Why P0:** 89 console.logs in production code (performance + security)

**Tasks:**
1. Install `vite-plugin-remove-console`
2. Replace console.logs with proper logger (pino)
3. Add log levels (info/warn/error)
4. Strip console.logs from production build
5. Add pre-commit hook to prevent new logs

**Dependencies:** Logging library  
**Owner:** DevOps + All teams  
**Estimated:** 4 hours

---

## P0 SUMMARY

| Task | Impact | Effort | ICE | Owner |
|------|--------|--------|-----|-------|
| SEC-01: Auth on tRPC | 10 | 8h | 125 | Backend |
| SEC-02: Input validation | 9 | 6h | 150 | Backend |
| SEC-03: Rate limiting | 9 | 4h | 225 | Backend |
| UI-01: Error boundaries | 9 | 3h | 300 | Frontend |
| UI-02: Loading states | 8 | 6h | 133 | Frontend |
| ENV-01: .env.example | 7 | 1h | 700 | DevOps |
| CODE-01: Fix schemas | 8 | 8h | 100 | Full-stack |
| CODE-02: Remove console.logs | 6 | 4h | 150 | All |

**Total P0 Effort:** 40 hours (~5 days)  
**CANNOT DEPLOY WITHOUT THESE**

---

## P1: CRITICAL (Required for Production)

### 🟠 REFACTOR-01: Split OrbitContext
**Impact:** 8/10 | **Effort:** 16h | **ICE:** 50

**Why P1:** 606-line context causes unnecessary re-renders, hard to test

**Tasks:**
1. Create TaskContext, ReflectionContext, ChatContext, AppContext
2. Migrate components to use new contexts
3. Write tests for each context
4. Delete old OrbitContext
5. Measure performance improvement

**Dependencies:** Tests written first  
**Owner:** Frontend team  
**Estimated:** 16 hours

---

### 🟠 API-01: Consolidate to tRPC
**Impact:** 7/10 | **Effort:** 12h | **ICE:** 58

**Why P1:** Mixing REST and tRPC causes confusion, no type safety

**Tasks:**
1. Complete all tRPC routers (task, reflection, chat, mode)
2. Replace manual fetch() calls with tRPC queries
3. Deprecate REST endpoints (keep for back-compat)
4. Update frontend to use tRPC hooks
5. Remove duplicate API logic

**Dependencies:** Authentication implemented  
**Owner:** Full-stack  
**Estimated:** 12 hours

---

### 🟠 UI-03: Fix Accessibility Issues
**Impact:** 8/10 | **Effort:** 12h | **ICE:** 67

**Why P1:** WCAG violations = potential legal risk, poor UX for disabled users

**Tasks:**
1. Add ARIA labels to all icon-only buttons
2. Implement keyboard navigation
3. Fix color contrast (text-secondary)
4. Add skip navigation link
5. Test with screen reader
6. Run Lighthouse accessibility audit (target >90)

**Dependencies:** None  
**Owner:** Frontend team  
**Estimated:** 12 hours

---

### 🟠 UI-04: Add Empty States
**Impact:** 7/10 | **Effort:** 6h | **ICE:** 117

**Why P1:** Blank screens when no data = confused users

**Tasks:**
1. Create EmptyTaskList component
2. Add empty states for chat, reflections, sessions
3. Include helpful CTAs ("Create your first task")
4. Mode-specific empty states
5. Add illustrations (optional)

**Dependencies:** None  
**Owner:** Frontend team  
**Estimated:** 6 hours

---

### 🟠 MOBILE-01: Fix Responsive Issues
**Impact:** 8/10 | **Effort:** 12h | **ICE:** 67

**Why P1:** Many users on mobile, currently broken on small screens

**Tasks:**
1. Fix landing page typography (H1 too large)
2. Increase touch targets to 44x44px
3. Optimize modals for mobile
4. Test on real iPhone/Android devices
5. Fix keyboard pushing content up (chat)
6. Add safe area insets for iOS

**Dependencies:** None  
**Owner:** Frontend team  
**Estimated:** 12 hours

---

### 🟠 TEST-01: Write Integration Tests
**Impact:** 8/10 | **Effort:** 16h | **ICE:** 50

**Why P1:** 0% test coverage = regressions inevitable

**Tasks:**
1. Set up Vitest properly
2. Write auth flow tests
3. Write task CRUD tests
4. Write reflection tests
5. Set up CI pipeline (GitHub Actions)
6. Target: 60% coverage on critical paths

**Dependencies:** Refactored contexts  
**Owner:** All teams  
**Estimated:** 16 hours

---

### 🟠 POLISH-01: Replace Placeholder Content
**Impact:** 6/10 | **Effort:** 4h | **ICE:** 150

**Why P1:** `[Icon]` placeholders look unprofessional

**Tasks:**
1. Replace `[Cycle Icon]`, `[Heart Icon]`, `[Focus Icon]` with real icons
2. Implement password reset flow (not placeholder)
3. Remove all `[Placeholder]` text
4. Add actual logo (not text-based)

**Dependencies:** Design assets  
**Owner:** Frontend team  
**Estimated:** 4 hours

---

### 🟠 PERF-01: Implement Code Splitting
**Impact:** 7/10 | **Effort:** 8h | **ICE:** 88

**Why P1:** 240KB initial bundle too large

**Tasks:**
1. Lazy load routes (dashboard, chat, settings)
2. Code split Framer Motion
3. Analyze bundle with visualizer
4. Target: <150KB initial load
5. Measure performance improvement

**Dependencies:** None  
**Owner:** Frontend team  
**Estimated:** 8 hours

---

## P1 SUMMARY

| Task | Impact | Effort | ICE | Owner |
|------|--------|--------|-----|-------|
| REFACTOR-01: Split context | 8 | 16h | 50 | Frontend |
| API-01: Consolidate tRPC | 7 | 12h | 58 | Full-stack |
| UI-03: Accessibility | 8 | 12h | 67 | Frontend |
| UI-04: Empty states | 7 | 6h | 117 | Frontend |
| MOBILE-01: Responsive | 8 | 12h | 67 | Frontend |
| TEST-01: Integration tests | 8 | 16h | 50 | All |
| POLISH-01: Placeholders | 6 | 4h | 150 | Frontend |
| PERF-01: Code splitting | 7 | 8h | 88 | Frontend |

**Total P1 Effort:** 86 hours (~11 days)  
**REQUIRED FOR PRODUCTION-QUALITY**

---

## P2: IMPORTANT (Polish)

### 🟡 REFACTOR-02: Break Up Long Files
**Impact:** 6/10 | **Effort:** 16h | **ICE:** 38

**Tasks:**
1. Split storage.ts into DAOs
2. Extract prompts from openai.ts
3. Remove commented code from dashboard-view.tsx
4. Refactor files >300 lines

**Estimated:** 16 hours

---

### 🟡 PERF-02: Add Memoization
**Impact:** 6/10 | **Effort:** 6h | **ICE:** 100

**Tasks:**
1. useMemo for filtered/sorted tasks
2. useCallback for event handlers
3. React.memo for TaskCard
4. Measure re-render reduction

**Estimated:** 6 hours

---

### 🟡 UI-05: Add Animations
**Impact:** 5/10 | **Effort:** 12h | **ICE:** 42

**Tasks:**
1. Task completion animation (confetti in Build mode)
2. Mode transition animation (color morph)
3. Energy slider glow effect
4. Respect prefers-reduced-motion

**Estimated:** 12 hours

---

### 🟡 DOCS-01: Create Design System
**Impact:** 5/10 | **Effort:** 8h | **ICE:** 63

**Tasks:**
1. Document color palette
2. Typography scale
3. Component library
4. Usage guidelines

**Estimated:** 8 hours

---

### 🟡 FEATURE-01: Complete Restore Mode
**Impact:** 7/10 | **Effort:** 16h | **ICE:** 44

**Tasks:**
1. Connect real reflection data
2. Implement grounding strategies
3. Add mood trend chart
4. Personalized insights

**Estimated:** 16 hours

---

### 🟡 SECURITY-01: Add CSRF Protection
**Impact:** 6/10 | **Effort:** 2h | **ICE:** 300

**Tasks:**
1. Install csurf OR use SameSite cookies
2. Test protection works
3. Document in security policy

**Estimated:** 2 hours

---

### 🟡 SECURITY-02: Add CSP Headers
**Impact:** 5/10 | **Effort:** 2h | **ICE:** 250

**Tasks:**
1. Install helmet
2. Configure Content Security Policy
3. Test in production

**Estimated:** 2 hours

---

### 🟡 CI-01: Set Up CI/CD Pipeline
**Impact:** 7/10 | **Effort:** 8h | **ICE:** 88

**Tasks:**
1. Create GitHub Actions workflow
2. Run tests on every PR
3. Deploy to staging on merge to main
4. Deploy to production on release tag

**Estimated:** 8 hours

---

## P2 SUMMARY

**Total P2 Effort:** 70 hours (~9 days)  
**Target:** Complete within 4-6 weeks after P0/P1

---

## P3: BACKLOG (Future)

### 🔵 FEATURE-02: WebSocket for Real-time
**Impact:** 6/10 | **Effort:** 20h

**Why Later:** Not critical for MVP, adds complexity

---

### 🔵 FEATURE-03: Recurring Tasks
**Impact:** 5/10 | **Effort:** 12h

**Why Later:** Nice-to-have, not core to value prop

---

### 🔵 FEATURE-04: Task Attachments
**Impact:** 5/10 | **Effort:** 16h

**Why Later:** Many users won't use this

---

### 🔵 SCALE-01: Add Redis Caching
**Impact:** 4/10 | **Effort:** 12h

**Why Later:** Current scale doesn't need it (<1000 users)

---

### 🔵 SCALE-02: Background Job Queue
**Impact:** 5/10 | **Effort:** 16h

**Why Later:** AI operations currently fast enough

---

### 🔵 MIGRATION-01: Consider Next.js
**Impact:** 6/10 | **Effort:** 40h

**Why Later:** React + Vite works fine for SPA; only needed if SEO crucial

---

## P3 SUMMARY

**Total P3 Effort:** 116+ hours  
**Target:** Post-launch, if needed

---

## EXECUTION ROADMAP

### Sprint 1 (Week 1-2): Security & Core UX
**Goal:** Fix blockers, prevent deployment disasters

**Tasks:**
- SEC-01: Auth on tRPC (8h)
- SEC-02: Input validation (6h)
- SEC-03: Rate limiting (4h)
- UI-01: Error boundaries (3h)
- UI-02: Loading states (6h)
- ENV-01: .env.example (1h)
- CODE-01: Fix schemas (8h)
- CODE-02: Remove console.logs (4h)

**Total:** 40 hours  
**Outcome:** Safe to deploy to staging

---

### Sprint 2 (Week 3-4): Production Quality
**Goal:** Make it usable for real users

**Tasks:**
- REFACTOR-01: Split context (16h)
- API-01: Consolidate tRPC (12h)
- UI-03: Accessibility (12h)
- UI-04: Empty states (6h)
- MOBILE-01: Responsive (12h)
- TEST-01: Integration tests (16h)
- POLISH-01: Placeholders (4h)
- PERF-01: Code splitting (8h)

**Total:** 86 hours  
**Outcome:** Production-ready MVP

---

### Sprint 3 (Week 5-6): Polish & Launch Prep
**Goal:** Portfolio-quality finish

**Tasks:**
- REFACTOR-02: Break up files (16h)
- PERF-02: Memoization (6h)
- UI-05: Animations (12h)
- DOCS-01: Design system (8h)
- FEATURE-01: Restore mode (16h)
- SECURITY-01: CSRF (2h)
- SECURITY-02: CSP (2h)
- CI-01: CI/CD (8h)

**Total:** 70 hours  
**Outcome:** Portfolio-worthy, scalable

---

### Post-Launch (Month 2+): Scale & Features
**Goal:** Optimize for growth

**Tasks:** P3 backlog based on user feedback

---

## DECISION MATRIX

**Use this to prioritize new requests:**

| If request is... | And... | Then priority is... |
|------------------|--------|---------------------|
| Security issue | Exposes user data | P0 - Drop everything |
| Bug | Breaks core feature | P0 - Fix ASAP |
| Bug | Workaround exists | P1 - Next sprint |
| Feature | Requested by 10+ users | P1 - Roadmap it |
| Feature | Requested by 1 user | P2/P3 - Backlog |
| Performance | <3s load time | P1 - Matters |
| Performance | Already fast enough | P3 - Optimize later |
| UI polish | Looks unprofessional | P1 - First impressions |
| UI polish | Cosmetic only | P2 - Nice-to-have |

---

## TRACKING PROGRESS

**Use GitHub Projects or similar:**

```
Kanban Board:
├── Backlog (P2/P3)
├── Todo (P0/P1)
├── In Progress (WIP limit: 3)
├── In Review
└── Done
```

**Velocity Tracking:**
- Estimate: Story points (1, 2, 3, 5, 8)
- Reality: Hours actually spent
- Adjust future estimates based on velocity

---

## SUCCESS METRICS

**How do we know when each phase is complete?**

### Sprint 1 Success Criteria:
- [ ] All P0 tasks complete
- [ ] Security audit passes (no CRITICAL issues)
- [ ] App deployed to staging
- [ ] No console.logs in production build
- [ ] Error boundaries catch all errors

### Sprint 2 Success Criteria:
- [ ] All P1 tasks complete
- [ ] Test coverage >60%
- [ ] Lighthouse score >85
- [ ] Mobile works on real devices
- [ ] No placeholder content

### Sprint 3 Success Criteria:
- [ ] All P2 high-impact tasks complete
- [ ] Design system documented
- [ ] CI/CD pipeline running
- [ ] Ready for public launch

---

## PRIORITY NOTES

**Why this order?**

1. **Security first:** Can't launch with vulnerabilities
2. **Core UX second:** Must work before it's pretty
3. **Polish third:** Make it delightful
4. **Scale last:** Optimize when needed

**Resist:**
- ❌ Jumping to new features before P0/P1 done
- ❌ "Just one more thing" scope creep
- ❌ Perfectionism on P2/P3 items
- ❌ Rewriting working code for elegance (unless performance issue)

**Remember:**
- ✅ Shipping beats perfection
- ✅ Iterate based on user feedback
- ✅ Technical debt is okay if time-boxed
- ✅ Document decisions for future-you

---

**Next Action:** Start Sprint 1, Task SEC-01 (Auth on tRPC)


