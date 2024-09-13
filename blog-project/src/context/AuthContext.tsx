import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: Date;
  comments: Comment[];
  likes: number;  // Ajout du champ likes
  likedBy: string[];  // Ajout du champ likedBy pour stocker les IDs des utilisateurs qui ont liké
  tags: string[]; // Ajout des tags
  image?: string;
  video?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date | string;
  parentId?: string; // Ajoutez cette ligne
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createArticle: (title: string, content: string, category: string, tags: string[], image?: File | null, video?: File | null) => Promise<void>;
  addComment: (articleId: string, content: string, parentCommentId?: string) => Promise<void>;
  likeArticle: (articleId: string) => Promise<Article | undefined>;
  articles: Article[];
  getArticles: (page: number, limit: number, category?: string, searchTerm?: string, searchTags?: string[]) => Promise<{ articles: Article[]; totalArticles: number }>;
  totalArticles: number;
  setTotalArticles: React.Dispatch<React.SetStateAction<number>>;
  onArticleCreated: (callback: () => void) => () => void; // Modifié ici
  updateUserProfile: (updatedUser: User) => Promise<void>;
  updateArticle: (articleId: string, updatedArticle: Partial<Article>) => Promise<void>;
  updateComment: (articleId: string, commentId: string, newContent: string) => Promise<void>;
  deleteArticle: (articleId: string) => Promise<void>;
  deleteComment: (articleId: string, commentId: string) => Promise<void>;
  totalNewComments: number;
  hasNewNotifications: boolean;
  clearNotifications: () => void;
  lastNotificationCheckTime: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>(() => {
    const savedArticles = localStorage.getItem('articles');
    return savedArticles ? JSON.parse(savedArticles) : [];
  });
  const [totalArticles, setTotalArticles] = useState(0);
  const [articleCreatedListeners, setArticleCreatedListeners] = useState<(() => void)[]>([]);
  const [totalNewComments, setTotalNewComments] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [lastNotificationCheckTime, setLastNotificationCheckTime] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('articles', JSON.stringify(articles));
    setTotalArticles(articles.length);
  }, [articles]);

  const login = async (email: string, password: string) => {
    // Ici, nous simulerons une connexion réussie
    // Dans une vraie application, vous feriez un appel API ici
    setUser({ id: '1', username: 'utilisateur', email });
  };

  const signup = async (username: string, email: string, password: string) => {
    // Ici, nous simulerons une inscription réussie
    // Dans une vraie application, vous feriez un appel API ici
    setUser({ id: '1', username, email });
  };

  const logout = () => {
    setUser(null);
  };

  const createArticle = async (title: string, content: string, category: string, tags: string[] = [], image?: File | null, video?: File | null) => {
    if (!user) throw new Error("Vous devez être connecté pour créer un article");
    
    // Ici, vous devriez implémenter la logique pour uploader l'image et la vidéo
    // et obtenir leurs URLs. Pour cet exemple, nous allons simplement utiliser des URLs factices.
    const imageUrl = image ? 'http://example.com/image.jpg' : undefined;
    const videoUrl = video ? 'http://example.com/video.mp4' : undefined;

    const newArticle: Article = {
      id: Date.now().toString(),
      title,
      content,
      author: user.username,
      category,
      createdAt: new Date(),
      comments: [],
      likes: 0,
      likedBy: [],
      tags: tags.map(tag => tag.toLowerCase()),
      image: imageUrl,
      video: videoUrl,
    };
    setArticles(prevArticles => [...prevArticles, newArticle]);
    setTotalArticles(prev => prev + 1);
    articleCreatedListeners.forEach(listener => listener());
  };

  const likeArticle = async (articleId: string) => {
    if (!user) throw new Error("Vous devez être connecté pour liker un article");
    let updatedArticle: Article | undefined;
    setArticles(prevArticles => {
      const updatedArticles = prevArticles.map(article => {
        if (article.id === articleId) {
          const userLiked = article.likedBy.includes(user.id);
          updatedArticle = {
            ...article,
            likes: userLiked ? article.likes - 1 : article.likes + 1,
            likedBy: userLiked
              ? article.likedBy.filter(id => id !== user.id)
              : [...article.likedBy, user.id]
          };
          
          // Vérifier si l'article appartient à l'utilisateur connecté et si c'est un nouveau like
          if (article.author === user.username && !userLiked) {
            setHasNewNotifications(true);
          }
          
          return updatedArticle;
        }
        return article;
      });
      localStorage.setItem('articles', JSON.stringify(updatedArticles));
      return updatedArticles;
    });
    return updatedArticle;
  };

  const addComment = async (articleId: string, content: string, parentCommentId?: string) => {
    if (!user) throw new Error("Vous devez être connecté pour commenter");
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: user.username,
      createdAt: new Date(),
      parentId: parentCommentId,
    };
    setArticles(prevArticles => prevArticles.map(article => 
      article.id === articleId 
        ? { ...article, comments: [...article.comments, newComment] }
        : article
    ));
    
    // Vérifier si le commentaire est sur un article de l'utilisateur connecté
    const article = articles.find(a => a.id === articleId);
    if (article && article.author === user.username) {
      setHasNewNotifications(true);
    }
  };

  const getArticles = useCallback(async (page: number, limit: number, category?: string, searchTerm?: string, searchTags?: string[]) => {
    let filteredArticles = articles;

    if (category && category !== 'Tous') {
      filteredArticles = filteredArticles.filter(article => article.category === category);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(lowerSearchTerm) ||
        article.content.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (searchTags && searchTags.length > 0) {
      filteredArticles = filteredArticles.filter(article => 
        article.tags && searchTags.every(searchTag => 
          article.tags.some(tag => tag.toLowerCase() === searchTag.toLowerCase())
        )
      );
    }

    // Calculer le nombre total d'articles après filtrage
    const totalFilteredArticles = filteredArticles.length;

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedArticles = filteredArticles.slice(start, end);

    return {
      articles: paginatedArticles,
      totalArticles: totalFilteredArticles
    };
  }, [articles]);

  const onArticleCreated = useCallback((callback: () => void) => {
    setArticleCreatedListeners(prev => [...prev, callback]);
    return () => {
      setArticleCreatedListeners(prev => prev.filter(listener => listener !== callback));
    };
  }, []);

  const updateUserProfile = async (updatedUser: User) => {
    if (!user) return;
    
    // Mettre à jour l'utilisateur
    setUser(updatedUser);

    // Mettre à jour les articles de l'utilisateur
    setArticles(prevArticles => prevArticles.map(article => {
      if (article.author === user.username) {
        return { ...article, author: updatedUser.username };
      }
      return article;
    }));

    // Mettre à jour les commentaires de l'utilisateur
    setArticles(prevArticles => prevArticles.map(article => ({
      ...article,
      comments: article.comments.map(comment => {
        if (comment.author === user.username) {
          return { ...comment, author: updatedUser.username };
        }
        return comment;
      })
    })));
  };

  const updateArticle = async (articleId: string, updatedArticle: Partial<Article>) => {
    if (!user) throw new Error("Vous devez être connecté pour modifier un article");
    setArticles(prevArticles => prevArticles.map(article => 
      article.id === articleId ? { ...article, ...updatedArticle } : article
    ));
  };

  const updateComment = async (articleId: string, commentId: string, newContent: string) => {
    if (!user) throw new Error("Vous devez être connecté pour modifier un commentaire");
    setArticles(prevArticles => prevArticles.map(article => 
      article.id === articleId
        ? {
            ...article,
            comments: article.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, content: newContent }
                : comment
            )
          }
        : article
    ));
  };

  const deleteArticle = async (articleId: string) => {
    if (!user) throw new Error("Vous devez être connecté pour supprimer un article");
    setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
  };

  const deleteComment = async (articleId: string, commentId: string) => {
    if (!user) throw new Error("Vous devez être connecté pour supprimer un commentaire");
    setArticles(prevArticles => prevArticles.map(article => 
      article.id === articleId
        ? { ...article, comments: article.comments.filter(comment => comment.id !== commentId) }
        : article
    ));
  };

  // Ajoutez une fonction pour mettre à jour totalNewComments
  const updateTotalNewComments = useCallback(() => {
    const newComments = articles.reduce((sum, article) => {
      // Ici, vous devriez implémenter une logique pour déterminer quels commentaires sont "nouveaux"
      // Par exemple, en comparant leur date de création avec la dernière visite de l'utilisateur
      const newCommentsCount = article.comments.filter(comment => {
        // Exemple : considérer comme nouveau tout commentaire créé dans les dernières 24 heures
        const commentDate = new Date(comment.createdAt);
        const now = new Date();
        return now.getTime() - commentDate.getTime() < 24 * 60 * 60 * 1000;
      }).length;
      return sum + newCommentsCount;
    }, 0);
    setTotalNewComments(newComments);
  }, [articles]);

  useEffect(() => {
    updateTotalNewComments();
  }, [updateTotalNewComments]);

  const clearNotifications = () => {
    setHasNewNotifications(false);
    setLastNotificationCheckTime(Date.now());
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      createArticle, 
      addComment, 
      likeArticle, 
      articles, 
      getArticles, 
      totalArticles, 
      setTotalArticles, 
      onArticleCreated,
      updateUserProfile,
      updateArticle,
      updateComment,
      deleteArticle,
      deleteComment,
      totalNewComments,
      hasNewNotifications,
      clearNotifications,
      lastNotificationCheckTime
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};