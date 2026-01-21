const { useState, useEffect } = React;
const {
  Book, Plus, Trash2, Edit, Download, Search, RefreshCw,
  ChevronDown, ChevronUp, Save, X, Check, Copy, Loader
} = lucide;

// Storage API wrapper
const storage = {
  async get() {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get' })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return { projects: data.projects || [], chapters: data.chapters || [], sources: data.sources || [] };
  },

  async saveProject(project) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveProject', project })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.project;
  },

  async updateProject(project) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateProject', project })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
  },

  async deleteProject(id) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteProject', id })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
  },

  async saveChapter(chapter) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveChapter', chapter })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.chapter;
  },

  async updateChapter(chapter) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateChapter', chapter })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
  },

  async deleteChapter(id) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteChapter', id })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
  },

  async saveSource(source) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'saveSource', source })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.source;
  },

  async deleteSource(id) {
    const response = await fetch('/api/storage.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteSource', id })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
  }
};

// Authentication
const auth = {
  async login(username, password) {
    const response = await fetch('/api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.user;
  },

  async logout() {
    const response = await fetch('/api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
  },

  async checkAuth() {
    const response = await fetch('/api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check' })
    });
    const data = await response.json();
    return data.authenticated;
  }
};

// Claude API helper
const claude = {
  async generateText(prompt, systemPrompt, useWebSearch = false) {
    const messages = [{ role: 'user', content: prompt }];

    const body = {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      system: systemPrompt,
      messages: messages
    };

    if (useWebSearch) {
      body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
    }

    const response = await fetch('/api/proxy.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.type === 'error') {
      throw new Error(data.error?.message || 'API Error');
    }

    // Extract text from response
    let text = '';
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text') {
          text += block.text;
        }
      }
    }

    return text;
  }
};

// Utility functions
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function countChars(text) {
  return text ? text.length : 0;
}

