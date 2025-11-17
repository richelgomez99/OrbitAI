# REFACTORING PLAN - OrbitAI

**Step-by-Step Strategy for Production-Grade Code Quality**  
**Approach:** Incremental refactoring with continuous deployment  
**Timeline:** 4-6 weeks

---

## EXECUTIVE SUMMARY

This plan transforms OrbitAI from a functional prototype to production-grade code through systematic refactoring. We follow the **Strangler Fig Pattern** - gradually replacing problematic code while keeping the app functional.

**Refactoring Principles:**
1. ✅ **Tests first**: Write tests before refactoring
2. ✅ **Small steps**: Incremental changes with frequent commits
3. ✅ **Always deployable**: Never break the main branch
4. ✅ **Measure impact**: Track bundle size, performance metrics
5. ✅ **Document changes**: Update docs as we go

---

## PHASE 1: CRITICAL FOUNDATION (Week 1-2)

### 1.1 Split OrbitContext (Priority: 🔴 CRITICAL)

**Problem:** 606-line context with 21 state variables causes unnecessary re-renders

**Current Structure:**
```
OrbitContext (606 lines)
├── Mode, Mood, Energy state
├── Task CRUD operations
├── Reflection CRUD operations
├── Chat/AI state
├── Navigation state
└── UI modal state
```

**Target Structure:**
```
Contexts (separate concerns):
├── AppContext (mode, mood, energy, navigation)
├── TaskContext (tasks, CRUD, loading)
├── ReflectionContext (reflections, CRUD)
└── ChatContext (messages, AI, suggestions)
```

**Implementation:**

**Step 1:** Create new context files (don't delete old one yet)
```bash
mkdir -p client/src/context/refactored
touch client/src/context/refactored/{App,Task,Reflection,Chat}Context.tsx
```

**Step 2:** Extract TaskContext
```tsx
// client/src/context/refactored/TaskContext.tsx
import { createContext, useContext, useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch tasks on mount
  useEffect(() => {
    if (!user) return;
    
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        toast({
          title: "Failed to load tasks",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const addTask = async (taskData: Partial<Task>) => {
    if (!user) throw new Error("Not authenticated");

    const newTask: Task = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: taskData.title || "Untitled",
      status: "TODO",
      priority: taskData.priority || "MEDIUM",
      mode: taskData.mode || "BUILD",
      createdAt: new Date(),
      ...taskData,
    };

    // Optimistic update
    setTasks(prev => [...prev, newTask]);

    try {
      await apiRequest("POST", "/api/tasks", newTask);
      toast({ title: "Task created!" });
    } catch (error) {
      // Rollback
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
      toast({
        title: "Failed to create task",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    // Optimistic update
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, status } : task
      )
    );

    try {
      await apiRequest("PATCH", `/api/tasks/${id}`, { status });
    } catch (error) {
      // Rollback
      setTasks(prev => prev); // Refetch or restore from snapshot
      toast({
        title: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (updatedTask: Task) => {
    setTasks(prev =>
      prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );

    try {
      await apiRequest("PATCH", `/api/tasks/${updatedTask.id}`, updatedTask);
    } catch (error) {
      toast({
        title: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    const oldTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      toast({ title: "Task deleted" });
    } catch (error) {
      setTasks(oldTasks);
      toast({
        title: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }
  return context;
}
```

**Step 3:** Repeat for ReflectionContext, ChatContext, AppContext

**Step 4:** Update App.tsx to use new contexts
```tsx
// client/src/App.tsx
import { AppProvider } from '@/context/refactored/AppContext';
import { TaskProvider } from '@/context/refactored/TaskContext';
import { ReflectionProvider } from '@/context/refactored/ReflectionContext';
import { ChatProvider } from '@/context/refactored/ChatContext';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <TaskProvider>
              <ReflectionProvider>
                <ChatProvider>
                  <TooltipProvider>
                    <Toaster />
                    <MainLayout>
                      <AppRoutes />
                    </MainLayout>
                  </TooltipProvider>
                </ChatProvider>
              </ReflectionProvider>
            </TaskProvider>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

**Step 5:** Update components to use new hooks
```tsx
// Before:
const { tasks, addTask, updateTaskStatus } = useOrbit();

// After:
const { tasks, isLoading } = useTasks();
const { mode, mood, energy } = useApp();
```

**Step 6:** Write tests for new contexts
```tsx
// client/src/context/refactored/__tests__/TaskContext.test.tsx
describe('TaskContext', () => {
  it('provides tasks', () => { /* ... */ });
  it('adds task with optimistic update', () => { /* ... */ });
  it('rolls back on error', () => { /* ... */ });
});
```

**Step 7:** Delete old OrbitContext after migration complete

**Estimated Time:** 16 hours  
**Risk:** MEDIUM (requires careful migration)  
**Benefit:** Massive re-render reduction, better testability

---

### 1.2 Consolidate API Layer (Priority: 🔴 HIGH)

**Problem:** Mixing REST and tRPC, manual `fetch()` calls scattered

**Current State:**
```
API Calls:
├── Manual fetch() in contexts (30% of calls)
├── tRPC for some operations (20%)
├── REST endpoints (50%)
└── No consistent error handling
```

**Target State:**
```
Single API Layer:
└── tRPC for everything
    ├── task.router (CRUD)
    ├── reflection.router (CRUD)
    ├── chat.router (AI)
    └── mode.router (mode transitions)
```

**Implementation:**

**Step 1:** Complete tRPC routers (add missing operations)
```tsx
// server/routers/reflection.router.ts
export const reflectionRouter = router({
  getAll: authedProcedure.query(async ({ ctx }) => {
    return storage.getReflections({ userId: ctx.userId, limit: 50 });
  }),
  
  create: authedProcedure
    .input(reflectionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return storage.createReflection({
        ...input,
        userId: ctx.userId,
      });
    }),
  
  getById: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return storage.getReflection(input.id);
    }),
});
```

**Step 2:** Replace fetch() calls with tRPC
```tsx
// Before (in context):
const response = await apiRequest("GET", "/api/tasks");
const tasks = await response.json();

