import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function TwoFactorVerifyPage({ onVerified }) {
  const { verifyLogin2fa } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await verifyLogin2fa(code);
      onVerified?.();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-head">
          <h2>Vérification en deux étapes</h2>
          <p className="auth-subtitle">Entre le code généré par ton application d'authentification.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="code">Code à 6 chiffres</label>
            <input
              id="code"
              name="code"
              className="otp-input"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Vérification…' : 'Valider'}
          </button>
        </form>
      </div>
    </div>
  );
}
