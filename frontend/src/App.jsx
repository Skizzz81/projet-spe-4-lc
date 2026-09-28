import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { CreateDocumentModal } from './components/documents/CreateDocumentModal.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { DocumentPage } from './pages/DocumentPage.jsx';
import { documents as initialDocuments } from './mocks/documents.js';

export function App() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  function createDocument(title) {
    const newDocument = {
      id: crypto.randomUUID(),
      title,
      content: '',
      updatedAt: "À l'instant",
      access: 'Propriétaire',
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
    setIsCreateModalOpen(false);
  }

  function updateDocumentContent(documentId, content) {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId ? { ...document, content } : document,
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
                <DashboardPage documents={documents} />
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
