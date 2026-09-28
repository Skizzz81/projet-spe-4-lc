import { useState } from 'react';

export function CreateDocumentModal({ onCancel, onCreate }) {
  const [title, setTitle] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    onCreate(trimmedTitle);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-document-title"
      >
        <div className="modal-heading">
          <div>
            <h2 id="create-document-title">Nouveau document</h2>
            <p>Choisis un titre pour commencer.</p>
          </div>

          <button
            className="modal-close-button"
            type="button"
            aria-label="Fermer"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Titre du document</span>
            <input
              autoFocus
              maxLength="120"
              placeholder="Exemple : Compte rendu de réunion"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onCancel}
            >
              Annuler
            </button>
            <button
              className="primary-button"
              type="submit"
              disabled={!title.trim()}
            >
              Créer le document
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
