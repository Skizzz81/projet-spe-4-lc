import { useState } from 'react';

export function CreateFolderModal({ onCancel, onCreate }) {
  const [name, setName] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName) {
      onCreate(trimmedName);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-folder-title"
      >
        <div className="modal-heading">
          <div>
            <h2 id="create-folder-title">Nouveau dossier</h2>
            <p>Choisis un nom pour le dossier.</p>
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
            <span>Nom du dossier</span>
            <input
              autoFocus
              maxLength="255"
              placeholder="Exemple : Cours"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>
              Annuler
            </button>
            <button className="primary-button" type="submit" disabled={!name.trim()}>
              Créer le dossier
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
