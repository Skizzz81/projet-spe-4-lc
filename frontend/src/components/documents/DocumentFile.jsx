import { useEffect, useState } from 'react';
import * as documentApi from '../../api/documentApi.js';

// Affiche un document non textuel (image en apercu, autres en telechargement)
// et permet de le remplacer.
export function DocumentFile({ document, canEdit, onReplace }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const isImage = (document.fileMime ?? '').startsWith('image/');

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    documentApi
      .fetchFileBlob(document.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setError('Impossible de charger le fichier.');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // On recharge apres un remplacement (updatedAt change).
  }, [document.id, document.updatedAt]);

  async function handleReplace(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsReplacing(true);
    try {
      await onReplace(file);
    } finally {
      setIsReplacing(false);
    }
  }

  return (
    <div className="document-file">
      {error && <p className="invite-error">{error}</p>}
      {!error && !url && <p>Chargement du fichier...</p>}

      {url && isImage && (
        <img className="document-file-image" src={url} alt={document.fileName} />
      )}

      {url && !isImage && (
        <div className="document-file-download">
          <p className="document-file-name">{document.fileName}</p>
          <a className="primary-button" href={url} download={document.fileName}>
            Télécharger
          </a>
        </div>
      )}

      {canEdit && (
        <label className="secondary-button document-file-replace">
          {isReplacing ? 'Remplacement...' : 'Remplacer le fichier'}
          <input type="file" hidden onChange={handleReplace} />
        </label>
      )}
    </div>
  );
}
