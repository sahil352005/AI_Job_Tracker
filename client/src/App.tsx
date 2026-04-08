import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './store/AuthContext';
import AuthPage from './pages/AuthPage';
import KanbanPage from './pages/KanbanPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function AppContent() {
  const { token } = useAuth();
  return token ? <KanbanPage /> : <AuthPage />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
