import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h1>Mon Blog</h1>
      <nav>
        {user ? (
          <>
            <Link to="/">Accueil</Link>
            <Link to="/create-article">Créer un article</Link>
            <Link to="/profile">Profil</Link>
            <button onClick={logout} className="logout-btn">Se déconnecter</button>
          </>
        ) : (
          <>
            <Link to="/">Accueil</Link>
            <Link to="/signup">S'inscrire</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;