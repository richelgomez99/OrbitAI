# TEST COVERAGE GAPS - OrbitAI

**Current Coverage:** 0%  
**Target Coverage:** 60-80% (critical paths)  
**Test Framework:** Vitest + Testing Library

---

## EXECUTIVE SUMMARY

OrbitAI currently has **ZERO test coverage** except for one test file (`server/contextual/__tests__/messages.test.ts`). This is a **critical blocker** for production deployment.

**Immediate Priorities:**
1. 🔴 Authentication flow (login, signup, session management)
2. 🔴 Task CRUD operations (create, read, update, delete)
3. 🔴 tRPC authentication enforcement
4. 🟠 Reflection system
5. 🟠 AI chat integration

**Estimated Effort:** 40 hours to achieve 60% coverage on critical paths

---

## CRITICAL PATH COVERAGE (MUST TEST)

### 1. Authentication Flow (Priority: 🔴 CRITICAL)

**Current:** 0% coverage  
**Target:** 90% coverage  
**Estimated:** 8 hours

#### Tests Needed

**File:** `client/src/context/__tests__/AuthContext.test.tsx`

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase
vi.mock('@/lib/supabaseClient');

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('sets user state on successful login', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        const { error } = await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(error).toBeNull();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.email).toBe('test@example.com');
      });
    });

    it('handles login error gracefully', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        const { error } = await result.current.login({
          email: 'test@example.com',
          password: 'wrong-password',
        });
        expect(error).toBeTruthy();
        expect(error.message).toBe('Invalid credentials');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('sets loading state during login', async () => {
      // Test loading state transitions
    });
  });

  describe('signup', () => {
    it('creates new user account', async () => {
      // Test signup success
    });

    it('sets onboarding_completed to false', async () => {
      // Verify metadata
    });

    it('handles duplicate email error', async () => {
      // Test error handling
    });
  });

  describe('logout', () => {
    it('clears user state', async () => {
      // Test logout
    });

    it('removes localStorage items', async () => {
      // Verify cleanup
    });
  });

  describe('completeOnboarding', () => {
    it('updates user metadata', async () => {
      // Test onboarding completion
    });

    it('requires authenticated user', async () => {
      // Test auth requirement
    });
  });

  describe('session management', () => {
    it('restores session on page reload', async () => {
      // Test getSession on mount
    });

    it('handles expired session', async () => {
      // Test session expiry
    });
  });
});
```

---

### 2. Task CRUD Operations (Priority: 🔴 CRITICAL)

**Current:** 0% coverage  
**Target:** 80% coverage  
**Estimated:** 10 hours

#### Tests Needed

**File:** `client/src/context/__tests__/TaskContext.test.tsx` (after refactor)

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { TaskProvider, useTasks } from '../refactored/TaskContext';
import { apiRequest } from '@/lib/queryClient';

vi.mock('@/lib/queryClient');

describe('TaskContext', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Test Task',
      status: 'TODO',
      priority: 'MEDIUM',
      userId: 'user-123',
      createdAt: new Date(),
    },
  ];

  describe('fetchTasks', () => {
    it('loads tasks on mount', async () => {
      apiRequest.mockResolvedValue({
        ok: true,
        json: async () => mockTasks,
      });

      const { result } = renderHook(() => useTasks(), {
        wrapper: TaskProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.tasks).toHaveLength(1);
        expect(result.current.tasks[0].title).toBe('Test Task');
      });
    });

    it('handles fetch error', async () => {
      apiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTasks(), {
        wrapper: TaskProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        // Should show error toast
      });
    });
  });

  describe('addTask', () => {
    it('adds task with optimistic update', async () => {
      apiRequest.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useTasks(), {
        wrapper: TaskProvider,
      });

      const newTask = {
        title: 'New Task',
        priority: 'HIGH',
      };

      await act(async () => {
        await result.current.addTask(newTask);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('New Task');
    });

    it('rolls back on API error', async () => {
      apiRequest.mockRejectedValue(new Error('Failed to create'));

      const { result } = renderHook(() => useTasks(), {
        wrapper: TaskProvider,
      });

      await act(async () => {
        try {
          await result.current.addTask({ title: 'Fail Task' });
        } catch (error) {
          // Expected to fail
        }
      });

      expect(result.current.tasks).toHaveLength(0);
      // Verify toast error shown
    });
  });

  describe('updateTaskStatus', () => {
    it('updates status optimistically', async () => {
      // Test optimistic update
    });

    it('rolls back on failure', async () => {
      // Test rollback
    });
  });

  describe('updateTask', () => {
    it('updates task fields', async () => {
      // Test update
    });
  });

  describe('deleteTask', () => {
    it('removes task from list', async () => {
      // Test delete
    });

    it('rolls back on error', async () => {
      // Test rollback
    });
  });
});
```

