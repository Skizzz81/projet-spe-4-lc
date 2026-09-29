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
    <form onSubmit={handleSubmit}>
      <h2>Créer un compte</h2>

      <label htmlFor="nom">Nom</label>
      <input id="nom" name="nom" value={form.nom} onChange={handleChange} required />

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
        {isSubmitting ? 'Création…' : 'Créer le compte'}
      </button>

      <button type="button" onClick={onNavigateToLogin}>
        J'ai déjà un compte
      </button>
    </form>
  );
}
