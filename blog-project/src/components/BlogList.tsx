import React, { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import ShareButtons from './ShareButtons';
import { Article } from '../context/AuthContext';
import CreateArticle from './CreateArticle';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';

const ARTICLES_PER_PAGE = 5;

const categories = ['Tous', 'Technologie', 'Lifestyle', 'Voyage', 'Cuisine', 'Autre'];

const BlogList: React.FC = () => {
  const { getArticles, likeArticle, user, totalArticles, setTotalArticles, onArticleCreated, articles, deleteArticle } = useAuth();
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getArticles(currentPage, ARTICLES_PER_PAGE, selectedCategory, searchTerm, searchTags);
      setDisplayedArticles(result.articles);
      setTotalArticles(result.totalArticles);
    } catch (err) {
      setError('Erreur lors du chargement des articles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getArticles, currentPage, selectedCategory, searchTerm, searchTags, setTotalArticles]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles, articles, selectedCategory, searchTerm, searchTags]);

  const handleAddSearchTag = () => {
    if (tagInput.trim() && !searchTags.includes(tagInput.trim())) {
      setSearchTags([...searchTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagInputKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Empêche le formulaire de se soumettre
      handleAddSearchTag();
    }
  };

  const handleRemoveSearchTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleLike = async (articleId: string) => {
    try {
      const updatedArticle = await likeArticle(articleId);
      if (updatedArticle) {
        setDisplayedArticles(prevArticles => 
          prevArticles.map(article => 
            article.id === articleId ? updatedArticle : article
          )
        );
      }
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

  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
  };

  const handleEditCancel = () => {
    setEditingArticle(null);
  };

  const handleDeleteArticle = (articleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) {
      deleteArticle(articleId);
    }
  };

  return (
    <div className={`blog-list ${theme}`}>
      <h1>Blog</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher des articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}>
          {isAdvancedSearch ? 'Recherche simple' : 'Recherche avancée'}
        </button>
      </div>
      {isAdvancedSearch && (
        <div className="advanced-search">
          <div className="tag-input">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Ajouter un tag pour la recherche"
            />
            <button type="button" onClick={handleAddSearchTag}>Ajouter</button>
          </div>
          <div className="tag-list">
            {searchTags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveSearchTag(tag)}>&times;</button>
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="filter-container">
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
      <h2>Articles récents</h2>
      {editingArticle ? (
        <CreateArticle 
          articleToEdit={editingArticle} 
          onEditCancel={() => setEditingArticle(null)}
        />
      ) : (
        displayedArticles.map((article) => (
          <div key={article.id} className="article">
            <h3>{article.title}</h3>
            <p>Catégorie: {article.category}</p>
            <p>Par {article.author} le {new Date(article.createdAt).toLocaleDateString()}</p>
            <div className="article-content">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
              <div className="article-actions">
                <ShareButtons title={article.title} url={`${window.location.origin}/article/${article.id}`} />
                {user && user.username === article.author && (
                  <>
                    <span title="Modifier l'article">
                      <FaEdit 
                        className="edit-icon" 
                        onClick={() => handleEditClick(article)}
                      />
                    </span>
                    <span title="Supprimer l'article">
                      <FaTrash 
                        className="delete-icon" 
                        onClick={() => handleDeleteArticle(article.id)}
                      />
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="article-footer">
              <div className="tags">
                {article.tags && article.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="like-container">
                <button 
                  onClick={() => handleLike(article.id)}
                  disabled={!user}
                  className="like-button"
                >
                  {article.likes > 0 ? <AiFillHeart color="red" /> : <AiOutlineHeart color="red" />}
                  <span className="like-count">{article.likes}</span>
                </button>
              </div>
            </div>
            <CommentList comments={article.comments} articleId={article.id} />
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