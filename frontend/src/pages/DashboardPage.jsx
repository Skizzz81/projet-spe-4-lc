import { DocumentCard } from '../components/documents/DocumentCard.jsx';

export function DashboardPage({ documents }) {
  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <h1>Mes documents</h1>
          <p className="page-description">
            Retrouve ici les documents que tu as créés ou modifiés récemment.
          </p>
        </div>

        <span className="document-count">
          {documents.length} document{documents.length > 1 ? 's' : ''}
        </span>
      </div>

      <section className="documents-section" aria-labelledby="documents-title">
        <h2 id="documents-title">Tous les documents</h2>

        <div className="documents-grid">
          {documents.map((document) => (
            <DocumentCard document={document} key={document.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
