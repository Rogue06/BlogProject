import React, { useState } from 'react';
import { Comment } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { RiReplyLine } from 'react-icons/ri';

interface CommentListProps {
  comments: Comment[];
  articleId: string;
}

const CommentList: React.FC<CommentListProps> = ({ comments, articleId }) => {
  const { user, updateComment, deleteComment, addComment } = useAuth();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } else if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return 'Date inconnue';
  };

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      await updateComment(articleId, commentId, editedContent);
      setEditingCommentId(null);
      setEditedContent('');
    } catch (error) {
      console.error('Erreur lors de la modification du commentaire', error);
      alert('Erreur lors de la modification du commentaire');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.')) {
      deleteComment(articleId, commentId);
    }
  };

  const handleReplyClick = (commentId: string) => {
    setReplyingToId(commentId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyContent('');
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    try {
      await addComment(articleId, replyContent, parentCommentId);
      setReplyingToId(null);
      setReplyContent('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse', error);
      alert('Erreur lors de l\'ajout de la réponse');
    }
  };

  return (
    <div className="comments-section">
      <h3>Commentaires</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <span className="comment-author">{comment.author}</span>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
          </div>
          {editingCommentId === comment.id ? (
            <div className="comment-form">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <div className="comment-actions">
                <button onClick={() => handleSaveEdit(comment.id)}>Sauvegarder</button>
                <button onClick={handleCancelEdit}>Annuler</button>
              </div>
            </div>
          ) : (
            <>
              <p className="comment-content">{comment.content}</p>
              <div className="comment-actions">
                {user && user.username === comment.author && (
                  <>
                    <button title="Modifier le commentaire" onClick={() => handleEditClick(comment)}>
                      <FaEdit />
                    </button>
                    <button title="Supprimer le commentaire" onClick={() => handleDeleteComment(comment.id)}>
                      <FaTrash />
                    </button>
                  </>
                )}
                <button title="Répondre au commentaire" onClick={() => handleReplyClick(comment.id)}>
                  <RiReplyLine />
                </button>
              </div>
            </>
          )}
          {replyingToId === comment.id && (
            <div className="comment-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Votre réponse..."
              />
              <div className="comment-actions">
                <button onClick={() => handleSubmitReply(comment.id)}>Répondre</button>
                <button onClick={handleCancelReply}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;