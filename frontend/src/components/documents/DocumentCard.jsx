import { Link } from 'react-router-dom';

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
  return (
    <Link className="document-card" to={`/documents/${document.id}`}>
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
        <span className="document-metadata">
          <span>{document.updatedAt}</span>
          <span aria-hidden="true">•</span>
          <span>{document.access}</span>
        </span>
      </span>
    </Link>
  );
}
