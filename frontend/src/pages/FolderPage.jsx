import { Navigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { DashboardPage } from './DashboardPage.jsx';

export function FolderPage({
  folders,
  documents,
  isLoadingFolders,
  onCreateDocument,
  onUploadFile,
}) {
  const { folderId } = useParams();
  const currentFolderId = Number(folderId);
  const currentFolder = folders.find((folder) => folder.id === currentFolderId);

  if (isLoadingFolders) {
    return <p>Chargement du dossier…</p>;
  }

  if (!currentFolder) {
    return <Navigate to="/" replace />;
  }

  const folderDocuments = documents.filter(
    (document) =>
      document.access === 'owner' && document.folderId === currentFolderId,
  );

  return (
    <div className="app-shell">
      <Sidebar
        onCreateDocument={() => onCreateDocument(currentFolderId)}
        onUploadFile={(file) => onUploadFile(file, currentFolderId)}
      />

      <div className="workspace">
        <Header />
        <DashboardPage
          backTo="/"
          documents={folderDocuments}
          title={currentFolder.name}
          description="Documents contenus dans ce dossier."
          sectionTitle="Documents"
        />
      </div>
    </div>
  );
}
