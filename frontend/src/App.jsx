import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Room } from './components/Room.jsx';
import { CreateDocumentModal } from './components/documents/CreateDocumentModal.jsx';
import { CreateFolderModal } from './components/folders/CreateFolderModal.jsx';
import { Header } from './components/layout/Header.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { TwoFactorSetup } from './components/TwoFactorSetup.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useDocuments } from './hooks/useDocuments.js';
import { useFolders } from './hooks/useFolders.js';
import { socket } from './lib/socket.js';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DocumentPage } from './pages/DocumentPage.jsx';
import { FolderPage } from './pages/FolderPage.jsx';
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState(AUTH_VIEWS.LOGIN);

  if (isLoading) {
    return <p>Chargement…</p>;
  }

  if (isAuthenticated) {
    if (!user?.two_factor_enabled) {
      return (
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-head">
              <h2>Sécurise ton compte</h2>
              <p className="auth-subtitle">
                Active la double authentification pour accéder à tes documents.
              </p>
            </div>
            <TwoFactorSetup isEnabled={false} />
          </div>
        </div>
      );
    }

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
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [documentFolderId, setDocumentFolderId] = useState(null);
  const {
    documents,
    createDocument,
    updateDocumentContent,
    deleteDocument,
    inviteDocumentMember,
    applyRemoteDocumentContent,
  } = useDocuments();
  const { folders, isLoadingFolders, createFolder } = useFolders();
  const ownedDocuments = documents.filter((document) => document.access === 'owner');
  const rootDocuments = ownedDocuments.filter((document) => document.folderId === null);
  const sharedDocuments = documents.filter((document) => document.access !== 'owner');

  async function handleCreateDocument(title) {
    await createDocument(title, documentFolderId);
    setIsCreateModalOpen(false);
    navigate(documentFolderId ? `/folders/${documentFolderId}` : '/');
  }

  async function handleCreateFolder(name) {
    await createFolder(name);
    setIsCreateFolderModalOpen(false);
  }

  function openCreateDocument(folderId = null) {
    setDocumentFolderId(folderId);
    setIsCreateModalOpen(true);
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app-shell">
              <Sidebar
                onCreateDocument={() => openCreateDocument()}
                onCreateFolder={() => setIsCreateFolderModalOpen(true)}
              />

              <div className="workspace">
                <Header />
                <DashboardPage
                  documents={rootDocuments}
                  folders={folders}
                  title="Mes documents"
                  description="Retrouve ici les documents dont tu es propriétaire."
                  sectionTitle="Tous les documents"
                  showFolders
                />
              </div>
            </div>
          }
        />
        <Route
          path="/shared"
          element={
            <div className="app-shell">
              <Sidebar onCreateDocument={() => openCreateDocument()} />

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
          path="/folders/:folderId"
          element={
            <FolderPage
              documents={documents}
              folders={folders}
              isLoadingFolders={isLoadingFolders}
              onCreateDocument={openCreateDocument}
            />
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
                <Sidebar onCreateDocument={() => openCreateDocument()} />
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
        <Route path="/room" element={<RealtimeRoomPage />} />
      </Routes>

      {isCreateModalOpen && (
        <CreateDocumentModal
          onCancel={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateDocument}
        />
      )}

      {isCreateFolderModalOpen && (
        <CreateFolderModal
          onCancel={() => setIsCreateFolderModalOpen(false)}
          onCreate={handleCreateFolder}
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
