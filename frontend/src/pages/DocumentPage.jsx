import { Link, useNavigate, useParams } from 'react-router-dom';
import { DocumentEditor } from '../components/editor/DocumentEditor.jsx';

export function DocumentPage({ documents, onContentChange, onDelete }) {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const document = documents.find((item) => String(item.id) === documentId);

  async function handleDelete() {
    const isConfirmed = window.confirm(
      `Voulez-vous vraiment supprimer « ${document.title} » ?`,
    );

    if (!isConfirmed) {
      return;
    }

    await onDelete(document.id);
    navigate('/');
  }

  if (!document) {
    return (
      <main className="document-page">
        <Link className="document-back-link" to="/">
          ← Retour aux documents
        </Link>

        <header className="document-page-header">
          <p className="document-page-label">Erreur</p>
          <h1>Document introuvable</h1>
        </header>
      </main>
    );
  }

  const isOwner = document.access === 'owner';
  const canEdit = isOwner || document.access === 'editor';
  const backPath = isOwner ? '/' : '/shared';

  return (
    <main className="document-page">
      <Link className="document-back-link" to={backPath}>
        ← Retour aux documents
      </Link>

      <header className="document-page-header">
        <div>
          <p className="document-page-label">Document</p>
          <h1>{document.title}</h1>
        </div>

        {isOwner && (
          <button className="danger-button" type="button" onClick={handleDelete}>
            Supprimer
          </button>
        )}
      </header>

      {!canEdit && <p>Tu disposes d’un accès en lecture seule.</p>}

      <DocumentEditor
        content={document.content}
        onChange={(content) => onContentChange(document.id, content)}
        readOnly={!canEdit}
      />
    </main>
  );
}
