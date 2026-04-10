import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider, useUser } from './context/UserContext';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import Groups from './pages/Groups';
import GroupCalendar from './pages/GroupCalendar';
import GroupStatistics from './pages/GroupStatistics';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      {/* 重定向个人日历和个人统计页面到组管理页面 */}
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Navigate to="/groups" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Navigate to="/groups" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:id/calendar"
        element={
          <ProtectedRoute>
            <GroupCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:id/statistics"
        element={
          <ProtectedRoute>
            <GroupStatistics />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

