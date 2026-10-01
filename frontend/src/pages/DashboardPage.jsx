import { DocumentCard } from '../components/documents/DocumentCard.jsx';
import { FolderCard } from '../components/folders/FolderCard.jsx';
import { Link } from 'react-router-dom';

export function DashboardPage({
  documents,
  folders = [],
  title,
  description,
  sectionTitle,
  showFolders = false,
  backTo,
  onDelete,
  onReplaceFile,
}) {
  return (
    <main className="main-content">
      {backTo && (
        <Link className="folder-back-link" to={backTo}>
          ← Dossier précédent
        </Link>
      )}

      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>

        <span className="document-count">
          {documents.length} document{documents.length > 1 ? 's' : ''}
        </span>
      </div>

      {showFolders && (
        <section className="folders-section" aria-labelledby="folders-title">
          <h2 id="folders-title">Dossiers</h2>

          {folders.length === 0 && <p>Aucun dossier ici.</p>}

          <div className="folders-grid">
            {folders.map((folder) => (
              <FolderCard folder={folder} key={folder.id} />
            ))}
          </div>
        </section>
      )}

      <section className="documents-section" aria-labelledby="documents-title">
        <h2 id="documents-title">{sectionTitle}</h2>

        {documents.length === 0 && <p>Aucun document pour le moment.</p>}

        <div className="documents-grid">
          {documents.map((document) => (
            <DocumentCard
              document={document}
              key={document.id}
              onDelete={onDelete}
              onReplaceFile={onReplaceFile}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
