export function DocumentEditor({ content = '', onChange }) {
  return (
    <div className="document-editor">
      <textarea
        className="document-editor-textarea"
        value={content}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Commencez à écrire votre document…"
        aria-label="Contenu du document"
      />
    </div>
  );
}
