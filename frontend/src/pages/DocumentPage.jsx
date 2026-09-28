import { Link, useParams } from 'react-router-dom';
import { DocumentEditor } from '../components/editor/DocumentEditor.jsx';

export function DocumentPage({ documents, onContentChange }) {
  const { documentId } = useParams();
  const document = documents.find((item) => String(item.id) === documentId);

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

  return (
    <main className="document-page">
      <Link className="document-back-link" to="/">
        ← Retour aux documents
      </Link>

      <header className="document-page-header">
        <p className="document-page-label">Document</p>
        <h1>{document.title}</h1>
      </header>

      <DocumentEditor
        content={document.content}
        onChange={(content) => onContentChange(document.id, content)}
      />
    </main>
  );
}