// After:
const { data: tasks, isLoading } = trpc.task.getAll.useQuery();
```

**Step 3:** Deprecate REST routes (keep for backward compatibility)
```tsx
// server/routes.ts
// Mark as deprecated
/**
 * @deprecated Use tRPC task.getAll instead
 */
appParam.get('/api/tasks', async (req, res) => {
  // ... existing code
});
```

**Step 4:** Update all components to use tRPC
```tsx
// client/src/components/dashboard/BuildDashboardContent.tsx
import { trpc } from '@/lib/trpc';

export function BuildDashboardContent() {
  const { data: tasks, isLoading } = trpc.task.getAll.useQuery();
  const createTask = trpc.task.create.useMutation();
  
  const handleAddTask = async (data: TaskInput) => {
    await createTask.mutateAsync(data);
  };
  
  // ...
}
```

**Estimated Time:** 12 hours  
**Benefit:** Type-safe API, automatic loading states, better caching

---

### 1.3 Remove Default User Logic (Priority: 🔴 HIGH)

**Problem:** Conflicting auth systems (Supabase + fake default user)

**Occurrences:**
- `server/routes.ts:158-175`
- `server/routers/task.router.ts:86-102`
- `server/storage.ts:761-772`

**Fix:** Delete all `getDefaultUserId()` functions and require real auth

**Implementation:**
```bash
# Search and destroy
grep -r "getDefaultUserId" server/
# Delete all occurrences
# Ensure all tRPC procedures use `authedProcedure`
```

**Estimated Time:** 2 hours  
**Benefit:** Security, clarity

---

## PHASE 2: CODE QUALITY (Week 3-4)

### 2.1 Break Up Long Files

**Files Over 300 Lines:**

| File | Lines | Action |
|------|-------|--------|
| `orbit-context.tsx` | 606 | SPLIT (see 1.1) |
| `storage.ts` | 836 | Split into DAOs |
| `routes.ts` | 420 | Deprecate for tRPC |
| `openai.ts` | 372 | Extract prompts |
| `AuthContext.tsx` | 188 | ✅ OK, leave as-is |

**2.1.1 Refactor storage.ts**

**Current:** One giant class with all methods

**Target:** DAO pattern (Data Access Object per entity)
```
server/storage/
├── index.ts (exports)
├── TaskDAO.ts
├── ReflectionDAO.ts
├── UserDAO.ts
├── FocusSessionDAO.ts
└── ModeTransitionDAO.ts
```

**Example:**
```tsx
// server/storage/TaskDAO.ts
import { PrismaClient } from '@prisma/client';

export class TaskDAO {
  constructor(private prisma: PrismaClient) {}
  
