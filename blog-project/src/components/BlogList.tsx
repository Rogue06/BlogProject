import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import ShareButtons from './ShareButtons';
import { Article } from '../context/AuthContext'; // Ajout de cette ligne

const ARTICLES_PER_PAGE = 5;

const categories = ['Tous', 'Technologie', 'Lifestyle', 'Voyage', 'Cuisine', 'Autre']; // Ajout de cette ligne

const BlogList: React.FC = () => {
  const { getArticles, likeArticle, user, totalArticles, onArticleCreated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedArticles = await getArticles(currentPage, ARTICLES_PER_PAGE);
      const filteredArticles = selectedCategory === 'Tous'
        ? fetchedArticles
        : fetchedArticles.filter(article => article.category === selectedCategory);
      setArticles(filteredArticles);
    } catch (err) {
      setError('Erreur lors du chargement des articles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getArticles, currentPage, selectedCategory]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles, currentPage, selectedCategory, totalArticles]); // Ajout de totalArticles comme dépendance

  useEffect(() => {
    const unsubscribe = onArticleCreated(() => {
      setCurrentPage(1);
      loadArticles();
    });
    return unsubscribe;
  }, [onArticleCreated, loadArticles]);

  const handleLike = async (articleId: string) => {
    try {
      await likeArticle(articleId);
      loadArticles();
    } catch (error) {
      console.error('Erreur lors du like de l\'article', error);
      alert('Erreur lors du like de l\'article');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalArticles / ARTICLES_PER_PAGE));

  if (isLoading) return <div>Chargement des articles...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div>
      <h2>Articles récents</h2>
      <div>
        <label htmlFor="category-filter">Filtrer par catégorie:</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {articles.length === 0 ? (
        <p>Aucun article disponible.</p>
      ) : (
        articles.map((article) => (
          <div key={article.id} className="article">
            <h3>{article.title}</h3>
            <p>Catégorie: {article.category}</p>
            <p>Par {article.author} le {new Date(article.createdAt).toLocaleDateString()}</p>
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
        ))
      )}
      {totalArticles > 0 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          <span>Page {currentPage} sur {totalPages}</span>
          <button 
            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList;