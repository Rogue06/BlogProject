import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { animated, useSpring } from '@react-spring/web';

const Header: React.FC = () => {
  const { user, logout, hasNewNotifications, clearNotifications } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  });

  const handleProfileClick = () => {
    if (hasNewNotifications) {
      clearNotifications();
    }
  };

  return (
    <animated.header className={`header ${theme}`} style={headerAnimation}>
      <h1>Blog Infos !</h1>
      <nav>
        {user ? (
          <>
            <Link to="/">Accueil</Link>
            <Link to="/create-article">Créer un article</Link>
            <Link to="/profile" onClick={handleProfileClick} className="profile-link">
              Profil
              {hasNewNotifications && <span className="notification-dot"></span>}
            </Link>
            <button onClick={logout} className="logout-btn">Se déconnecter</button>
          </>
        ) : (
          <>
            <Link to="/">Accueil</Link>
            <Link to="/signup">S'inscrire</Link>
          </>
        )}
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </animated.header>
  );
};

export default Header;