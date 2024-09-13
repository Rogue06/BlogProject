import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Article } from '../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user, articles, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [userArticles, setUserArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (user) {
      setUserArticles(articles.filter(article => article.author === user.username));
    }
  }, [user, articles]);

  const totalLikes = useMemo(() => {
    return userArticles.reduce((sum, article) => sum + article.likes, 0);
  }, [userArticles]);

  const handleProfileUpdate = async () => {
    if (user) {
      await updateUserProfile({ ...user, username: editedUsername });
      setIsEditing(false);
    }
  };

  if (!user) {
    return <div>Vous devez être connecté pour voir votre profil.</div>;
  }

  return (
    <div className="user-profile">
      <h2>Profil de {user.username}</h2>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editedUsername}
            onChange={(e) => setEditedUsername(e.target.value)}
          />
          <button onClick={handleProfileUpdate}>Sauvegarder</button>
        </div>
      ) : (
        <div>
          <p>Email: {user.email}</p>
          <button onClick={() => setIsEditing(true)}>Modifier le profil</button>
        </div>
      )}
      <div className="user-stats">
        <h3>Statistiques</h3>
        <p>Nombre d'articles: {userArticles.length}</p>
        <p>Total des likes reçus: {totalLikes}</p>
      </div>
      <div className="user-articles">
        <h3>Vos articles</h3>
        {userArticles.map(article => (
          <div key={article.id} className="article-preview">
            <h4>{article.title}</h4>
            <p>Likes: {article.likes}</p>
            <p>Commentaires: {article.comments.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;