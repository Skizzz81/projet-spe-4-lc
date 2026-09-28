const navigationItems = [
  { label: 'Mes documents', symbol: '▤', active: true },
  { label: 'Partagés avec moi', symbol: '♧' },
];

export function Sidebar({ onCreateDocument }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          P4
        </span>
        <span className="brand-name">Projet Spé 4</span>
      </div>

      <button
        className="new-document-button"
        type="button"
        onClick={onCreateDocument}
      >
        <span aria-hidden="true">+</span>
        Nouveau document
      </button>

      <nav className="sidebar-navigation" aria-label="Navigation principale">
        {navigationItems.map((item) => (
          <button
            className={`navigation-item${item.active ? ' active' : ''}`}
            type="button"
            key={item.label}
          >
            <span className="navigation-symbol" aria-hidden="true">
              {item.symbol}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
