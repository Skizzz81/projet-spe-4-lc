import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

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
            AZ
          </span>
          <span className="profile-name">Mon profil</span>
        </button>
      </div>
    </header>
  );
}
