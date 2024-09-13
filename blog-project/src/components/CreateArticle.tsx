import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Article } from '../context/AuthContext';

const categories = ['Technologie', 'Lifestyle', 'Voyage', 'Cuisine', 'Autre'];

interface CreateArticleProps {
  articleToEdit?: Article;
  onEditCancel?: () => void;
}

const CreateArticle: React.FC<CreateArticleProps> = ({ articleToEdit, onEditCancel }) => {
  const [title, setTitle] = useState(articleToEdit?.title || '');
  const [content, setContent] = useState(articleToEdit?.content || '');
  const [category, setCategory] = useState(articleToEdit?.category || categories[0]);
  const [tags, setTags] = useState<string[]>(articleToEdit?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const { createArticle, updateArticle } = useAuth();
  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      setContent(articleToEdit.content || '');
      setCategory(articleToEdit.category || categories[0]);
      setTags(articleToEdit.tags || []);
    }
  }, [articleToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (articleToEdit) {
        await updateArticle(articleToEdit.id, { title, content, category, tags });
        if (onEditCancel) onEditCancel();
      } else {
        await createArticle(title, content, category, tags);
      }
      setTitle('');
      setContent('');
      setCategory(categories[0]);
      setTags([]);
      setTagInput('');
      alert(articleToEdit ? 'Article modifié avec succès!' : 'Article créé avec succès!');
    } catch (error) {
      console.error('Erreur lors de la création/modification de l\'article', error);
      alert('Erreur lors de la création/modification de l\'article');
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

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', e.target?.result);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  const videoHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      const value = prompt('Veuillez entrer l\'URL de la vidéo YouTube');
      if (value) {
        quill.insertEmbed(range.index, 'video', value);
      }
    }
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
        video: videoHandler
      }
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  return (
    <form onSubmit={handleSubmit} className="create-article-form">
      <h2>{articleToEdit ? 'Modifier l\'article' : 'Créer un nouvel article'}</h2>
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
      <div className="form-group">
        <label htmlFor="content">Contenu</label>
        <ReactQuill 
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
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
      <button type="submit" className="submit-btn">
        {articleToEdit ? 'Modifier' : 'Publier'}
      </button>
      {articleToEdit && (
        <button type="button" onClick={onEditCancel} className="cancel-btn">
          Annuler
        </button>
      )}
    </form>
  );
};

export default CreateArticle;