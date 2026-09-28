export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button
          className="profile-button"
          type="button"
          aria-label="Ouvrir le profil"
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
