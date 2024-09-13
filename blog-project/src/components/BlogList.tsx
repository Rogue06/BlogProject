import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import ShareButtons from './ShareButtons';

const categories = ['Tous', 'Technologie', 'Lifestyle', 'Voyage', 'Cuisine', 'Autre'];

const BlogList: React.FC = () => {
  const { articles, likeArticle, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredArticles = selectedCategory === 'Tous'
    ? articles
    : articles.filter(article => article.category === selectedCategory);

  const handleLike = async (articleId: string) => {
    try {
      await likeArticle(articleId);
    } catch (error) {
      console.error('Erreur lors du like de l\'article', error);
      alert('Erreur lors du like de l\'article');
    }
  };

  return (
    <div>
      <h2>Articles récents</h2>
      <div>
        <label htmlFor="category-filter">Filtrer par catégorie:</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {filteredArticles.map((article) => (
        <div key={article.id} className="article">
          <h3>{article.title}</h3>
          <p>Catégorie: {article.category}</p>
          <p>Par {article.author} le {article.createdAt.toLocaleDateString()}</p>
          <p>{article.content}</p>
          <p>Likes: {article.likes}</p>
          <button 
            onClick={() => handleLike(article.id)}
            disabled={!user}
            className={user && article.likedBy.includes(user.id) ? 'liked' : ''}
          >
            {user && article.likedBy.includes(user.id) ? 'Unlike' : 'Like'}
          </button>
          <ShareButtons title={article.title} url={`${window.location.origin}/article/${article.id}`} />
          <CommentList comments={article.comments} />
          <CommentForm articleId={article.id} />
        </div>
      ))}
    </div>
  );
};

export default BlogList;