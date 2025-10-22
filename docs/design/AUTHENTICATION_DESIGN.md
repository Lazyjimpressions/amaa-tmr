# Modal-First Authentication Design

**Date:** 2025-10-22  
**Status:** Design Analysis & Troubleshooting  
**Purpose:** Top-down design for modal-first authentication in React applications

## Best Practice Architecture

### 1. Authentication Context Pattern
```javascript
// AuthContext.js - Centralized authentication state
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // Check localStorage for token
    // Validate token with backend
    // Set authentication state
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Protected Route Component
```javascript
// ProtectedRoute.js - Route-level authentication guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true);
    }
  }, [isAuthenticated, loading]);

  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return (
      <>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        <div style={{ display: 'none' }}>{children}</div>
      </>
    );
  }

  return children;
};
```

### 3. Modal-First Authentication Flow
```javascript
// App.js - Main application structure
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/survey" element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
```

## Current Implementation Analysis

### File Structure
```
wp-content/themes/amaa-tmr/assets/js/
├── survey-island.js          # Main survey component with auth logic
├── header-login.js          # Header login modal
└── components/
    └── LoginModal.tsx       # Reusable modal component (not used)
```

### Current Issues Identified

#### 1. **No Authentication Context**
- **Problem**: Authentication state is managed locally in each component
- **Impact**: State not shared between components, inconsistent auth checks
- **Best Practice**: Use React Context for global authentication state

#### 2. **Mixed Component Patterns**
- **Problem**: Using both React.createElement and JSX patterns
- **Impact**: Inconsistent component structure, potential rendering issues
- **Best Practice**: Consistent component pattern throughout

#### 3. **No Error Boundaries**
- **Problem**: No error handling for authentication failures
- **Impact**: Silent failures, poor user experience
- **Best Practice**: Implement error boundaries and proper error handling

#### 4. **Direct DOM Manipulation**
- **Problem**: Clearing innerHTML before React mounting
- **Impact**: Potential race conditions, React hydration issues
- **Best Practice**: Let React manage DOM updates

#### 5. **Missing Authentication Guards**
- **Problem**: Survey form accessible without authentication
- **Impact**: Security vulnerability, bypassed authentication
- **Best Practice**: Route-level and component-level guards

## Recommended Architecture

### 1. Authentication Context Provider
```javascript
// auth-context.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const checkAuth = async () => {
    const token = localStorage.getItem('supabase_token');
    if (!token) {
      setShowLoginModal(true);
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/functions/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        setUser(await response.json());
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      setShowLoginModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated, showLoginModal, setShowLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Protected Survey Component
```javascript
// survey-protected.js
const ProtectedSurvey = () => {
  const { isAuthenticated, loading, showLoginModal, setShowLoginModal } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="survey-container">
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {isAuthenticated && <SurveyContent />}
    </div>
  );
};
```

### 3. Main Application Structure
```javascript
// survey-island.js
const SurveyApp = () => {
  return (
    <AuthProvider>
      <ProtectedSurvey />
    </AuthProvider>
  );
};

// Mount the app
const surveyContainer = document.getElementById('survey-container');
if (surveyContainer) {
  ReactDOM.render(<SurveyApp />, surveyContainer);
}
```

## Implementation Plan

### Phase 1: Refactor Authentication Context
1. Create `auth-context.js` with centralized authentication state
2. Implement proper error handling and loading states
3. Add authentication guards

### Phase 2: Update Survey Component
1. Refactor `survey-island.js` to use authentication context
2. Remove direct DOM manipulation
3. Implement proper component structure

### Phase 3: Update Header Login
1. Refactor `header-login.js` to use authentication context
2. Ensure consistent modal behavior
3. Add proper error handling

### Phase 4: Testing & Validation
1. Test authentication flow end-to-end
2. Verify modal-first behavior
3. Test error scenarios

## Key Differences from Current Implementation

| Aspect | Current | Recommended |
|--------|---------|-------------|
| **State Management** | Local useState in components | Global AuthContext |
| **Authentication Check** | useEffect in SurveyApp | Centralized in AuthProvider |
| **Modal Management** | Local state in each component | Global state in context |
| **Error Handling** | Basic try/catch | Error boundaries + proper handling |
| **DOM Management** | Direct innerHTML manipulation | React-managed updates |
| **Component Structure** | Mixed patterns | Consistent React patterns |

## Troubleshooting Current Issues

### Issue 1: Authentication Check Not Running
**Root Cause**: useEffect not executing in SurveyApp component
**Solution**: Move authentication logic to AuthProvider context

### Issue 2: Modal Not Appearing
**Root Cause**: Local state management, no global modal state
**Solution**: Centralized modal state in AuthProvider

### Issue 3: Survey Form Accessible Without Auth
**Root Cause**: No authentication guards on survey content
**Solution**: Conditional rendering based on authentication state

### Issue 4: React Components Not Mounting
**Root Cause**: Direct DOM manipulation interfering with React
**Solution**: Let React manage DOM updates, remove innerHTML clearing

## Next Steps

1. **Implement AuthProvider context** with centralized authentication state
2. **Refactor survey-island.js** to use authentication context
3. **Add proper error boundaries** for authentication failures
4. **Test authentication flow** with new architecture
5. **Update header-login.js** to use same authentication context

This design follows React best practices for authentication and should resolve the current issues with modal-first authentication.
