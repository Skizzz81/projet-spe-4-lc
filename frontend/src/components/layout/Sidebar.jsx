import { NavLink } from 'react-router-dom';

const navigationItems = [
  { label: 'Mes documents', symbol: '▤', to: '/' },
  { label: 'Partagés avec moi', symbol: '♧', to: '/shared' },
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
