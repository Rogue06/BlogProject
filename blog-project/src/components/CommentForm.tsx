import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface CommentFormProps {
  articleId: string;
}

const CommentForm: React.FC<CommentFormProps> = ({ articleId }) => {
  const [content, setContent] = useState('');
  const { addComment } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addComment(articleId, content);
      setContent('');
      alert('Commentaire ajouté avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire', error);
      alert('Erreur lors de l\'ajout du commentaire');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Ajouter un commentaire</h3>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="login">Commenter</button>
    </form>
  );
};

export default CommentForm;