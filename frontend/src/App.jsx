import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Room } from './components/Room.jsx';
import { CreateDocumentModal } from './components/documents/CreateDocumentModal.jsx';
import { Header } from './components/layout/Header.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { socket } from './lib/socket.js';
import { documents as initialDocuments } from './mocks/documents.js';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DocumentPage } from './pages/DocumentPage.jsx';
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
  const [view, setView] = useState(AUTH_VIEWS.LOGIN);

  if (isLoading) {
    return <p>Chargement…</p>;
  }

  if (isAuthenticated) {
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
    return <TwoFactorVerifyPage onVerified={() => setView(AUTH_VIEWS.LOGIN)} />;
  }

  return (
    <LoginPage
      onNavigateToRegister={() => setView(AUTH_VIEWS.REGISTER)}
      onTwoFactorRequired={() => setView(AUTH_VIEWS.TWO_FACTOR)}
    />
  );
}

function RealtimeRoomPage() {
  const { user } = useAuth();
  const pseudo = user?.nom ?? user?.email ?? 'Utilisateur';

  useEffect(() => {
    socket.connect();
    socket.emit('join', pseudo);

    return () => socket.disconnect();
  }, [pseudo]);

  return <Room pseudo={pseudo} />;
}

function WorkspaceApp() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(initialDocuments);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const ownedDocuments = documents.filter((document) => document.access === 'Propriétaire');
  const sharedDocuments = documents.filter((document) => document.access === 'Partagé');

  function createDocument(title) {
    const newDocument = {
      id: crypto.randomUUID(),
      title,
      content: '',
      updatedAt: "À l'instant",
      lastModifiedBy: 'Vous',
      access: 'Propriétaire',
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
    setIsCreateModalOpen(false);
    navigate('/');
  }

  function updateDocumentContent(documentId, content) {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              content,
              updatedAt: "À l'instant",
              lastModifiedBy: 'Vous',
            }
          : document,
      ),
    );
  }

  function deleteDocument(documentId) {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== documentId),
    );
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
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/room" element={<RealtimeRoomPage />} />
      </Routes>

      {isCreateModalOpen && (
        <CreateDocumentModal
          onCancel={() => setIsCreateModalOpen(false)}
          onCreate={createDocument}
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
