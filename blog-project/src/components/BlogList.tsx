import React from 'react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

const BlogList: React.FC = () => {
  // Pour l'instant, nous utiliserons des données factices
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Premier article',
      content: 'Contenu du premier article...',
      author: 'John Doe',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Deuxième article',
      content: 'Contenu du deuxième article...',
      author: 'Jane Doe',
      createdAt: new Date(),
    },
  ];

  return (
    <div>
      <h2>Articles récents</h2>
      {blogPosts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>Par {post.author} le {post.createdAt.toLocaleDateString()}</p>
          <p>{post.content.substring(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
};

export default BlogList;