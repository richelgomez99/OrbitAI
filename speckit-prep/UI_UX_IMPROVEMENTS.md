# UI/UX IMPROVEMENTS - OrbitAI

**Every UI Element Evaluated for Production Quality**  
**Target:** Portfolio-worthy, WCAG AA compliant, delightful to use

---

## EXECUTIVE SUMMARY

OrbitAI's UI is **functionally complete** but lacks **production polish**. The design system (shadcn/ui + Tailwind) provides excellent foundations, but custom components need:
- ✅ Consistent styling
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Accessibility improvements
- ✅ Mobile optimization
- ✅ Micro-interactions

**Current State:** 🟡 **60% Production-Ready**  
**Target State:** 🟢 **95% Production-Ready** (portfolio-quality)

**Estimated Effort:** 3-4 weeks of focused UI/UX work

---

## 1. COMPONENT-BY-COMPONENT ASSESSMENT

### 1.1 Landing Page (`LandingPage.tsx`)

**Current State:** ⚠️ PARTIAL (65% complete)

#### Issues
1. **Placeholder Icons:** `[Cycle Icon]`, `[Heart/Brain Icon]`, `[Focus Icon]` are text
2. **No Hero Image:** Text-only hero section lacks visual impact
3. **Mobile Typography:** H1 too large on small screens (60px)
4. **No Social Proof:** No testimonials, user count, or trust indicators
5. **CTA Hierarchy:** Both buttons have equal visual weight

#### Improvements

**Priority 1: Replace Placeholder Icons**
```tsx
import { Workflow, Brain, Target, Sparkles } from 'lucide-react';

<div className="grid md:grid-cols-3 gap-6 md:gap-8 text-left">
  <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <Workflow className="w-12 h-12 mb-4 text-purple-400" />
    <h3 className="text-xl font-semibold text-white mb-3">
      Adaptive Workflows
    </h3>
    <p className="text-neutral-400 leading-relaxed">
      Orbit learns your unique rhythms and energy patterns...
    </p>
  </div>
  
  <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <Brain className="w-12 h-12 mb-4 text-teal-400" />
    <h3 className="text-xl font-semibold text-white mb-3">
      Emotional Intelligence
    </h3>
    <p className="text-neutral-400 leading-relaxed">
      Gentle nudges, empathetic feedback...
    </p>
  </div>
  
  <div className="bg-neutral-800 p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <Target className="w-12 h-12 mb-4 text-blue-400" />
    <h3 className="text-xl font-semibold text-white mb-3">
      Unlock Your Focus
    </h3>
    <p className="text-neutral-400 leading-relaxed">
      Minimize distractions and cultivate deep work...
    </p>
  </div>
</div>
```

**Priority 2: Responsive Typography**
```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white max-w-3xl">
  Orbit: Your Personal Momentum Engine for a Neurodivergent World.
</h1>
```

**Priority 3: Add Hero Visual**
Options:
1. Animated gradient orb (pure CSS)
2. Abstract illustration (commission designer)
3. Screenshot of app dashboard (when polished)

```tsx
// Option 1: CSS Animated Orb
<div className="absolute inset-0 -z-10 overflow-hidden">
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" />
</div>
```

**Priority 4: Improve CTAs**
```tsx
<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
  <Link 
    href="/signup" 
    className="group relative overflow-hidden py-3 px-8 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ease-in-out no-underline"
  >
    <span className="relative z-10">Get Started Free</span>
    <Sparkles className="inline-block ml-2 h-5 w-5" />
  </Link>
  <Link 
    href="/login" 
    className="py-3 px-8 text-lg font-semibold rounded-lg border-2 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 transform hover:scale-105 transition-all duration-200 ease-in-out no-underline"
  >
    Log In
  </Link>
</div>
```

**Status:** ⚠️ IN PROGRESS → 🎯 Target: 95%

---

### 1.2 Authentication Forms (`AuthForm.tsx`, `LoginPage.tsx`, `SignupPage.tsx`)

**Current State:** ⚠️ PARTIAL (70% complete)

#### Issues
1. **No Validation Feedback:** Errors only shown as text, no field-level highlighting
2. **Placeholder Password Reset:** "Forgot password?" goes nowhere
3. **No Loading State:** Button doesn't show loading during auth
4. **No Success States:** No confirmation when signup succeeds
5. **Poor Mobile UX:** Form inputs too small on mobile

#### Improvements

**Priority 1: Add Inline Validation**
```tsx
// SignupPage.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            At least 6 characters
          </p>
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full mt-6">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </Button>
    </form>
  );
}
```

