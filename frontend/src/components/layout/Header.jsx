import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initials = (user?.nom ?? user?.email ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button
          className="profile-button"
          type="button"
          aria-label="Ouvrir le profil"
          onClick={() => navigate('/profile')}
        >
          <span className="profile-avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="profile-name">Mon profil</span>
        </button>
      </div>
    </header>
  );
}
