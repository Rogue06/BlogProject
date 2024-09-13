import React from 'react';
import { Comment } from '../context/AuthContext';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <div>
      <h3>Commentaires</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="comment">
          <p>{comment.content}</p>
          <p>Par {comment.author} le {comment.createdAt.toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;