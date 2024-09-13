import React from 'react';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
import BlogList from './components/BlogList';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, logout } = useAuth();
  const [isLogin, setIsLogin] = React.useState(true);

  if (user) {
    return (
      <div>
        <h1>Bienvenue, {user.username}!</h1>
        <BlogList />
        <button onClick={logout}>Se déconnecter</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Mon Blog</h1>
      {isLogin ? <LoginForm /> : <SignUpForm />}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "S'inscrire" : "Se connecter"}
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;