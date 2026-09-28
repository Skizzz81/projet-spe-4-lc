import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { CreateDocumentModal } from './components/documents/CreateDocumentModal.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DocumentPage } from './pages/DocumentPage.jsx';
import { documents as initialDocuments } from './mocks/documents.js';

export function App() {
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
