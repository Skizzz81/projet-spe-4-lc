import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const navigationItems = [
  { label: 'Mes documents', symbol: '▤', to: '/' },
  { label: 'Partagés avec moi', symbol: '♧', to: '/shared' },
];

export function Sidebar({ onCreateDocument, onUploadFile, onCreateFolder }) {
  const { user } = useAuth();
  const items = user?.role === 'admin'
    ? [...navigationItems, { label: 'Administration', symbol: '⚙', to: '/admin' }]
    : navigationItems;

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

      {onCreateFolder && (
        <button
          className="new-folder-button"
          type="button"
          onClick={onCreateFolder}
        >
          <span aria-hidden="true">+</span>
          Nouveau dossier
        </button>
      )}

      {onUploadFile && (
        <label className="upload-document-button">
          <span aria-hidden="true">⭳</span>
          Importer un fichier
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/gif,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUploadFile(file);
              event.target.value = '';
            }}
          />
        </label>
      )}

      <nav className="sidebar-navigation" aria-label="Navigation principale">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `navigation-item${isActive ? ' active' : ''}`
            }
            end={item.to === '/'}
            key={item.label}
            to={item.to}
          >
            <span className="navigation-symbol" aria-hidden="true">
              {item.symbol}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
