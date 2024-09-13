import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const categories = ['Technologie', 'Lifestyle', 'Voyage', 'Cuisine', 'Autre'];

const CreateArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { createArticle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArticle(title, content, category, tags);
      setTitle('');
      setContent('');
      setCategory(categories[0]);
      setTags([]);
      setTagInput('');
      alert('Article créé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la création de l\'article', error);
      alert('Erreur lors de la création de l\'article');
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="create-article-form">
      <h2>Créer un nouvel article</h2>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Titre</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Entrez le titre de l'article"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Catégorie</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="content">Contenu</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Écrivez le contenu de votre article ici"
        />
      </div>
      <div className="form-group">
        <label htmlFor="tags">Tags:</label>
        <div className="tag-input">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Ajouter un tag"
          />
          <button type="button" onClick={handleAddTag}>Ajouter</button>
        </div>
        <div className="tag-list">
          {tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)}>&times;</button>
            </span>
          ))}
        </div>
      </div>
      <button type="submit" className="submit-btn">Publier</button>
    </form>
  );
};

export default CreateArticle;