  async findByUser(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async create(data: CreateTaskInput) {
    return this.prisma.task.create({ data });
  }
  
  // ... other methods
}

// server/storage/index.ts
export const storage = {
  tasks: new TaskDAO(prisma),
  reflections: new ReflectionDAO(prisma),
  users: new UserDAO(prisma),
  // ...
};
```

**Estimated Time:** 10 hours  
**Benefit:** Easier to test, better organization

---

**2.1.2 Extract Prompts from openai.ts**

**Current:** 372-line file with inline prompts

**Target:**
```
server/ai/
├── openai.ts (API client)
├── prompts/
│   ├── taskBreakdown.ts
│   ├── chatResponse.ts
│   └── taskReframing.ts
└── types.ts
```

**Example:**
```tsx
// server/ai/prompts/chatResponse.ts
export const chatResponsePrompt = (context: UserContext) => `
You are an emotionally intelligent productivity assistant...

Current user context:
- Mode: ${context.mode}
- Mood: ${context.mood}
- Energy: ${context.energy}/100

[Rest of prompt]
`;

// server/ai/openai.ts
import { chatResponsePrompt } from './prompts/chatResponse';

export async function generateChatResponse(message: string, context: UserContext) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: chatResponsePrompt(context) },
      { role: "user", content: message }
    ],
  });
  // ...
}
```

**Estimated Time:** 6 hours  
**Benefit:** Easier to iterate on prompts, version control

---

### 2.2 Eliminate Code Duplication

**High-Priority Duplications:**

**2.2.1 Enum Conversion Functions** (appears 2x)
```tsx
// Create shared utility
// server/utils/prismaEnums.ts
export function toTaskStatus(value: string): TaskStatus {
  return isTaskStatus(value.toUpperCase()) 
    ? value.toUpperCase() as TaskStatus 
    : TaskStatus.TODO;
}
// Use everywhere, delete duplicates
```

**2.2.2 Prisma Client Initialization** (appears 2x)
```tsx
// Single instance
// server/db.ts
export const prisma = new PrismaClient();

// Everyone imports from here
import { prisma } from './db';
```

**Estimated Time:** 4 hours  
**Benefit:** DRY, easier to maintain

---

### 2.3 Standardize Naming Conventions

**Current Issues:**
- `PascalCase.tsx` vs `kebab-case.tsx` for files
- `createTask` vs `addTask` for same operation
- `dueAt` vs `dueDate` inconsistency

**Decisions:**
```
Files:
├── Pages: kebab-case.tsx (dashboard-view.tsx)
├── Components: PascalCase.tsx (TaskCard.tsx)
└── Utilities: kebab-case.ts (api-client.ts)

Functions:
├── CRUD: create/read/update/delete (not add/get/change/remove)
└── Dates: Always use *At suffix (dueAt, createdAt, completedAt)
```

**Implementation:**
```bash
# Rename files
mv client/src/pages/TasksPage.tsx client/src/pages/tasks-page.tsx
mv client/src/pages/tasks.tsx client/src/pages/tasks-old.tsx # Check for differences first

# Search and replace function names
# addTask → createTask (be careful with imports)
# getTask → readTask
# etc.
```

**Estimated Time:** 6 hours  
**Benefit:** Consistency, professionalism

---

## PHASE 3: PERFORMANCE OPTIMIZATION (Week 5)

### 3.1 Implement Code Splitting

**Target:** Reduce initial bundle from ~240KB to <150KB

**Strategy:**
```tsx
// client/src/App.tsx
import { lazy, Suspense } from 'react';

// Lazy load routes
const DashboardView = lazy(() => import('@/pages/dashboard-view'));
const ChatView = lazy(() => import('@/pages/chat-view'));
const SettingsPage = lazy(() => import('@/pages/settings-page'));
const OnboardingFlow = lazy(() => import('@/pages/onboarding-flow'));

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Switch>
        <Route path="/dashboard" component={DashboardView} />
        <Route path="/chat" component={ChatView} />
        {/* ... */}
      </Switch>
    </Suspense>
  );
}
```

**Lazy Load Heavy Libraries:**
```tsx
// Only load Framer Motion on animated pages
const motion = lazy(() => import('framer-motion').then(m => ({ default: m.motion })));
```

**Estimated Time:** 8 hours  
**Benefit:** 40% bundle size reduction, faster initial load

---

### 3.2 Add Memoization

**Problem:** Expensive computations run on every render

**Fix:**
```tsx
// Dashboard filtered/sorted tasks
const filteredTasks = useMemo(() => {
  return tasks
    .filter(task => task.mode === mode)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // ... other sorts
    });
}, [tasks, mode, sortBy]);

// Callbacks that don't need recreation
const handleTaskClick = useCallback((taskId: string) => {
  setTaskForDetailView(tasks.find(t => t.id === taskId) || null);
  setShowTaskDetailModal(true);
}, [tasks]);

