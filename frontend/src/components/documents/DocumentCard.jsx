import { useRef, useState } from 'react';
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

export function DocumentCard({ document, onDelete, onReplaceFile }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const replacementInputRef = useRef(null);
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
  const displayTitle = isFile ? document.fileName || document.title : document.title;
  const canDelete = document.access === 'owner' && Boolean(onDelete);
  const canReplace =
    isFile && ['owner', 'editor'].includes(document.access) && Boolean(onReplaceFile);

  async function handleDeleteDocument() {
    const isConfirmed = window.confirm(
      `Voulez-vous vraiment supprimer « ${displayTitle} » ?`,
    );

    if (!isConfirmed) return;

    setIsDeleting(true);

    try {
      await onDelete(document.id);
    } catch (error) {
      window.alert(error.message);
      setIsDeleting(false);
    }
  }

  async function handleReplaceFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const isConfirmed = window.confirm(
      `Remplacer « ${displayTitle} » par « ${file.name} » ?`,
    );

    if (!isConfirmed) return;

    setIsReplacing(true);

    try {
      await onReplaceFile(document.id, file);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setIsReplacing(false);
    }
  }

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
        <span className="document-title">{displayTitle}</span>
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

  const card = isFile ? (
    <a
      className="document-card"
      href={documentApi.fileUrl(document.id)}
      target="_blank"
      rel="noreferrer"
    >
      {content}
    </a>
  ) : (
    <Link className="document-card" to={`/documents/${document.id}`}>
      {content}
    </Link>
  );

  return (
    <div className="document-card-wrapper">
      {card}

      {canReplace && (
        <>
          <button
            className={`document-replace-button${canDelete ? '' : ' only-action'}`}
            type="button"
            aria-label={`Remplacer ${displayTitle}`}
            title="Remplacer le fichier"
            disabled={isReplacing}
            onClick={() => replacementInputRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 12a8 8 0 1 1-2.34-5.66L20 8" />
              <path d="M20 3v5h-5" />
            </svg>
          </button>
          <input
            ref={replacementInputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/gif,image/webp"
            hidden
            onChange={handleReplaceFile}
          />
        </>
      )}

      {canDelete && (
        <button
          className="document-delete-button"
          type="button"
          aria-label={`Supprimer ${displayTitle}`}
          title="Supprimer le document"
          disabled={isDeleting}
          onClick={handleDeleteDocument}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
