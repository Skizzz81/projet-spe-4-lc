import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { TwoFactorVerifyPage } from './pages/TwoFactorVerifyPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { socket } from './lib/socket.js';
import { Login } from './components/Login.jsx';
import { Room } from './components/Room.jsx';


// Vues gérées à la main en attendant l'ajout de react-router-dom.
const VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  TWO_FACTOR: 'two-factor',
};

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState(VIEWS.LOGIN);

  if (isLoading) {
    return <p>Chargement…</p>;
  }

  if (isAuthenticated) {
    return <ProfilePage />;
  }

  if (view === VIEWS.REGISTER) {
    return (
      <RegisterPage
        onSuccess={() => setView(VIEWS.LOGIN)}
        onNavigateToLogin={() => setView(VIEWS.LOGIN)}
      />
    );
  }

  if (view === VIEWS.TWO_FACTOR) {
    return <TwoFactorVerifyPage onVerified={() => setView(VIEWS.LOGIN)} />;
  }

  return (
    <LoginPage
      onNavigateToRegister={() => setView(VIEWS.REGISTER)}
      onTwoFactorRequired={() => setView(VIEWS.TWO_FACTOR)}
    />
  );
}

export function App() {
    const [pseudo, setPseudo] = useState(null);

  function handleJoin(nom) {
    socket.connect();
    socket.emit('join', nom);
    setPseudo(nom);
  }

  if (!pseudo) {
    return <Login onJoin={handleJoin} />;
  }
  return (
    <main>
      <h1>Projet Spé 4</h1>
      <AuthProvider>
        <AuthenticatedApp />
         <Room pseudo={pseudo} />
      </AuthProvider>
      
    </main>
  );
}
