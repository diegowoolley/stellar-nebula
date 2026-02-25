import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Artists } from './pages/Artists';
import { Contractors } from './pages/Contractors';
import { AppLayout } from './components/layout/AppLayout';
import { NewEvent } from './pages/NewEvent';
import { Users } from './pages/Users';
import { ExternalRequest } from './pages/PublicEventRequest';
import Profile from './pages/Profile';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Finance } from './pages/Finance';
/**
 * Componente raiz da aplicação.
 * Configura os provedores de contexto (Tema, Autenticação) e as rotas de navegação usando react-router-dom.
 */
function App() {
  return (
    // Provedor de Temas (Claro/Escuro)
    <ThemeProvider>
      {/* Provedor de contexto de Autenticação */}
      <AuthProvider>
        <BrowserRouter>
          {/* Definição das rotas públicas e privadas */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/external-request/:token" element={<ExternalRequest />} />
            {/* Rotas protegidas (necessitam de login), renderizadas dentro do AppLayout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Calendar />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/contractors" element={<Contractors />} />
              <Route path="/users" element={<Users />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/events/new" element={<NewEvent />} />
              <Route path="/events/edit/:id" element={<NewEvent />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
