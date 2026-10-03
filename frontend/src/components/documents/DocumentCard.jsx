import { Link } from 'react-router-dom';
import * as documentApi from '../../api/documentApi.js';

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 3.5h7l4 4v13h-11z" />
      <path d="M13.5 3.5v4h4" />
      <path d="M9 12h6M9 15.5h6" />
    </svg>
  );
}

export function DocumentCard({ document }) {
  const updatedAt = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(document.updatedAt));
  const accessLabels = {
    owner: 'Propriétaire',
    editor: 'Éditeur',
    viewer: 'Lecture seule',
  };
  const isFile = document.type === 'file';

  const content = (
    <>
      <span className="document-preview" aria-hidden="true">
        <span className="document-preview-icon">
          <DocumentIcon />
        </span>
        <span className="preview-line preview-line-long" />
        <span className="preview-line" />
        <span className="preview-line preview-line-short" />
      </span>

      <span className="document-information">
        <span className="document-title">{document.title}</span>
        {isFile && <span className="document-type-badge">Fichier</span>}
        <span
          className="document-metadata"
          title={`Modifié ${updatedAt} par ${document.lastModifiedBy}`}
        >
          <span>{updatedAt}</span>
          <span aria-hidden="true">•</span>
          <span>par {document.lastModifiedBy}</span>
        </span>
        <span className="document-access">{accessLabels[document.access]}</span>
      </span>
    </>
  );

  // Un fichier s'ouvre directement dans le navigateur (nouvel onglet).
  if (isFile) {
    return (
      <a
        className="document-card"
        href={documentApi.fileUrl(document.id)}
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }

  // Un document texte ouvre son espace d'edition collaborative.
  return (
    <Link className="document-card" to={`/documents/${document.id}`}>
      {content}
    </Link>
  );
}
