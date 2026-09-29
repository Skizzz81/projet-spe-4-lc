import { useState } from 'react';

// Donnees bouchon en attendant le branchement au back (fait par un collegue).
// Le back GET /api/auth/profile renvoie : { id, nom, email, role, two_factor_enabled }
const utilisateurBouchon = {
  nom: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  role: 'user',
  two_factor_enabled: true,
};

function getInitiales(nom) {
  const morceaux = nom.trim().split(' ');
  const premiere = morceaux[0]?.[0] ?? '';
  const derniere = morceaux.length > 1 ? morceaux[morceaux.length - 1][0] : '';
  return (premiere + derniere).toUpperCase();
}

export function ProfilePage() {
  const utilisateur = utilisateurBouchon;
  const roleLisible = utilisateur.role === 'admin' ? 'Administrateur' : 'Utilisateur';

  // Etat local juste pour l'affichage, le vrai comportement sera branche plus tard.
  const [doubleAuth, setDoubleAuth] = useState(utilisateur.two_factor_enabled);

  function handleLogout() {
    // TODO: branchement (appel API logout + redirection) a faire par le collegue.
    console.log('Déconnexion demandée');
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Mon profil</h1>
        <p>Gère tes informations personnelles et la sécurité de ton compte.</p>
      </div>

      <div className="profile-card">
        <div className="profile-identity">
          <div className="profile-avatar-lg">{getInitiales(utilisateur.nom)}</div>
          <div>
            <p className="profile-name-lg">{utilisateur.nom}</p>
            <p className="profile-email">{utilisateur.email}</p>
          </div>
          <span className="profile-badge">{roleLisible}</span>
        </div>

        <dl className="profile-info">
          <div className="profile-row">
            <dt>Nom</dt>
            <dd>{utilisateur.nom}</dd>
          </div>
          <div className="profile-row">
            <dt>Email</dt>
            <dd>{utilisateur.email}</dd>
          </div>
          <div className="profile-row">
            <dt>Rôle</dt>
            <dd>{roleLisible}</dd>
          </div>
        </dl>
      </div>

      <div className="profile-card">
        <h2 className="profile-section-title">Sécurité</h2>

        <div className="profile-security">
          <div>
            <p className="profile-security-label">Double authentification</p>
            <p className="profile-security-hint">
              Ajoute une couche de sécurité avec un code à usage unique.
            </p>
          </div>
          <span className={doubleAuth ? 'profile-status on' : 'profile-status off'}>
            {doubleAuth ? 'Activée' : 'Désactivée'}
          </span>
        </div>

        <button type="button" className="auth-secondary" onClick={() => setDoubleAuth((etat) => !etat)}>
          {doubleAuth ? 'Désactiver la double authentification' : 'Activer la double authentification'}
        </button>
      </div>

      <button type="button" className="profile-logout" onClick={handleLogout}>
        Se déconnecter
      </button>
    </div>
  );
}