**File:** `server/__tests__/task.router.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../appRouter';
import { prisma } from '../db';
import { createCaller } from '../trpc';

describe('Task Router', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const createAuthenticatedCaller = () => {
    return createCaller({
      user: mockUser,
      userId: mockUser.id,
    });
  };

  beforeEach(async () => {
    // Clean up test database
    await prisma.task.deleteMany({
      where: { userId: mockUser.id },
    });
  });

  describe('authentication', () => {
    it('requires authentication for getAll', async () => {
      const caller = createCaller({}); // No user

      await expect(caller.task.getAll()).rejects.toThrow('UNAUTHORIZED');
    });

    it('requires authentication for create', async () => {
      const caller = createCaller({});

      await expect(
        caller.task.create({
          title: 'Test Task',
          userId: 'fake-user',
        })
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('create', () => {
    it('creates task for authenticated user', async () => {
      const caller = createAuthenticatedCaller();

      const task = await caller.task.create({
        title: 'Test Task',
        description: 'Test description',
        priority: 'HIGH',
      });

      expect(task.title).toBe('Test Task');
      expect(task.userId).toBe(mockUser.id);
      expect(task.priority).toBe('HIGH');
      expect(task.status).toBe('TODO');
    });

    it('validates required fields', async () => {
      const caller = createAuthenticatedCaller();

      await expect(
        caller.task.create({
          title: '', // Empty title
        })
      ).rejects.toThrow();
    });

    it('sanitizes HTML in description', async () => {
      const caller = createAuthenticatedCaller();

      const task = await caller.task.create({
        title: 'Test',
        description: '<script>alert("xss")</script>Safe text',
      });

      expect(task.description).not.toContain('<script>');
      expect(task.description).toContain('Safe text');
    });
  });

  describe('getAll', () => {
    it('returns only user tasks', async () => {
      // Create tasks for different users
      await prisma.task.create({
        data: {
          title: 'User 1 Task',
          userId: mockUser.id,
          status: 'TODO',
          priority: 'MEDIUM',
          mode: 'BUILD',
        },
      });

      await prisma.task.create({
        data: {
          title: 'Other User Task',
          userId: 'other-user-id',
          status: 'TODO',
          priority: 'MEDIUM',
          mode: 'BUILD',
        },
      });

      const caller = createAuthenticatedCaller();
      const tasks = await caller.task.getAll();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('User 1 Task');
    });
  });

  describe('update', () => {
    it('updates task', async () => {
      // Test update
    });

    it('prevents updating other users tasks', async () => {
      // Security test
    });
  });

  describe('delete', () => {
    it('deletes task', async () => {
      // Test delete
    });

    it('prevents deleting other users tasks', async () => {
      // Security test
    });
  });
});
```

---

### 3. tRPC Authentication Enforcement (Priority: 🔴 CRITICAL)

**Current:** 0% coverage  
**Target:** 100% coverage  
**Estimated:** 4 hours

#### Tests Needed

**File:** `server/__tests__/auth.middleware.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { authedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

describe('Authentication Middleware', () => {
  it('rejects requests without auth token', async () => {
    const req = {
      headers: {},
    };

    await expect(
      authedProcedure.use(async () => {})({ ctx: { req, res: {} } })
    ).rejects.toThrow(TRPCError);
  });

  it('rejects invalid JWT token', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };

    await expect(
      authedProcedure.use(async () => {})({ ctx: { req, res: {} } })
    ).rejects.toThrow('UNAUTHORIZED');
  });

  it('accepts valid JWT token', async () => {
    // Mock Supabase JWT validation
    const req = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    // Should not throw
    await authedProcedure.use(async (opts) => {
      expect(opts.ctx.user).toBeDefined();
      expect(opts.ctx.userId).toBe('user-123');
    })({ ctx: { req, res: {} } });
  });

  it('extracts user ID from token', async () => {
    // Test user ID extraction
  });
});
```

---

## SECONDARY COVERAGE (SHOULD TEST)

### 4. Reflection System (Priority: 🟠 HIGH)

**Current:** 0% coverage  
**Target:** 70% coverage  
**Estimated:** 6 hours

**Files to Test:**
- `client/src/context/refactored/ReflectionContext.tsx`
- `server/__tests__/reflection.router.test.ts`
- `client/src/components/restore/__tests__/ReflectionEntry.test.tsx`

**Key Scenarios:**
- Create reflection with grounding strategies
- Fetch reflection history
- Mood trend calculations
- Energy level tracking

---

### 5. AI Chat Integration (Priority: 🟠 HIGH)

**Current:** 1 test file exists but incomplete  
**Target:** 60% coverage  
**Estimated:** 8 hours

**File:** `server/contextual/__tests__/messages.test.ts` (expand)

**Additional Tests Needed:**
- OpenAI API error handling
- Rate limiting enforcement
- Context building (mood, energy, tasks)
- Suggestion generation
- Cost tracking

