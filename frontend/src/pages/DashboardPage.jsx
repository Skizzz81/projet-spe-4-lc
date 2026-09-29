import { DocumentCard } from '../components/documents/DocumentCard.jsx';

export function DashboardPage({ documents, title, description, sectionTitle }) {
  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>

        <span className="document-count">
          {documents.length} document{documents.length > 1 ? 's' : ''}
        </span>
      </div>

      <section className="documents-section" aria-labelledby="documents-title">
        <h2 id="documents-title">{sectionTitle}</h2>

        {documents.length === 0 && <p>Aucun document pour le moment.</p>}

        <div className="documents-grid">
          {documents.map((document) => (
            <DocumentCard document={document} key={document.id} />
          ))}
        </div>
      </section>
    </main>
  );
}
