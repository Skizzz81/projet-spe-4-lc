import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

function getInitiales(nom) {
  const morceaux = nom.trim().split(' ');
  const premiere = morceaux[0]?.[0] ?? '';
  const derniere = morceaux.length > 1 ? morceaux[morceaux.length - 1][0] : '';
  return (premiere + derniere).toUpperCase();
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, refreshProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ nom: user?.nom ?? '', email: user?.email ?? '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileMessage, setProfileMessage] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const roleLisible = user?.role === 'admin' ? 'Administrateur' : 'Utilisateur';
  const doubleAuth = Boolean(user?.two_factor_enabled);

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      await authApi.updateProfile(profileForm);
      await refreshProfile();
      setIsEditingProfile(false);
      setProfileMessage('Informations mises à jour.');
    } catch (requestError) {
      setProfileError(requestError.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  function handleCancelProfileEdit() {
    setProfileForm({ nom: user?.nom ?? '', email: user?.email ?? '' });
    setProfileError(null);
    setProfileMessage(null);
    setIsEditingProfile(false);
  }

  async function handleToggleTwoFactor() {
    setError(null);

    if (qrCode) {
      setQrCode(null);
      setCode('');
      return;
    }

    setIsSubmitting(true);
    try {
      if (doubleAuth) {
        await authApi.disable2fa();
        await refreshProfile();
      } else {
        const result = await authApi.setup2fa();
        setQrCode(result.qrCode);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEnableTwoFactor(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.enable2fa({ code });
      setQrCode(null);
      setCode('');
      await refreshProfile();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setError(null);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (requestError) {
      setError(requestError.message);
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="profile-page">
      <button type="button" className="auth-secondary" onClick={() => navigate('/')}>
        Accueil
      </button>
      <div className="profile-header">
        <h1>Mon profil</h1>
        <p>Gère tes informations personnelles et la sécurité de ton compte.</p>
      </div>

      <div className="profile-card">
        <div className="profile-identity">
          <div className="profile-avatar-lg">{getInitiales(user?.nom ?? '')}</div>
          <div>
            <p className="profile-name-lg">{user?.nom}</p>
            <p className="profile-email">{user?.email}</p>
          </div>
          <span className="profile-badge">{roleLisible}</span>
        </div>

        {isEditingProfile ? (
          <form className="auth-form" onSubmit={handleSaveProfile}>
            <div className="auth-field">
              <label htmlFor="profile-name">Nom</label>
              <input
                id="profile-name"
                name="nom"
                value={profileForm.nom}
                onChange={handleProfileChange}
                minLength={2}
                maxLength={100}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>
            {profileError && <p className="auth-error" role="alert">{profileError}</p>}
            <button className="auth-submit" type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button className="auth-secondary" type="button" onClick={handleCancelProfileEdit} disabled={isSavingProfile}>
              Annuler
            </button>
          </form>
        ) : (
          <>
            <dl className="profile-info">
              <div className="profile-row">
                <dt>Nom</dt>
                <dd>{user?.nom}</dd>
              </div>
              <div className="profile-row">
                <dt>Email</dt>
                <dd>{user?.email}</dd>
              </div>
              <div className="profile-row">
                <dt>Rôle</dt>
                <dd>{roleLisible}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="auth-secondary"
              onClick={() => {
                setProfileForm({ nom: user?.nom ?? '', email: user?.email ?? '' });
                setProfileError(null);
                setProfileMessage(null);
                setIsEditingProfile(true);
              }}
            >
              Modifier mes informations
            </button>
          </>
        )}
        {profileMessage && <p role="status">{profileMessage}</p>}
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

        <button type="button" className="auth-secondary" onClick={handleToggleTwoFactor} disabled={isSubmitting}>
          {isSubmitting
            ? 'Mise à jour…'
            : doubleAuth
              ? 'Désactiver la double authentification'
              : qrCode
                ? 'Annuler la configuration'
                : 'Activer la double authentification'}
        </button>

        {qrCode && (
          <form className="auth-form" onSubmit={handleEnableTwoFactor}>
            <p className="profile-security-hint">Scanne ce QR code avec ton application d'authentification.</p>
            <img className="twofactor-qr" src={qrCode} alt="QR code d'authentification à deux facteurs" />
            <div className="auth-field">
              <label htmlFor="profile-setup-code">Code à 6 chiffres</label>
              <input
                id="profile-setup-code"
                className="otp-input"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Activation…' : 'Confirmer et activer'}
            </button>
          </form>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
      </div>

      <button type="button" className="profile-logout" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? 'Déconnexion…' : 'Se déconnecter'}
      </button>
    </div>
  );
}
