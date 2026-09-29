import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { TwoFactorSetup } from '../components/TwoFactorSetup.jsx';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(user?.two_factor_enabled));

  return (
    <div>
      <h2>Profil</h2>
      <p>Connecté en tant que {user?.nom} ({user?.email})</p>

      <TwoFactorSetup isEnabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />

      <button type="button" onClick={logout}>
        Se déconnecter
      </button>
    </div>
  );
}
