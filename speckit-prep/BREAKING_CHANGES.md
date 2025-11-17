# BREAKING CHANGES - OrbitAI

**Changes That Will Break Existing Functionality**  
**Version:** Pre-1.0  
**Status:** PLANNING PHASE

---

## INTRODUCTION

This document lists all changes that will break existing functionality, data models, or API contracts. Each breaking change requires careful migration planning.

**Classification:**
- 🔴 **CRITICAL**: Immediate action required (data loss risk)
- 🟠 **HIGH**: Requires user action or migration
- 🟡 **MEDIUM**: Graceful migration possible
- 🟢 **LOW**: Internal changes only

---

## BREAKING CHANGES LIST

### BC-001: Remove Default User Logic
**Severity:** 🔴 CRITICAL  
**Impact:** Authentication required for all operations  
**Affected:** Backend, Database

#### Current Behavior
```typescript
// Falls back to default user if no auth
const defaultUserId = await getDefaultUserId();
return storage.getTasksForUser(defaultUserId);
```

#### New Behavior
```typescript
// Throws error if not authenticated
if (!ctx.userId) {
  throw new TRPCError({ code: 'UNAUTHORIZED' });
}
return storage.getTasksForUser(ctx.userId);
```

#### Migration Path
1. **Before Deploying:**
   - Identify all tasks attached to default user (`default@example.com`)
   - Create migration script to reassign to real users
   - Backup database

2. **Migration Script:**
```typescript
// scripts/migrate-default-user-tasks.ts
async function migrateDefaultUserTasks() {
  const defaultUser = await prisma.user.findUnique({
    where: { email: 'default@example.com' },
  });

  if (!defaultUser) return;

  const tasks = await prisma.task.findMany({
    where: { userId: defaultUser.id },
  });

  console.log(`Found ${tasks.length} tasks to migrate`);

  // Prompt: Which user should own these tasks?
  const targetUserId = await promptForUserId();

  await prisma.task.updateMany({
    where: { userId: defaultUser.id },
    data: { userId: targetUserId },
  });

  console.log('Migration complete');
}
```

3. **After Migration:**
   - Delete default user
   - Remove all `getDefaultUserId()` functions
   - Deploy changes

#### User Impact
- ✅ Users with accounts: No impact
- ❌ Anonymous usage: No longer possible (was never intended)

#### Timeline
- Week 1: Create migration script
- Week 2: Run on staging
- Week 3: Run on production + deploy

---

### BC-002: Consolidate API Layer (REST → tRPC)
**Severity:** 🟠 HIGH  
**Impact:** Client code must migrate to tRPC  
**Affected:** Frontend, Backend

#### Current Behavior
```typescript
// Manual fetch() calls
const response = await apiRequest("GET", "/api/tasks");
const tasks = await response.json();
```

#### New Behavior
```typescript
// tRPC hooks
const { data: tasks, isLoading } = trpc.task.getAll.useQuery();
```

#### Migration Path
1. **Phase 1:** Deprecate REST endpoints (keep functional)
2. **Phase 2:** Migrate frontend to tRPC (gradual)
3. **Phase 3:** Remove REST endpoints (after v1.0)

#### Deprecation Warnings
```typescript
// Add to REST routes
app.get('/api/tasks', async (req, res) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', '2026-06-01');
  res.setHeader('Link', '</trpc/task.getAll>; rel="alternate"');
  // ... existing code
});
```

#### User Impact
- ✅ Browser clients: Auto-update with new deployment
- ❌ External API consumers: Must migrate (if any exist)

#### Timeline
- Week 1-2: Implement all tRPC routers
- Week 3-4: Migrate frontend components
- Week 5+: Deprecation period (6 months)
- 2026-06-01: Remove REST endpoints

---

### BC-003: Schema Unification (Frontend Types → Prisma Types)
**Severity:** 🟠 HIGH  
**Impact:** Database schema changes  
**Affected:** Database, Frontend, Backend

#### Current Mismatches

| Field | Frontend | Prisma | Action |
|-------|----------|--------|--------|
| `subtasks` | Array | Missing | Add to DB |
| `isAiGenerated` | Boolean | Missing | Add to DB |
| `lastUpdated` | Date | `updatedAt` | Rename frontend |
| `dueDate` | Date | `dueAt` | Rename frontend |
| `description` vs `content` | `description` | `description` | Use `description` |

#### Migration Path

**Step 1: Database Migration**
```sql
-- Add new fields to Task table
ALTER TABLE "Task" ADD COLUMN "isAiGenerated" BOOLEAN DEFAULT false;
ALTER TABLE "Task" ADD COLUMN "subtasks" JSONB DEFAULT '[]'::jsonb;

-- Note: 'updatedAt' already exists in Prisma model
```

