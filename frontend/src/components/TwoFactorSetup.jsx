import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as authApi from '../api/authApi.js';

export function TwoFactorSetup({ isEnabled, onChange }) {
  const { refreshProfile } = useAuth();
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStartSetup() {
    setError(null);
    try {
      const data = await authApi.setup2fa();
      setQrCode(data.qrCode);
    } catch (setupError) {
      setError(setupError.message);
    }
  }

  async function handleEnable(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.enable2fa({ code });
      setQrCode(null);
      setCode('');
      await refreshProfile();
      onChange?.(true);
    } catch (enableError) {
      setError(enableError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDisable() {
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.disable2fa();
      await refreshProfile();
      onChange?.(false);
    } catch (disableError) {
      setError(disableError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEnabled) {
    return (
      <div>
        <h3>Authentification à deux facteurs activée</h3>
        <button type="button" onClick={handleDisable} disabled={isSubmitting}>
          Désactiver
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h3>Activer l'authentification à deux facteurs</h3>

      {!qrCode && (
        <button type="button" onClick={handleStartSetup}>
          Configurer le 2FA
        </button>
      )}

      {qrCode && (
        <form onSubmit={handleEnable}>
          <p>Scanne ce QR code avec ton application d'authentification.</p>
          <img src={qrCode} alt="QR code d'authentification à deux facteurs" />

          <label htmlFor="setup-code">Code à 6 chiffres</label>
          <input
            id="setup-code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Activation…' : 'Confirmer et activer'}
          </button>
        </form>
      )}

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