// Components that shouldn't re-render
const TaskCard = memo(({ task, onComplete }: Props) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.status === nextProps.task.status;
});
```

**Estimated Time:** 6 hours  
**Benefit:** Reduced renders, smoother UI

---

### 3.3 Implement Virtualization

**Problem:** Rendering 100+ tasks causes lag

**Fix:**
```bash
npm install @tanstack/react-virtual
```

```tsx
// client/src/components/VirtualTaskList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualTaskList({ tasks }: { tasks: Task[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated task card height
    overscan: 5, // Render 5 extra items off-screen
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <TaskCard task={tasks[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Estimated Time:** 4 hours  
**Benefit:** Smooth scrolling with 1000+ tasks

---

## PHASE 4: TESTING INFRASTRUCTURE (Week 6)

### 4.1 Set Up Test Environment

**Current:** Vitest configured, but no tests

**Target:** 60%+ coverage on critical paths

**Setup:**
```bash
# Install testing libraries
npm install --save-dev \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  vitest-mock-extended

# Create test setup
touch tests/setup.ts
```

```tsx
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));
```

**Estimated Time:** 4 hours

---

### 4.2 Write Critical Path Tests

**Priority tests:**

1. **Authentication flow:**
```tsx
// client/src/context/__tests__/AuthContext.test.tsx
describe('AuthContext', () => {
  it('logs in user', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

2. **Task CRUD:**
```tsx
// client/src/context/__tests__/TaskContext.test.tsx
describe('TaskContext', () => {
  it('creates task with optimistic update', async () => {
    // ...
  });
  
  it('rolls back on error', async () => {
    // ...
  });
});
```

3. **Backend API:**
```tsx
// server/__tests__/task.router.test.ts
describe('Task Router', () => {
  it('requires authentication', async () => {
    const caller = createCaller({});
    await expect(caller.task.getAll()).rejects.toThrow('UNAUTHORIZED');
  });
  
  it('creates task for authenticated user', async () => {
    const caller = createCaller({ user: mockUser });
    const task = await caller.task.create({
      title: 'Test task',
      userId: mockUser.id,
    });
    expect(task.title).toBe('Test task');
  });
});
```

**Estimated Time:** 20 hours  
**Target Coverage:** 60%+ on critical paths

---

## REFACTORING CHECKLIST

### Before Starting Each Refactor
- [ ] Write failing tests for current behavior
- [ ] Create feature branch
- [ ] Document current implementation

### During Refactoring
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Commit frequently with clear messages
- [ ] Keep app functional (no broken states)

### After Refactoring
- [ ] All tests pass
- [ ] No linter errors
- [ ] Bundle size unchanged or reduced
- [ ] Performance same or better
- [ ] Update documentation
- [ ] Code review
- [ ] Merge to main

---

## ROLLBACK STRATEGY

**If refactor goes wrong:**
```bash
# Revert last commit
git revert HEAD

# Revert entire feature branch
git checkout main
git branch -D refactor/split-contexts
git push origin --delete refactor/split-contexts
```

**Keep old code temporarily:**
```tsx
// Mark as deprecated but don't delete yet
/**
 * @deprecated Use useTasks() instead. Will be removed in v2.0.
 */
export function useOrbit() {
  // ... old implementation
}
```

---

## SUCCESS METRICS

**Track these metrics before/after:**

| Metric | Before | Target | Measure With |
|--------|--------|--------|--------------|
| Bundle size | ~240KB | <150KB | `npm run build && ls -lh dist/` |
| Initial render | Unknown | <200ms | React DevTools Profiler |
| Re-renders (dashboard) | High | <10 per interaction | React DevTools |
| Test coverage | 0% | 60% | `npm run test:coverage` |
| Linter errors | Unknown | 0 | `npm run check` |
| Type errors | Few | 0 | `npm run check` |
| Files >300 lines | 4 | 0 | `find . -name "*.tsx" -exec wc -l {} + | awk '$1 > 300'` |

---

## TIMELINE SUMMARY

| Week | Focus | Hours |
|------|-------|-------|
| 1-2 | Split contexts, consolidate API | 28h |
| 3-4 | Code quality, break up files | 26h |
| 5 | Performance optimization | 18h |
| 6 | Testing infrastructure | 24h |
| **Total** | | **~96 hours (~12 days)** |

With Claude Code: **~50-60 hours (~7-8 days)**

---

## PHASE 5: OPTIONAL (Long-term)

### 5.1 Migrate to Next.js (if needed for SEO/SSR)
### 5.2 Add Redis caching
### 5.3 Implement WebSocket for real-time updates
### 5.4 Add background job queue (BullMQ)

These are **not required** for production launch but may be valuable for scale.

---

**Next Step:** Start with Phase 1, Item 1.1 (Split OrbitContext) and track progress in git commits.


