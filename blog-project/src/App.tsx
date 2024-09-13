import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
import BlogList from './components/BlogList';
import CreateArticle from './components/CreateArticle';
import UserProfile from './components/UserProfile';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Header />
      <main>
        <Switch>
          <Route exact path="/">
            {user ? <BlogList /> : <LoginForm />}
          </Route>
          <Route path="/signup">
            <SignUpForm />
          </Route>
          <Route path="/create-article">
            {user ? <CreateArticle /> : <LoginForm />}
          </Route>
          <Route path="/profile">
            {user ? <UserProfile /> : <LoginForm />}
          </Route>
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;