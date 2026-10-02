import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { CreateDocumentModal } from './components/documents/CreateDocumentModal.jsx';
import { Header } from './components/layout/Header.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useDocuments } from './hooks/useDocuments.js';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DocumentPage } from './pages/DocumentPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { TwoFactorVerifyPage } from './pages/TwoFactorVerifyPage.jsx';

const AUTH_VIEWS = {
  LOGIN: 'login',
  REGISTER: 'register',
  TWO_FACTOR: 'two-factor',
};

function AuthenticationGate({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState(AUTH_VIEWS.LOGIN);

  if (isLoading) {
    return <p>Chargement…</p>;
  }

  if (isAuthenticated) {
    // La double authentification est optionnelle : elle s'active / se desactive
    // depuis la page profil. On ne force plus sa configuration a l'entree.
    return children;
  }

  if (view === AUTH_VIEWS.REGISTER) {
    return (
      <RegisterPage
        onSuccess={() => setView(AUTH_VIEWS.LOGIN)}
        onNavigateToLogin={() => setView(AUTH_VIEWS.LOGIN)}
      />
    );
  }

  if (view === AUTH_VIEWS.TWO_FACTOR) {
    return (
      <TwoFactorVerifyPage
        onVerified={() => {
          setView(AUTH_VIEWS.LOGIN);
          navigate('/', { replace: true });
        }}
      />
    );
  }

  return (
    <LoginPage
      onNavigateToRegister={() => setView(AUTH_VIEWS.REGISTER)}
      onTwoFactorRequired={() => setView(AUTH_VIEWS.TWO_FACTOR)}
    />
  );
}

function WorkspaceApp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    documents,
    createDocument,
    updateDocumentContent,
    deleteDocument,
    inviteDocumentMember,
    applyRemoteDocumentContent,
  } = useDocuments();
  const ownedDocuments = documents.filter((document) => document.access === 'owner');
  const sharedDocuments = documents.filter((document) => document.access !== 'owner');

  async function handleCreateDocument(title) {
    await createDocument(title);
    setIsCreateModalOpen(false);
    navigate('/');
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app-shell">
              <Sidebar onCreateDocument={() => setIsCreateModalOpen(true)} />

              <div className="workspace">
                <Header />
                <DashboardPage
                  documents={ownedDocuments}
                  title="Mes documents"
                  description="Retrouve ici les documents dont tu es propriétaire."
                  sectionTitle="Tous les documents"
                />
              </div>
            </div>
          }
        />
        <Route
          path="/shared"
          element={
            <div className="app-shell">
              <Sidebar onCreateDocument={() => setIsCreateModalOpen(true)} />

              <div className="workspace">
                <Header />
                <DashboardPage
                  documents={sharedDocuments}
                  title="Partagés avec moi"
                  description="Retrouve ici les documents sur lesquels tu as été invité."
                  sectionTitle="Documents partagés"
                />
              </div>
            </div>
          }
        />
        <Route
          path="/documents/:documentId"
          element={
            <DocumentPage
              documents={documents}
              onContentChange={updateDocumentContent}
              onDelete={deleteDocument}
              onInvite={inviteDocumentMember}
              onRemoteContent={applyRemoteDocumentContent}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            user?.role === 'admin' ? (
              <div className="app-shell">
                <Sidebar onCreateDocument={() => setIsCreateModalOpen(true)} />
                <div className="workspace">
                  <Header />
                  <AdminPage />
                </div>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>

      {isCreateModalOpen && (
        <CreateDocumentModal
          onCancel={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateDocument}
        />
      )}
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AuthenticationGate>
        <WorkspaceApp />
      </AuthenticationGate>
    </AuthProvider>
  );
}