**Step 2: Prisma Schema Update**
```prisma
model Task {
  // ... existing fields
  isAiGenerated Boolean  @default(false)
  subtasks      Json     @default("[]")
  updatedAt     DateTime @updatedAt
}
```

**Step 3: Frontend Type Update**
```typescript
// OLD (deprecated)
export interface Task {
  lastUpdated?: Date;
  dueDate?: Date;
  content?: string;
  subtasks?: Subtask[];
  isAiGenerated?: boolean;
}

// NEW (use Prisma types)
import { Task as PrismaTask } from '@prisma/client';

export type Task = PrismaTask & {
  subtasks: Subtask[]; // Parse from JSON
};
```

**Step 4: Data Migration**
```typescript
// If existing tasks have subtasks in localStorage or old format
async function migrateTaskSubtasks() {
  const tasks = await prisma.task.findMany({
    where: { subtasks: { equals: [] } },
  });

  // Migrate subtasks from old location if they exist
  for (const task of tasks) {
    // Check localStorage or old field
    const oldSubtasks = await getOldSubtasks(task.id);
    if (oldSubtasks) {
      await prisma.task.update({
        where: { id: task.id },
        data: { subtasks: oldSubtasks },
      });
    }
  }
}
```

#### User Impact
- ✅ No data loss (additive changes)
- ⚠️ Frontend needs redeployment

#### Timeline
- Week 1: Create migrations
- Week 2: Test on staging
- Week 3: Deploy to production

---

### BC-004: Context Splitting (OrbitContext → Multiple Contexts)
**Severity:** 🟡 MEDIUM  
**Impact:** Hook API changes  
**Affected:** Frontend only

#### Current Behavior
```typescript
const { tasks, addTask, mode, setMode, messages } = useOrbit();
```

#### New Behavior
```typescript
const { tasks, addTask } = useTasks();
const { mode, setMode } = useApp();
const { messages, sendMessage } = useChat();
```

#### Migration Path

**Automated with Codemod:**
```bash
# Create codemod script
npx jscodeshift -t scripts/codemods/split-orbit-context.ts client/src
```

**Codemod Script:**
```typescript
// scripts/codemods/split-orbit-context.ts
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find useOrbit() calls
  root.find(j.CallExpression, {
    callee: { name: 'useOrbit' }
  }).forEach(path => {
    // Replace with appropriate hooks based on destructured variables
    const destructuredVars = getDestructuredVars(path);
    
    if (destructuredVars.includes('tasks')) {
      j(path).replaceWith(j.callExpression(j.identifier('useTasks'), []));
    }
    // ... similar for other contexts
  });

  return root.toSource();
}
```

**Manual Migration (simpler):**
1. Search for all `useOrbit()` calls
2. Replace with appropriate hook based on usage
3. Update imports

#### User Impact
- ✅ No user-facing impact (internal refactor)
- ⚠️ Developers must update code

#### Timeline
- Week 1: Create new contexts
- Week 2: Run codemod, manual fixes
- Week 3: Delete old OrbitContext

---

### BC-005: Remove Console.logs (Build Process Change)
**Severity:** 🟢 LOW  
**Impact:** Development workflow  
**Affected:** Frontend, Build

#### Current Behavior
```typescript
console.log('Debug info:', data);
// Logs appear in production console
```

#### New Behavior
```typescript
// Development: Logs appear
logger.debug('Debug info:', data);

// Production: Stripped from bundle
```

#### Migration Path
1. Install `vite-plugin-remove-console`
2. Replace all `console.log` with `logger.debug`
3. Configure Vite to strip in production

**No User Impact** (internal change)

---

### BC-006: Authentication Middleware (tRPC Security)
**Severity:** 🔴 CRITICAL  
**Impact:** All API calls require auth token  
**Affected:** Frontend, Backend

#### Current Behavior
```typescript
// Works without authentication
const tasks = await trpc.task.getAll.query();
```

#### New Behavior
```typescript
// Throws UNAUTHORIZED if no token
const tasks = await trpc.task.getAll.query();
// Frontend must include JWT in headers
```

#### Migration Path

**Step 1: Frontend Setup**
```typescript
// client/src/lib/trpc.ts
export const trpcClient = createTRPCReact<AppRouter>().createClient({
  links: [
    httpBatchLink({
      url: getBaseUrl() + '/trpc',
      async headers() {
        const { data: { session } } = await supabase.auth.getSession();
        return {
          authorization: session?.access_token 
            ? `Bearer ${session.access_token}` 
            : '',
        };
      },
    }),
  ],
});
```

**Step 2: Handle 401 Errors**
```typescript
// Global error handler
trpc.useError((error) => {
  if (error.data?.code === 'UNAUTHORIZED') {
    // Redirect to login
    window.location.href = '/login';
  }
});
```

#### User Impact
- ✅ Logged-in users: No impact
- ❌ Anonymous users: Must create account

