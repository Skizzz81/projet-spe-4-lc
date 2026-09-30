import { useCallback, useEffect, useState } from 'react';
import * as adminApi from '../api/adminApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = { nom: '', email: '', password: '', role: 'user' };

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.listUsers();
      setUsers(data.users);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsCreating(true);

    try {
      await adminApi.createUser(form);
      setForm(initialForm);
      setMessage('Utilisateur créé.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleChange(targetUser, role) {
    setError(null);
    setMessage(null);
    setPendingUserId(targetUser.id);

    try {
      await adminApi.updateUserRole(targetUser.id, role);
      setUsers((current) => current.map((item) =>
        item.id === targetUser.id ? { ...item, role } : item,
      ));
      setMessage(`Rôle de ${targetUser.nom} mis à jour.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleBlockToggle(targetUser) {
    setError(null);
    setMessage(null);
    setPendingUserId(targetUser.id);

    try {
      if (targetUser.is_blocked) {
        await adminApi.unblockUser(targetUser.id);
      } else {
        await adminApi.blockUser(targetUser.id);
      }
      setUsers((current) => current.map((item) =>
        item.id === targetUser.id
          ? { ...item, is_blocked: !targetUser.is_blocked }
          : item,
      ));
      setMessage(targetUser.is_blocked ? 'Compte débloqué.' : 'Compte bloqué.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <main className="main-content admin-page">
      <div className="page-heading">
        <div>
          <h1>Administration</h1>
          <p className="page-description">Gère les comptes et leurs accès.</p>
        </div>
        <span className="document-count">
          {users.length} utilisateur{users.length > 1 ? 's' : ''}
        </span>
      </div>

      {error && <p className="auth-error" role="alert">{error}</p>}
      {message && <p className="admin-message" role="status">{message}</p>}

      <section className="admin-panel" aria-labelledby="admin-create-title">
        <h2 id="admin-create-title">Ajouter un utilisateur</h2>
        <form className="admin-create-form" onSubmit={handleCreateUser}>
          <label className="form-field" htmlFor="admin-user-name">
            Nom
            <input
              id="admin-user-name"
              name="nom"
              value={form.nom}
              onChange={handleFormChange}
              maxLength={100}
              required
            />
          </label>
          <label className="form-field" htmlFor="admin-user-email">
            Email
            <input
              id="admin-user-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              required
            />
          </label>
          <label className="form-field" htmlFor="admin-user-password">
            Mot de passe temporaire
            <input
              id="admin-user-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleFormChange}
              minLength={8}
              required
            />
          </label>
          <label className="form-field" htmlFor="admin-user-role">
            Rôle
            <select id="admin-user-role" name="role" value={form.role} onChange={handleFormChange}>
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={isCreating}>
            {isCreating ? 'Création…' : 'Créer le compte'}
          </button>
        </form>
      </section>

      <section className="admin-panel" aria-labelledby="admin-users-title">
        <div className="admin-panel-heading">
          <h2 id="admin-users-title">Utilisateurs existants</h2>
          <button className="secondary-button" type="button" onClick={loadUsers} disabled={isLoading}>
            Actualiser
          </button>
        </div>

        {isLoading ? (
          <p role="status">Chargement des utilisateurs…</p>
        ) : users.length === 0 ? (
          <p>Aucun utilisateur à afficher.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th scope="col">Utilisateur</th>
                  <th scope="col">Rôle</th>
                  <th scope="col">2FA</th>
                  <th scope="col">État du compte</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((targetUser) => {
                  const isCurrentUser = Number(targetUser.id) === Number(currentUser?.id);
                  const isPending = pendingUserId === targetUser.id;

                  return (
                    <tr key={targetUser.id}>
                      <td>
                        <strong>{targetUser.nom}</strong>
                        <span className="admin-user-email">{targetUser.email}</span>
                      </td>
                      <td>
                        <select
                          aria-label={`Rôle de ${targetUser.nom}`}
                          className="admin-role-select"
                          value={targetUser.role}
                          onChange={(event) => handleRoleChange(targetUser, event.target.value)}
                          disabled={isCurrentUser || isPending}
                        >
                          <option value="user">Utilisateur</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </td>
                      <td>{targetUser.two_factor_enabled ? 'Activée' : 'Désactivée'}</td>
                      <td>
                        <span className={targetUser.is_blocked ? 'profile-status off' : 'profile-status on'}>
                          {targetUser.is_blocked ? 'Bloqué' : 'Actif'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={targetUser.is_blocked ? 'secondary-button' : 'danger-button'}
                          type="button"
                          onClick={() => handleBlockToggle(targetUser)}
                          disabled={isCurrentUser || isPending}
                          title={isCurrentUser ? 'Tu ne peux pas bloquer ton propre compte.' : undefined}
                        >
                          {isPending
                            ? 'Mise à jour…'
                            : targetUser.is_blocked
                              ? 'Débloquer'
                              : 'Bloquer'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}