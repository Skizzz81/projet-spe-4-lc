import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function RegisterPage({ onSuccess, onNavigateToLogin }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ nom: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register(form);
      onSuccess?.();
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
          <h2>Créer un compte</h2>
          <p className="auth-subtitle">Rejoins l'espace collaboratif.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" value={form.nom} onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création…' : 'Créer le compte'}
          </button>
        </form>

        <p className="auth-switch">
          Déjà inscrit ?{' '}
          <button type="button" className="auth-link" onClick={onNavigateToLogin}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
