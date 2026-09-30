import { Link } from 'react-router-dom';

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 6.5h6l2 2h9v9.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function FolderCard({ folder }) {
  return (
    <Link className="folder-card" to={`/folders/${folder.id}`}>
      <span className="folder-icon">
        <FolderIcon />
      </span>
      <span className="folder-name">{folder.name}</span>
    </Link>
  );
}
