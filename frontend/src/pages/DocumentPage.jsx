import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DocumentEditor } from '../components/editor/DocumentEditor.jsx';

export function DocumentPage({ documents, onContentChange, onDelete, onInvite }) {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
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

  async function handleInvite(event) {
    event.preventDefault();
    setInviteMessage('');
    setInviteError('');
    setIsInviting(true);

    try {
      const data = await onInvite(document.id, inviteEmail);
      setInviteMessage(data.message);
      setInviteEmail('');
    } catch (error) {
      setInviteError(error.message);
    } finally {
      setIsInviting(false);
    }
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

      {isOwner && (
        <section className="invite-section">
          <h2>Inviter une personne</h2>
          <form className="invite-form" onSubmit={handleInvite}>
            <label htmlFor="invite-email">Adresse email</label>
            <div>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="utilisateur@exemple.com"
                required
              />
              <button className="primary-button" type="submit" disabled={isInviting}>
                {isInviting ? 'Invitation…' : 'Inviter'}
              </button>
            </div>
          </form>

          <div aria-live="polite">
            {inviteMessage && <p className="invite-success">{inviteMessage}</p>}
            {inviteError && <p className="invite-error">{inviteError}</p>}
          </div>
        </section>
      )}

      <DocumentEditor
        content={document.content}
        onChange={(content) => onContentChange(document.id, content)}
        readOnly={!canEdit}
      />
    </main>
  );
}