**Priority 2: Implement Password Reset Flow**
```tsx
// client/src/pages/Auth/PasswordResetPage.tsx
export function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  
  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (!error) {
      setSent(true);
    }
  };
  
  if (sent) {
    return (
      <div className="text-center">
        <Mail className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-neutral-400">
          We've sent a password reset link to {email}
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleReset(); }}>
      {/* Form fields */}
    </form>
  );
}
```

**Priority 3: Add Password Strength Indicator**
```tsx
import { Check, X } from 'lucide-react';

function PasswordStrength({ password }: { password: string }) {
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2 text-xs">
        {checks.length ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-neutral-500" />}
        <span className={checks.length ? 'text-green-500' : 'text-neutral-500'}>
          At least 6 characters
        </span>
      </div>
      {/* More checks */}
    </div>
  );
}
```

**Status:** ⚠️ → 🎯 Target: 90%

---

### 1.3 Dashboard View (`dashboard-view.tsx`)

**Current State:** ✅ FUNCTIONAL (75% complete)

#### Issues
1. **160 Lines of Commented Code:** Clutters file
2. **No Skeleton Loading:** Shows nothing while tasks load
3. **Sort Dropdown Too Small:** Hard to tap on mobile
4. **Add Task Button:** Icon-only, no label (accessibility issue)

#### Improvements

**Priority 1: Add Loading Skeleton**
```tsx
// client/src/components/skeletons/TaskCardSkeleton.tsx
export function TaskCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-neutral-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-neutral-700 rounded w-1/2 mb-2" />
      <div className="flex gap-2">
        <div className="h-6 bg-neutral-700 rounded w-16" />
        <div className="h-6 bg-neutral-700 rounded w-20" />
      </div>
    </div>
  );
}

// dashboard-view.tsx
{isLoadingTasks ? (
  <div className="grid gap-4">
    {[1, 2, 3].map(i => <TaskCardSkeleton key={i} />)}
  </div>
) : tasks.length === 0 ? (
  <EmptyTaskList />
) : (
  <BuildDashboardContent tasks={tasks} sortBy={sortBy} />
)}
```

**Priority 2: Improve Add Task Button**
```tsx
<Button 
  size="icon" 
  variant="ghost"
  className="bg-[#9F7AEA]/10 border border-[#9F7AEA]/30 w-10 h-10 rounded-full sm:w-auto sm:px-4 sm:rounded-lg"
  onClick={() => setShowAddTaskModal(true)}
  aria-label="Add new task"
>
  <Plus className="text-[#9F7AEA] h-5 w-5" />
  <span className="hidden sm:inline ml-2">Add Task</span>
</Button>
```

**Priority 3: Clean Up Code**
- Delete lines 57-217 (commented JSX)
- Move to git history if needed

**Status:** ✅ → 🎯 Target: 95%

---

### 1.4 Task Components

#### TaskCard (`task-card.tsx`)
**Current State:** ✅ FUNCTIONAL (80%)

**Issues:**
1. **No Hover Feedback:** Card doesn't lift on hover
2. **Status Badges:** Could be more visual
3. **Priority Color Coding:** Exists but inconsistent

**Improvements:**
```tsx
<motion.div
  whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(159, 122, 234, 0.15)' }}
  className="bg-surface rounded-lg p-4 border border-neutral-800 transition-all cursor-pointer"
  onClick={() => handleTaskClick(task)}
>
  <div className="flex items-start justify-between mb-2">
    <h3 className="font-semibold text-primary">{task.title}</h3>
    <PriorityBadge priority={task.priority} />
  </div>
  <p className="text-sm text-secondary mb-3">{task.description}</p>
  <div className="flex items-center justify-between">
    <StatusBadge status={task.status} />
    {task.dueDate && <DueDateBadge date={task.dueDate} />}
  </div>
</motion.div>
```

#### AddTaskModal (`add-task-modal.tsx`)
**Current State:** ⚠️ PARTIAL (70%)

**Issues:**
1. **No Loading State:** Button doesn't show feedback
2. **No Success Feedback:** Modal just closes
3. **Form Validation:** Missing inline errors

