# Development Guide - Hugamara Hospitality App

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server
```bash
npm start
```

## 🏗 Project Architecture

### Component Structure
- **Function-based components only** (ES6 arrow functions)
- **No class components**
- **Custom hooks** for reusable logic
- **Props destructuring** for clean code

### State Management
- **Redux Toolkit** for global state
- **Local state** with useState for component-specific data
- **Context API** for theme/auth if needed

### Styling Approach
- **Tailwind CSS** for utility classes
- **Custom CSS variables** for consistent theming
- **Dark theme** with shadows (no gradients)
- **Responsive design** for all devices

## 📝 Coding Standards

### JavaScript/React
```javascript
// ✅ Good - Function component with destructuring
const UserCard = ({ user, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
    onEdit(user);
  };
  
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
};

// ❌ Bad - Class component
class UserCard extends Component {
  // Don't use classes
}
```

### CSS Classes
```css
/* ✅ Good - Use CSS variables and shadows */
.card {
  background-color: var(--secondary-bg);
  box-shadow: var(--shadow-medium);
}

/* ❌ Bad - No gradients */
.card {
  background: linear-gradient(to right, #000, #fff);
}
```

## 🔐 Authentication Flow

### Login Process
1. User enters credentials and selects outlet
2. API call to `/auth/login`
3. JWT token stored in localStorage
4. User redirected to dashboard
5. Token included in all subsequent API calls

### Route Protection
- `PrivateRoute` component wraps protected routes
- Checks authentication state from Redux
- Redirects to login if not authenticated
- Respects user role and outlet permissions

## 🏢 Multi-Outlet System

### Outlet Management
- **Outlet switching** for admin users
- **Outlet-scoped data** by default
- **Cross-outlet visibility** for HQ users
- **Outlet-specific settings** and configurations

### Data Isolation
- All API calls include outlet context
- Database queries filtered by outlet_id
- User permissions respect outlet boundaries
- Audit trails include outlet information

## 📊 Dashboard Types

### Role-Based Views
1. **Executive (HQ)** - Cross-outlet metrics
2. **Outlet Manager** - Single outlet operations
3. **Supervisor** - Shift operations
4. **Staff** - Task management

### Real-Time Updates
- WebSocket connections for live data
- Polling fallback for critical metrics
- Optimistic updates for better UX
- Error handling and retry logic

## 🧪 Testing Strategy

### Unit Tests
- **Jest** for test runner
- **React Testing Library** for components
- **Mock services** for API calls
- **Snapshot testing** for UI consistency

### Test Structure
```javascript
// Component test example
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Dashboard from './Dashboard';

test('renders dashboard title', () => {
  render(
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
  
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});
```

## 🔌 API Integration

### Service Layer
- **Axios** for HTTP requests
- **Interceptors** for auth and error handling
- **Request/response transformers**
- **Retry logic** for failed requests

### Error Handling
```javascript
// Service error handling
try {
  const response = await api.get('/reservations');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
    dispatch(logout());
  }
  throw error;
}
```

## 🎨 UI/UX Guidelines

### Design System
- **Consistent spacing** (4px grid system)
- **Typography scale** (Inter font family)
- **Color palette** (dark theme)
- **Component library** (reusable components)

### Accessibility
- **Semantic HTML** structure
- **ARIA labels** for complex components
- **Keyboard navigation** support
- **Screen reader** compatibility

## 🚀 Performance

### Optimization
- **Code splitting** with React.lazy
- **Memoization** for expensive calculations
- **Virtual scrolling** for large lists
- **Image optimization** and lazy loading

### Monitoring
- **Bundle size** analysis
- **Performance metrics** tracking
- **Error reporting** and monitoring
- **User experience** metrics

## 🔧 Development Tools

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **Lint-staged** for staged files only

### Debugging
- **React DevTools** for component inspection
- **Redux DevTools** for state management
- **Browser DevTools** for performance
- **Console logging** for development

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Best Practices
- [React Patterns](https://reactpatterns.com/)
- [Performance Tips](https://reactjs.org/docs/optimizing-performance.html)
- [Security Guidelines](https://reactjs.org/docs/security.html)

---

**Happy Coding! 🎉**