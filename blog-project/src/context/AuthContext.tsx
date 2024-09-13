import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

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
}

export interface Comment {  // Ajout du mot-clé 'export' ici
  id: string;
  content: string;
  author: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createArticle: (title: string, content: string, category: string) => Promise<void>;
  addComment: (articleId: string, content: string) => Promise<void>;
  likeArticle: (articleId: string) => Promise<void>;
  articles: Article[];
  getArticles: (page: number, limit: number, category?: string, searchTerm?: string) => Promise<Article[]>;
  totalArticles: number;
  setTotalArticles: React.Dispatch<React.SetStateAction<number>>;
  onArticleCreated: (callback: () => void) => () => void; // Modifié ici
  updateUserProfile: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [articleCreatedListeners, setArticleCreatedListeners] = useState<(() => void)[]>([]);

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

  const createArticle = async (title: string, content: string, category: string) => {
    if (!user) throw new Error("Vous devez être connecté pour créer un article");
    const newArticle: Article = {
      id: Date.now().toString(),
      title,
      content,
      author: user.username,
      category,
      createdAt: new Date(),
      comments: [],
      likes: 0,  // Initialisation des likes à 0
      likedBy: [],  // Initialisation de likedBy comme un tableau vide
    };
    setArticles(prevArticles => [...prevArticles, newArticle]);
    setTotalArticles(prev => prev + 1); // Ajout de cette ligne
    articleCreatedListeners.forEach(listener => listener());
  };

  const likeArticle = async (articleId: string) => {
    if (!user) throw new Error("Vous devez être connecté pour liker un article");
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        if (article.likedBy.includes(user.id)) {
          // Si l'utilisateur a déjà liké, on retire son like
          return {
            ...article,
            likes: article.likes - 1,
            likedBy: article.likedBy.filter(id => id !== user.id)
          };
        } else {
          // Sinon, on ajoute son like
          return {
            ...article,
            likes: article.likes + 1,
            likedBy: [...article.likedBy, user.id]
          };
        }
      }
      return article;
    }));
  };

  const addComment = async (articleId: string, content: string) => {
    if (!user) throw new Error("Vous devez être connecté pour commenter");
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: user.username,
      createdAt: new Date(),
    };
    setArticles(articles.map(article => 
      article.id === articleId 
        ? { ...article, comments: [...article.comments, newComment] }
        : article
    ));
  };

  const getArticles = useCallback(async (page: number, limit: number, category?: string, searchTerm?: string) => {
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

    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredArticles.slice(start, end);
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
      updateUserProfile
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