**Improvements:** (See Quick Wins #3)

---

### 1.5 Restore Mode Components

#### RestoreDashboard (`RestoreDashboard.tsx`)
**Current State:** ⚠️ PARTIAL (60%)

**Issues:**
1. **Mock Data:** Not connected to real reflections
2. **Grounding Strategies:** Hardcoded list
3. **Visual Polish:** Feels prototype-y

**Improvements:**
```tsx
// Fetch real data
const { data: recentReflections } = trpc.reflection.getRecent.useQuery({ limit: 5 });

// Display mood trend
<MoodTrendChart reflections={recentReflections} />

// Personalized grounding strategies
<GroundingStrategies 
  strategies={user.preferredStrategies}
  mood={currentMood}
/>
```

#### MoodPicker (`mood-picker.tsx`)
**Current State:** ✅ FUNCTIONAL (85%)

**Polish Needed:**
- Emoji buttons could be larger on mobile
- Add haptic feedback (vibration on mobile)
- Smooth transition animations

---

## 2. ACCESSIBILITY FIXES (WCAG 2.1 AA)

### 2.1 Keyboard Navigation

**Current Issues:**
- ❌ Modals don't trap focus
- ❌ Skip navigation missing
- ❌ Tab order jumps around

**Fixes:**

**Focus Trap in Modals:**
```tsx
// Use shadcn/ui Dialog's built-in focus trap
<Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
  {/* Dialog auto-handles focus trap */}
</Dialog>
```

**Skip Navigation:**
```tsx
// client/src/components/layout/Header.tsx
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded"
>
  Skip to main content
</a>

// dashboard-view.tsx
<main id="main-content" className="...">
  {/* Dashboard content */}
</main>
```

**Keyboard Shortcuts:**
```tsx
// client/src/hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K: Open add task modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowAddTaskModal(true);
      }
      
      // Cmd+/ / Ctrl+/: Open help
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowHelpModal(true);
      }
      
      // ESC: Close modals
      if (e.key === 'Escape') {
        setShowAddTaskModal(false);
        setShowModeSwitcher(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
}
```

### 2.2 ARIA Labels

**Missing Labels:**

```tsx
// Add to all icon-only buttons
<Button 
  size="icon"
  aria-label="Add new task"
>
  <Plus />
</Button>

<Button
  aria-label="Switch mode"
>
  <ChevronDownSquare />
</Button>

// Add to mode switcher
<div role="radiogroup" aria-label="Select productivity mode">
  <button role="radio" aria-checked={mode === 'build'}>
    Build
  </button>
</div>

// Add to task status indicators
<div role="status" aria-live="polite">
  {completedTasks.length} of {tasks.length} tasks completed
</div>
```

### 2.3 Color Contrast

**Failing Elements:**
```
text-neutral-400 on bg-neutral-900 = 3.2:1 (FAIL, need 4.5:1)
text-secondary (neutral-400) = FAIL
Purple accent #9F7AEA on dark bg = borderline
```

**Fixes:**
```tsx
// Increase contrast for secondary text
// tailwind.config.ts
colors: {
  secondary: '#a8a8a8', // Was #9ca3af (neutral-400), now lighter
}

// Or use CSS custom properties
:root {
  --text-secondary: #b0b0b0; /* 4.6:1 ratio */
}
```

**Run Lighthouse:**
```bash
npm run build
npx serve dist
# Open Chrome DevTools > Lighthouse > Accessibility
# Fix all issues with score < 90
```

---

## 3. MOBILE OPTIMIZATION

### 3.1 Responsive Breakpoints

**Current Issues:**
- Some components assume desktop
- Touch targets too small (<44x44px)
- Modals take full screen unnecessarily

**Fixes:**

**Touch Target Sizes:**
```tsx
// All buttons should be at least 44x44px
<Button 
  size="lg" 
  className="min-h-[44px] min-w-[44px] touch-manipulation"
>
  {/* Content */}
</Button>
```

**Modal Sizing:**
```tsx
// Make modals full-screen on mobile, centered on desktop
<Dialog>
  <DialogContent className="w-full max-w-2xl h-full sm:h-auto sm:rounded-lg">
    {/* Content */}
  </DialogContent>
</Dialog>
```

**Sticky Bottom Nav:**
```tsx
// Already implemented - add safe area insets for iOS
<nav className="fixed bottom-0 inset-x-0 pb-safe">
  {/* Navigation */}
</nav>
```

### 3.2 Mobile-Specific Features

**Pull-to-Refresh:**
```tsx
// client/src/hooks/usePullToRefresh.ts
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  useEffect(() => {
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = async (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      if (endY - startY > 100 && window.scrollY === 0) {
        await onRefresh();
      }
    };
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);
}
```

**Haptic Feedback (iOS/Android):**
```tsx
// client/src/lib/haptics.ts
export function vibrate(pattern: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const duration = {
      light: 10,
      medium: 20,
      heavy: 30,
    }[pattern];
    
    navigator.vibrate(duration);
  }
}

// Use on button press
<Button onClick={() => {
  vibrate('light');
  handleSubmit();
}}>
  Submit
</Button>
```

---

## 4. LOADING & ERROR STATES

### 4.1 Loading States Matrix

| Feature | Current | Needed | Priority |
|---------|---------|--------|----------|
| Initial app load | ✅ Has loading | Add skeleton | P1 |
| Fetch tasks | ⚠️ No visual indicator | Skeleton cards | P0 |
| Create task | ❌ No feedback | Button spinner | P0 |
| Update task | ❌ No feedback | Optimistic update | P1 |
| AI chat | ❌ No indicator | Typing animation | P1 |
| Delete task | ❌ No feedback | Confirmation modal | P0 |
| Mode switch | ❌ No feedback | Transition animation | P2 |

### 4.2 Skeleton Loaders

**Create library:**
```tsx
// client/src/components/skeletons/index.tsx
export function TaskCardSkeleton() { /* ... */ }
export function ReflectionCardSkeleton() { /* ... */ }
export function ChatMessageSkeleton() { /* ... */ }
export function DashboardSkeleton() { /* ... */ }
```

### 4.3 Error States

**Comprehensive Error Handling:**
```tsx
// client/src/components/ErrorStates.tsx
export function ErrorState({ 
  title, 
  message, 
  retry 
}: { 
  title: string; 
  message: string; 
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 text-center max-w-md mb-4">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Use in pages:
{isError ? (
  <ErrorState 
    title="Failed to load tasks"
    message="We couldn't fetch your tasks. Check your connection and try again."
    retry={() => refetch()}
  />
) : (
  <TaskList tasks={tasks} />
)}
```

---

## 5. EMPTY STATES

**Every list/collection needs an empty state:**

```tsx
// client/src/components/empty-states/EmptyTaskList.tsx
export function EmptyTaskList({ onAddTask, mode }: Props) {
  const messages = {
    build: {
      title: "No tasks in Build mode",
      description: "Start your sprint by creating high-energy tasks that drive progress.",
      icon: Rocket,
    },
    flow: {
      title: "Ready to focus",
      description: "Add tasks to enter deep work mode and maintain your flow state.",
      icon: Zap,
    },
    restore: {
      title: "Time to recharge",
      description: "Add gentle tasks or take a moment to reflect on your journey.",
      icon: Heart,
    },
  };
  
  const { title, description, icon: Icon } = messages[mode];
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon className="w-16 h-16 text-neutral-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-neutral-500 text-center max-w-md mb-6">{description}</p>
      <Button onClick={onAddTask} size="lg">
        <Plus className="mr-2" />
        Create Task
      </Button>
    </div>
  );
}
```

**Other Empty States Needed:**
- Empty chat history
- No reflections yet
- No completed tasks (in stats)
- No focus sessions recorded

---

## 6. ANIMATION & MICRO-INTERACTIONS

### 6.1 Tasteful Animations

**Current:** Framer Motion page transitions (good start)

**Add:**

**1. Task Completion Animation:**
```tsx
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

function TaskCard({ task, onComplete }: Props) {
  const handleComplete = () => {
    // Confetti on completion (Build mode only)
    if (mode === 'build') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    
    onComplete(task.id);
  };
  
  return (
    <motion.div
      layout // Smooth position changes
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      {/* Task content */}
    </motion.div>
  );
}
```

**2. Mode Transition Animation:**
```tsx
// Smooth color theme transition
<motion.div
  animate={{
    backgroundColor: getModeColor(mode),
  }}
  transition={{ duration: 0.8, ease: 'easeInOut' }}
>
  {/* Dashboard */}
</motion.div>
```

**3. Energy Slider Glow:**
```tsx
<Slider
  value={[energy]}
  onValueChange={([value]) => setEnergy(value)}
  className={cn(
    'transition-all',
    energy > 70 && 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
    energy < 30 && 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
  )}
/>
```

### 6.2 Respect User Preferences

```tsx
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const motionProps = prefersReducedMotion
  ? {}
  : {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    };

<motion.div {...motionProps}>
  {/* Content */}
</motion.div>
```

---

## 7. DESIGN SYSTEM DOCUMENTATION

### 7.1 Create Design Tokens

```typescript
// client/src/lib/design-tokens.ts
export const colors = {
  // Brand
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    // ...
    600: '#9F7AEA', // Main purple
    900: '#4c1d95',
  },
  
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Neutral
  background: '#0a0a0a',
  surface: '#171717',
  surfaceHover: '#262626',
  border: '#404040',
  text: {
    primary: '#ffffff',
    secondary: '#a3a3a3',
    muted: '#737373',
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Cal Sans', 'Inter', 'sans-serif'],
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  // Use Tailwind's scale: 0.25rem increments
};

export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};
```

### 7.2 Component Library Documentation

**Create Storybook (optional but recommended):**
```bash
npx sb init
```

**Or document in markdown:**
```markdown
# Button Component

## Usage
\`\`\`tsx
<Button variant="default" size="lg">
  Click me
</Button>
\`\`\`

## Variants
- default: Primary purple button
- outline: Border-only
- ghost: No background
- destructive: Red for dangerous actions

## Sizes
- sm: 32px height
- md: 40px height (default)
- lg: 48px height

## States
- disabled
- loading (shows spinner)
```

---

## 8. PRODUCTION CHECKLIST

### Pre-Launch UI/UX Requirements

- [ ] **All placeholder content replaced**
  - [ ] Landing page icons
  - [ ] "Forgot password" works
  - [ ] No `[Placeholder]` text anywhere

- [ ] **Loading states everywhere**
  - [ ] Tasks loading
  - [ ] Form submissions
  - [ ] AI responses
  - [ ] Page transitions

- [ ] **Error states everywhere**
  - [ ] Network failures
  - [ ] 404 pages
  - [ ] Form validation errors
  - [ ] API errors

- [ ] **Empty states for all lists**
  - [ ] No tasks
  - [ ] No reflections
  - [ ] No chat history
  - [ ] No focus sessions

- [ ] **Accessibility (WCAG AA)**
  - [ ] Lighthouse accessibility score >90
  - [ ] All images have alt text
  - [ ] All buttons have labels
  - [ ] Keyboard navigation works
  - [ ] Screen reader tested
  - [ ] Color contrast passes (4.5:1)

- [ ] **Mobile optimization**
  - [ ] All touch targets >44x44px
  - [ ] Works on iPhone 12 Mini (375px)
  - [ ] Works on iPad (768px)
  - [ ] Tested on real devices
  - [ ] Safe area insets respected

- [ ] **Micro-interactions**
  - [ ] Hover states on all interactive elements
  - [ ] Focus indicators visible
  - [ ] Transitions smooth
  - [ ] Animations respect prefers-reduced-motion

- [ ] **Design consistency**
  - [ ] All colors from design tokens
  - [ ] Typography follows system
  - [ ] Spacing consistent
  - [ ] Border radius consistent
  - [ ] Shadows consistent

- [ ] **Browser testing**
  - [ ] Chrome/Edge (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Mobile Safari (iOS)
  - [ ] Chrome Mobile (Android)

---

## 9. EFFORT ESTIMATION

| Area | Estimated Hours | Priority |
|------|----------------|----------|
| Landing page improvements | 8h | P0 |
| Auth forms (validation, loading) | 12h | P0 |
| Dashboard loading/empty states | 8h | P0 |
| Task component polish | 10h | P1 |
| Restore mode completion | 16h | P1 |
| Accessibility fixes | 16h | P0 |
| Mobile optimization | 12h | P1 |
| Animation & interactions | 12h | P2 |
| Design system documentation | 8h | P2 |
| Error boundaries & states | 10h | P0 |
| Empty states library | 6h | P1 |
| Testing on real devices | 8h | P1 |

**Total:** ~126 hours (~3-4 weeks)

**With Claude Code assistance:** ~60-80 hours (~2-3 weeks)

---

## 10. IMMEDIATE NEXT STEPS

**Week 1: Critical UI Fixes**
1. Replace all placeholder content (4h)
2. Add loading states to forms (6h)
3. Implement error boundaries (4h)
4. Add empty states (6h)
5. Fix accessibility issues (8h)

**Week 2: Mobile & Polish**
1. Mobile touch targets (4h)
2. Responsive testing (6h)
3. Animation polish (8h)
4. Design consistency pass (6h)

**Week 3: Restore Mode & Testing**
1. Complete Restore mode (16h)
2. Real device testing (8h)
3. Browser compatibility (4h)

**Week 4: Documentation & Final Polish**
1. Design system docs (6h)
2. Component library (6h)
3. Final QA pass (8h)

---

**Outcome:** Portfolio-quality UI that impresses technical hiring managers and delights users.