#### Timeline
- Week 1: Implement authentication
- Week 2: Test thoroughly
- Week 3: Deploy (coordinate with BC-001)

---

### BC-007: Require HTTPS in Production
**Severity:** 🟠 HIGH  
**Impact:** Local development configuration  
**Affected:** Backend, Infrastructure

#### Current Behavior
```typescript
// HTTP works in all environments
http://localhost:5001
```

#### New Behavior
```typescript
// Production: HTTPS only
// Development: HTTP allowed
if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
  return res.redirect('https://' + req.hostname + req.url);
}
```

#### Migration Path
1. Configure Fly.io SSL certificate
2. Enable HTTPS redirect
3. Update CORS allowed origins

**No User Impact** (infrastructure change)

---

### BC-008: Database Field Renames
**Severity:** 🟡 MEDIUM  
**Impact:** Query updates  
**Affected:** Database, Backend

#### Changes

| Old Field | New Field | Model |
|-----------|-----------|-------|
| `content` | `description` | Task |
| `comment` | `journalEntry` | Reflection |

#### Migration Path

**Step 1: Add New Fields**
```sql
ALTER TABLE "Task" ADD COLUMN "description" TEXT;
UPDATE "Task" SET "description" = "content" WHERE "content" IS NOT NULL;
```

**Step 2: Update Application Code**
```typescript
// Update all references from content to description
```

**Step 3: Remove Old Fields**
```sql
ALTER TABLE "Task" DROP COLUMN "content";
```

#### Timeline
- Week 2: Add new fields, dual-write
- Week 3: Migrate data
- Week 4: Remove old fields

---

## ROLLBACK PROCEDURES

For each breaking change:

### Emergency Rollback
```bash
# Revert to previous deployment
fly deploy --image registry.fly.io/orbitai:sha-abc123

# Restore database backup
fly postgres restore --app orbitai-db backup-id
```

### Gradual Rollback
```typescript
// Feature flags to toggle new behavior
if (featureFlags.useNewAuth) {
  // New authentication
} else {
  // Old authentication (deprecated)
}
```

---

## COMMUNICATION PLAN

### For Each Breaking Change

1. **2 Weeks Before:**
   - Announce in changelog
   - Update documentation
   - Add deprecation warnings

2. **1 Week Before:**
   - Email users (if applicable)
   - In-app notification
   - Update API docs

3. **On Deployment:**
   - Changelog entry
   - GitHub release notes
   - Update status page

4. **After Deployment:**
   - Monitor error rates
   - Support channels open
   - Rollback plan ready

---

## TESTING BREAKING CHANGES

**Checklist for Each Change:**
- [ ] Unit tests updated
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Migration tested on staging
- [ ] Rollback procedure tested
- [ ] Documentation updated
- [ ] Changelog entry written
- [ ] Team notified

---

## MIGRATION STATUS TRACKER

| Change ID | Status | Staging Date | Production Date | Rollback Plan | Owner |
|-----------|--------|--------------|-----------------|---------------|-------|
| BC-001 | Planned | - | - | ✅ Yes | Backend |
| BC-002 | Planned | - | - | ✅ Yes | Full-stack |
| BC-003 | Planned | - | - | ✅ Yes | Full-stack |
| BC-004 | Planned | - | - | ✅ Yes | Frontend |
| BC-005 | Planned | - | - | N/A | DevOps |
| BC-006 | Planned | - | - | ✅ Yes | Backend |
| BC-007 | Planned | - | - | N/A | DevOps |
| BC-008 | Planned | - | - | ✅ Yes | Backend |

---

## LESSONS LEARNED (Update After Each Migration)

**What Went Well:**
- TBD after first migration

**What Could Be Improved:**
- TBD after first migration

**Action Items:**
- TBD after first migration

---

## SUMMARY

**Total Breaking Changes:** 8  
**Critical:** 3 (BC-001, BC-006, BC-007)  
**High:** 2 (BC-002, BC-007)  
**Medium:** 2 (BC-003, BC-008)  
**Low:** 1 (BC-005)

**Recommended Order:**
1. BC-001 + BC-006 (authentication) - Week 2
2. BC-003 (schema unification) - Week 3
3. BC-008 (field renames) - Week 3
4. BC-004 (context splitting) - Week 4
5. BC-002 (tRPC consolidation) - Week 5+
6. BC-005 (console.logs) - Ongoing
7. BC-007 (HTTPS) - With infrastructure update

**Timeline:** 6-8 weeks for all changes

**Risk Mitigation:**
- All changes tested on staging first
- Database backups before migrations
- Rollback procedures documented and tested
- Feature flags for gradual rollout
- Monitoring alerts for issues

---

**Last Updated:** November 17, 2025  
**Next Review:** December 17, 2025  
**Status:** PLANNING