---

### 6. Component Testing (Priority: 🟡 MEDIUM)

**Current:** 0% coverage  
**Target:** 50% coverage  
**Estimated:** 12 hours

**Critical Components:**
- `AddTaskModal.tsx` - Form validation, submission
- `TaskCard.tsx` - Render, interactions
- `ModeSwitcher.tsx` - Mode transitions
- `AuthForm.tsx` - Login/signup flows
- `MoodPicker.tsx` - Mood selection

**Example:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AddTaskModal } from '../add-task-modal';

describe('AddTaskModal', () => {
  it('renders form fields', () => {
    render(<AddTaskModal />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<AddTaskModal />);

    const submitButton = screen.getByText(/create task/i);
    fireEvent.click(submitButton);

    await screen.findByText(/title is required/i);
  });

  it('submits task on form submit', async () => {
    const onSubmit = vi.fn();
    render(<AddTaskModal onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'New Task' },
    });

    fireEvent.click(screen.getByText(/create task/i));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
        })
      );
    });
  });

  it('shows loading state during submission', async () => {
    render(<AddTaskModal />);

    // Test loading spinner
  });

  it('closes modal on successful creation', async () => {
    // Test modal close
  });
});
```

---

## TEST INFRASTRUCTURE SETUP

### Prerequisites

```bash
# Install dependencies (already present)
npm install --save-dev \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  vitest \
  jsdom
```

### Configuration

**File:** `vitest.config.ts` (update)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'client/src/**/*.{ts,tsx}',
        'server/**/*.ts',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
      ],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
```

**File:** `tests/setup.ts` (create)

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

---

## RUNNING TESTS

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --grep="TaskContext"
```

---

## CI/CD INTEGRATION

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  pull_request:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Check coverage thresholds
        run: |
          if [ $(jq '.total.lines.pct < 60' coverage/coverage-summary.json) = true ]; then
            echo "Coverage below 60%"
            exit 1
          fi
```

---

## TESTING PRIORITIES

### Week 1: Critical Paths (40 hours)
1. Authentication flow (8h)
2. Task CRUD operations (10h)
3. tRPC authentication (4h)
4. Reflection system (6h)
5. AI chat integration (8h)
6. Setup CI/CD (4h)

**Goal:** 60% coverage on critical paths

### Week 2: Component Coverage (20 hours)
1. AddTaskModal (3h)
2. TaskCard (3h)
3. ModeSwitcher (3h)
4. AuthForm (4h)
5. MoodPicker (2h)
6. Other components (5h)

**Goal:** 50% component coverage

### Ongoing: Maintain Coverage
- New features MUST include tests
- Code review enforces test requirements
- Coverage reports on every PR

---

## MEASURING SUCCESS

**Metrics to Track:**
- Overall coverage percentage
- Critical path coverage (target: 80%)
- Component coverage (target: 50%)
- Test execution time (target: <30 seconds)
- Flaky test rate (target: 0%)

**Tools:**
- Codecov for coverage tracking
- Vitest UI for interactive debugging
- Coverage reports in PR comments

---

## COMMON TESTING PATTERNS

### 1. Testing Hooks
```typescript
const { result } = renderHook(() => useCustomHook(), {
  wrapper: ProviderComponent,
});

await act(async () => {
  result.current.doSomething();
});

await waitFor(() => {
  expect(result.current.state).toBe('expected');
});
```

### 2. Testing Async Operations
```typescript
it('handles async operation', async () => {
  render(<Component />);

  fireEvent.click(screen.getByText(/submit/i));

  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### 3. Mocking API Calls
```typescript
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

// In test:
apiRequest.mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mock data' }),
});
```

---

## ANTI-PATTERNS TO AVOID

❌ **Testing Implementation Details**
```typescript
// Bad: Testing internal state
expect(component.state.isLoading).toBe(true);

// Good: Testing observable behavior
expect(screen.getByRole('progressbar')).toBeInTheDocument();
```

❌ **Mocking Everything**
```typescript
// Bad: Defeats purpose of integration test
vi.mock('./database');
vi.mock('./api');
vi.mock('./auth');

// Good: Mock external services only
vi.mock('@supabase/supabase-js');
```

❌ **Overly Specific Assertions**
```typescript
// Bad: Brittle test
expect(element.className).toBe('flex items-center gap-2 px-4 py-2');

// Good: Test behavior, not implementation
expect(element).toHaveAccessibleName('Submit');
```

---

## CONCLUSION

Achieving 60% test coverage is **non-negotiable** for production deployment. Follow the priority order:

1. 🔴 **Week 1:** Critical paths (auth, tasks, tRPC)
2. 🟠 **Week 2:** Components and edge cases
3. 🟡 **Ongoing:** Maintain coverage as new features added

**Estimated Total:** 60 hours to production-ready test suite

**Next Action:** Start with `AuthContext.test.tsx`


