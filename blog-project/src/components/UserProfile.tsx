import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Article } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { user, articles, updateUserProfile, clearNotifications } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');

  useEffect(() => {
    if (user) {
      clearNotifications();
    }
  }, [user, clearNotifications]);

  const userArticles = useMemo(() => {
    return articles.filter(article => article.author === user?.username);
  }, [articles, user]);

  const totalLikes = useMemo(() => {
    return userArticles.reduce((sum, article) => sum + article.likes, 0);
  }, [userArticles]);

  const articlesWithRecentActivity = useMemo(() => {
    return userArticles
      .map(article => ({
        ...article,
        hasNewActivity: article.comments.length > 0 || article.likes > 0,
        newComments: article.comments,
        newLikes: article.likes
      }))
      .sort((a, b) => {
        if (a.hasNewActivity && !b.hasNewActivity) return -1;
        if (!a.hasNewActivity && b.hasNewActivity) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);
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
      {/* ... reste du code ... */}
      <div className="user-stats">
        <h3>Statistiques</h3>
        <p>Nombre d'articles: {userArticles.length}</p>
        <p>Total des likes reçus: {totalLikes}</p>
      </div>
      <div className="recent-articles">
        <h3>Vos articles récents avec activité</h3>
        {articlesWithRecentActivity.map(article => (
          <div key={article.id} className={`article-preview ${article.hasNewActivity ? 'new-activity' : ''}`}>
            <h4><Link to={`/article/${article.id}`}>{article.title}</Link></h4>
            <p>Likes: {article.likes} | Commentaires: {article.comments.length}</p>
            {article.hasNewActivity && (
              <div className="new-activity-details">
                {article.newLikes > 0 && (
                  <p className="new-likes">Likes : {article.newLikes}</p>
                )}
                {article.newComments.length > 0 && (
                  <div className="new-comments">
                    <p>Commentaires récents : {article.newComments.length}</p>
                    <ul>
                      {article.newComments.slice(0, 3).map(comment => (
                        <li key={comment.id}>{comment.author}: {comment.content}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;