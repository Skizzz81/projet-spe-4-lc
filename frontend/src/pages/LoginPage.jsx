import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage({ onNavigateToRegister, onTwoFactorRequired }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const result = await login(form);

      if (result.twoFactorRequired) {
        onTwoFactorRequired?.();
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Connexion</h2>

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

      <label htmlFor="password">Mot de passe</label>
      <input
        id="password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
      />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Connexion…' : 'Se connecter'}
      </button>

      <button type="button" onClick={onNavigateToRegister}>
        Créer un compte
      </button>
    </form>
  );
}
