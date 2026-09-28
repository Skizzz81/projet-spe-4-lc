import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
import { CreateDocumentModal } from './components/documents/CreateDocumentModal.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { documents as initialDocuments } from './mocks/documents.js';

export function App() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  function createDocument(title) {
    const newDocument = {
      id: crypto.randomUUID(),
      title,
      updatedAt: "À l'instant",
      access: 'Propriétaire',
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
    setIsCreateModalOpen(false);
  }

  return (
    <div className="app-shell">
      <Sidebar onCreateDocument={() => setIsCreateModalOpen(true)} />

      <div className="workspace">
        <Header />
        <DashboardPage documents={documents} />
      </div>

      {isCreateModalOpen && (
        <CreateDocumentModal
          onCancel={() => setIsCreateModalOpen(false)}
          onCreate={createDocument}
        />
      )}
    </div>
  );
}
