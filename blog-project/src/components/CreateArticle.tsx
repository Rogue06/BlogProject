import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const categories = ['Technologie', 'Lifestyle', 'Voyage', 'Cuisine', 'Autre'];

const CreateArticle: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const { createArticle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArticle(title, content, category);
      setTitle('');
      setContent('');
      setCategory(categories[0]);
      alert('Article créé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la création de l\'article', error);
      alert('Erreur lors de la création de l\'article');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer un nouvel article</h2>
      <div>
        <label htmlFor="title">Titre:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="category">Catégorie:</label>
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
      <div>
        <label htmlFor="content">Contenu:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="login">Publier</button>
    </form>
  );
};

export default CreateArticle;