// Login Component
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.login(username, password);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Book Generator</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// Project Form Modal
function ProjectFormModal({ isOpen, onClose, onSave, project }) {
  const [title, setTitle] = useState(project?.title || '');
  const [field, setField] = useState(project?.field || '');
  const [audience, setAudience] = useState(project?.audience || '');
  const [tone, setTone] = useState(project?.tone || 'professional');

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setField(project.field);
      setAudience(project.audience);
      setTone(project.tone);
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, field, audience, tone });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? 'Edit Project' : 'New Project'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field/Topic</label>
            <input
              type="text"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Development, Marketing, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Beginners, Professionals, Students"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Writing Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="academic">Academic</option>
              <option value="conversational">Conversational</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {project ? 'Update' : 'Create'} Project
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// Chapter Form Modal
function ChapterFormModal({ isOpen, onClose, onSave, projectId, chapter, maxOrder }) {
  const [title, setTitle] = useState(chapter?.title || '');
  const [topic, setTopic] = useState(chapter?.topic || '');
  const [orderNum, setOrderNum] = useState(chapter?.order_num ?? maxOrder + 1);
  const [wordTarget, setWordTarget] = useState(chapter?.word_target || 2000);

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setTopic(chapter.topic);
      setOrderNum(chapter.order_num);
      setWordTarget(chapter.word_target);
    } else {
      setOrderNum(maxOrder + 1);
    }
  }, [chapter, maxOrder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      project_id: projectId,
      title,
      topic,
      order_num: parseInt(orderNum),
      word_target: parseInt(wordTarget),
      status: 'draft'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={chapter ? 'Edit Chapter' : 'New Chapter'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic/Description</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                value={orderNum}
                onChange={(e) => setOrderNum(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Words</label>
              <input
                type="number"
                value={wordTarget}
                onChange={(e) => setWordTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="500"
                step="100"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {chapter ? 'Update' : 'Create'} Chapter
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// Research Modal
function ResearchModal({ isOpen, onClose, onSave, projectId }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults('');

    try {
      const prompt = `Research the following topic and provide a comprehensive summary with key points:\n\n${topic}`;
      const systemPrompt = 'You are a research assistant. Provide well-structured, factual information with sources when possible.';

      const result = await claude.generateText(prompt, systemPrompt, true);
      setResults(result);
    } catch (err) {
      alert('Research failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (results) {
      onSave({ project_id: projectId, topic, content: results });
      setTopic('');
      setResults('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Research Topic">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Research Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="What would you like to research?"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Search size={18} />
              Research
            </>
          )}
        </button>

        {results && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto whitespace-pre-wrap font-serif">
              {results}
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Research
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}

// Chapter Item Component
function ChapterItem({ chapter, project, previousChapters, onUpdate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedContent, setEditedContent] = useState(chapter.content || '');
  const [revisePrompt, setRevisePrompt] = useState('');

  useEffect(() => {
    setEditedContent(chapter.content || '');
  }, [chapter.content]);

  const wordCount = countWords(editedContent);
  const charCount = countChars(editedContent);
  const percentage = chapter.word_target ? Math.round((wordCount / chapter.word_target) * 100) : 0;

  const generateOutline = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Create a detailed outline for a book chapter with the following details:

Chapter Title: ${chapter.title}
Topic: ${chapter.topic}
Book Field: ${project.field}
Target Audience: ${project.audience}
Writing Tone: ${project.tone}

Create an outline with 4-6 main sections, each with 3-5 subsections. Format as a clear hierarchical structure.`;

      const systemPrompt = 'You are an expert book outline creator. Create well-structured, comprehensive outlines that cover the topic thoroughly.';

      const outline = await claude.generateText(prompt, systemPrompt, false);

      await storage.updateChapter({
        ...chapter,
        outline,
        status: 'outline'
      });

      onUpdate();
      alert('Outline generated successfully!');
    } catch (err) {
      alert('Failed to generate outline: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContent = async () => {
    if (!chapter.outline) {
      alert('Please generate an outline first!');
      return;
    }

    setIsGenerating(true);
    try {
      // Get context from previous chapters
      const previousContext = previousChapters
        .slice(0, 3) // Last 3 chapters
        .map(ch => `Chapter: ${ch.title}\nKey points: ${ch.content?.substring(0, 500)}...`)
        .join('\n\n');

      const prompt = `Write a comprehensive book chapter following this outline:

${chapter.outline}

REQUIREMENTS:
- Write in ${project.tone} tone for ${project.audience}
- Target length: ${chapter.word_target} words (minimum 85%)
- Include 4-5 concrete, practical examples
- Use varying section lengths (150-800 words per section)
- Mix short and long sentences for readability
- Use rhetorical questions and analogies where appropriate
- Balance bullet points with flowing prose
- NO AI clichés like "delve into", "realm of", "it's worth noting"
- Write naturally and human-like

${previousContext ? `PREVIOUS CHAPTER CONTEXT (avoid repetition):\n${previousContext}\n` : ''}

Write the complete chapter now:`;

      const systemPrompt = `You are an expert ${project.field} author writing for ${project.audience}. Write in a ${project.tone} but natural, human tone. Vary your sentence structure, use concrete examples, and write as if you're having a knowledgeable conversation with the reader. Avoid AI writing patterns and clichés.`;

      const content = await claude.generateText(prompt, systemPrompt, false);

      setEditedContent(content);

      await storage.updateChapter({
        ...chapter,
        content,
        status: 'written'
      });

      onUpdate();

      const words = countWords(content);
      if (words < chapter.word_target * 0.85) {
        alert(`Warning: Chapter has ${words} words, which is less than 85% of target (${chapter.word_target} words).`);
      } else {
        alert('Chapter generated successfully!');
      }
    } catch (err) {
      alert('Failed to generate content: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const reviseContent = async () => {
    if (!revisePrompt.trim()) {
      alert('Please enter revision instructions');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Revise the following chapter based on these instructions:

REVISION INSTRUCTIONS:
${revisePrompt}

CURRENT CHAPTER:
${editedContent}

Provide the complete revised chapter:`;

      const systemPrompt = `You are an expert editor. Make the requested changes while maintaining the chapter's quality, tone, and overall structure. Ensure the writing remains natural and human-like.`;

      const revised = await claude.generateText(prompt, systemPrompt, false);

      setEditedContent(revised);
      setRevisePrompt('');

      alert('Chapter revised successfully! Remember to save your changes.');
    } catch (err) {
      alert('Failed to revise content: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveContent = async () => {
    try {
      await storage.updateChapter({
        ...chapter,
        content: editedContent,
        status: editedContent ? 'edited' : chapter.status
      });
      onUpdate();
      alert('Content saved successfully!');
    } catch (err) {
      alert('Failed to save content: ' + err.message);
    }
  };

  const exportChapter = () => {
    const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chapter.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedContent);
    alert('Content copied to clipboard!');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`Are you sure you want to delete "${chapter.title}"?`)) {
      onDelete(chapter.id);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500">#{chapter.order_num}</span>
            <h4 className="font-semibold text-gray-800">{chapter.title}</h4>
            <span className={`text-xs px-2 py-1 rounded ${
              chapter.status === 'draft' ? 'bg-gray-200 text-gray-700' :
              chapter.status === 'outline' ? 'bg-blue-200 text-blue-700' :
              chapter.status === 'written' ? 'bg-green-200 text-green-700' :
              'bg-purple-200 text-purple-700'
            }`}>
              {chapter.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{chapter.topic}</p>
          <div className="flex gap-4 text-xs text-gray-500 mt-2">
            <span>Target: {chapter.word_target} words</span>
            {editedContent && (
              <>
                <span>Current: {wordCount} words ({percentage}%)</span>
                <span>{charCount} characters</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={18} />
          </button>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generateOutline}
              disabled={isGenerating || chapter.status !== 'draft'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader size={16} className="animate-spin" /> : <Edit size={16} />}
              Generate Outline
            </button>

            <button
              onClick={generateContent}
              disabled={isGenerating || !chapter.outline}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Generate Content
            </button>

            <button
              onClick={saveContent}
              disabled={!editedContent}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={copyToClipboard}
              disabled={!editedContent}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Copy size={16} />
              Copy
            </button>

            <button
              onClick={exportChapter}
              disabled={!editedContent}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          {/* Outline Display */}
          {chapter.outline && (
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Outline:</h5>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 whitespace-pre-wrap font-serif">
                {chapter.outline}
              </div>
            </div>
          )}

          {/* Content Editor */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-semibold text-gray-700">Content:</h5>
              <div className="text-sm text-gray-600">
                {wordCount} words • {charCount} characters • {percentage}% of target
              </div>
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-serif text-base"
              placeholder="Chapter content will appear here after generation..."
            />
          </div>

          {/* Revise Section */}
          {editedContent && (
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Revise Chapter:</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={revisePrompt}
                  onChange={(e) => setRevisePrompt(e.target.value)}
                  placeholder="Enter revision instructions (e.g., 'Add more examples', 'Make it more casual')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={reviseContent}
                  disabled={isGenerating || !revisePrompt.trim()}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Revise
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');

  const [projects, setProjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [sources, setSources] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    auth.checkAuth().then(authenticated => {
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    });
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const data = await storage.get();
      setProjects(data.projects);
      setChapters(data.chapters);
      setSources(data.sources);

      // Set first project as selected if none selected
      if (!selectedProject && data.projects.length > 0) {
        setSelectedProject(data.projects[0].id);
      }
    } catch (err) {
      alert('Failed to load data: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setIsAuthenticated(false);
      setProjects([]);
      setChapters([]);
      setSources([]);
      setSelectedProject(null);
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await storage.updateProject({ ...editingProject, ...projectData });
      } else {
        await storage.saveProject(projectData);
      }
      await loadData();
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (err) {
      alert('Failed to save project: ' + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project and all its chapters?')) return;

    try {
      await storage.deleteProject(id);
      if (selectedProject === id) {
        setSelectedProject(null);
      }
      await loadData();
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const handleSaveChapter = async (chapterData) => {
    try {
      if (editingChapter) {
        await storage.updateChapter({ ...editingChapter, ...chapterData });
      } else {
        await storage.saveChapter(chapterData);
      }
      await loadData();
      setShowChapterModal(false);
      setEditingChapter(null);
    } catch (err) {
      alert('Failed to save chapter: ' + err.message);
    }
  };

  const handleDeleteChapter = async (id) => {
    try {
      await storage.deleteChapter(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete chapter: ' + err.message);
    }
  };

  const handleSaveResearch = async (researchData) => {
    try {
      await storage.saveSource(researchData);
      await loadData();
      setShowResearchModal(false);
      alert('Research saved successfully!');
    } catch (err) {
      alert('Failed to save research: ' + err.message);
    }
  };

  const handleDeleteSource = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Delete this research source?')) return;

    try {
      await storage.deleteSource(id);
      await loadData();
    } catch (err) {
      alert('Failed to delete source: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  const currentProject = projects.find(p => p.id === selectedProject);
  const projectChapters = chapters
    .filter(c => c.project_id === selectedProject)
    .sort((a, b) => a.order_num - b.order_num);
  const projectSources = sources.filter(s => s.project_id === selectedProject);

  const stats = currentProject ? {
    totalChapters: projectChapters.length,
    completedChapters: projectChapters.filter(c => c.status === 'written' || c.status === 'edited').length,
    totalWords: projectChapters.reduce((sum, ch) => sum + countWords(ch.content), 0),
    totalChars: projectChapters.reduce((sum, ch) => sum + countChars(ch.content), 0)
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book size={32} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">AI Book Generator</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Project Selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Project:</label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(parseInt(e.target.value))}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a project --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowProjectModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>

          {currentProject && stats && (
            <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Chapters</div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.completedChapters}/{stats.totalChapters}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Words</div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.totalWords.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Characters</div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.totalChars.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-2xl font-bold text-gray-800">
                  {stats.totalChapters ? Math.round((stats.completedChapters / stats.totalChapters) * 100) : 0}%
                </div>
              </div>
            </div>
          )}
        </div>

        {currentProject && (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-6 py-3 font-medium ${
                    activeTab === 'projects'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Project Info
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`px-6 py-3 font-medium ${
                    activeTab === 'chapters'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Chapters ({projectChapters.length})
                </button>
                <button
                  onClick={() => setActiveTab('research')}
                  className={`px-6 py-3 font-medium ${
                    activeTab === 'research'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Research ({projectSources.length})
                </button>
              </div>

              <div className="p-6">
                {/* Project Info Tab */}
                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <div className="mt-1 text-lg">{currentProject.title}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Field</label>
                      <div className="mt-1">{currentProject.field}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Audience</label>
                      <div className="mt-1">{currentProject.audience}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tone</label>
                      <div className="mt-1 capitalize">{currentProject.tone}</div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => {
                          setEditingProject(currentProject);
                          setShowProjectModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit size={18} />
                        Edit Project
                      </button>
                      <button
                        onClick={() => handleDeleteProject(currentProject.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 size={18} />
                        Delete Project
                      </button>
                    </div>
                  </div>
                )}

                {/* Chapters Tab */}
                {activeTab === 'chapters' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Chapters</h3>
                      <button
                        onClick={() => {
                          setEditingChapter(null);
                          setShowChapterModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus size={18} />
                        Add Chapter
                      </button>
                    </div>

                    <div className="space-y-3">
                      {projectChapters.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No chapters yet. Click "Add Chapter" to get started.
                        </div>
                      ) : (
                        projectChapters.map((chapter, index) => {
                          const prevChapters = projectChapters.slice(0, index);
                          return (
                            <ChapterItem
                              key={chapter.id}
                              chapter={chapter}
                              project={currentProject}
                              previousChapters={prevChapters}
                              onUpdate={loadData}
                              onDelete={handleDeleteChapter}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Research Tab */}
                {activeTab === 'research' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Research Sources</h3>
                      <button
                        onClick={() => setShowResearchModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Search size={18} />
                        New Research
                      </button>
                    </div>

                    <div className="space-y-3">
                      {projectSources.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          No research sources yet. Click "New Research" to start.
                        </div>
                      ) : (
                        projectSources.map(source => (
                          <div key={source.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-800">{source.topic}</h4>
                              <button
                                onClick={(e) => handleDeleteSource(source.id, e)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap font-serif max-h-60 overflow-y-auto">
                              {source.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(source.added_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!currentProject && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Book size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to AI Book Generator</h2>
            <p className="text-gray-600 mb-6">
              Create your first project to start generating professional technical books with AI.
            </p>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowProjectModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Your First Project
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        project={editingProject}
      />

      <ChapterFormModal
        isOpen={showChapterModal}
        onClose={() => {
          setShowChapterModal(false);
          setEditingChapter(null);
        }}
        onSave={handleSaveChapter}
        projectId={selectedProject}
        chapter={editingChapter}
        maxOrder={projectChapters.length > 0 ? Math.max(...projectChapters.map(c => c.order_num)) : 0}
      />

      <ResearchModal
        isOpen={showResearchModal}
        onClose={() => setShowResearchModal(false)}
        onSave={handleSaveResearch}
        projectId={selectedProject}
      />
    </div>
  );
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
