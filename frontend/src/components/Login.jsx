import { useState } from 'react';

// Ecran d'entrée : on choisit juste un pseudo tant que l'auth n'est pas là.
export function Login({ onJoin }) {
  const [pseudo, setPseudo] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const nom = pseudo.trim();
    if (!nom) return;
    onJoin(nom);
  }

  return (
    <main className="login">
      <h1>Projet Spé 4</h1>
      <p>Choisis un pseudo pour rejoindre la salle.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ton pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          autoFocus
        />
        <button type="submit">Rejoindre</button>
      </form>
    </main>
  );
}
