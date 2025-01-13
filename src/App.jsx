import React, { useState, useEffect } from 'react';
import { MessageSquare, LogIn, UserPlus, LogOut, Plus, Eye } from 'lucide-react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    country: '',
    company: '',
    questions: ['']
  });

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token, currentPage]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/submissions?page=${currentPage}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      setSubmissions(data.submissions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';
    
    try {
      const response = await fetch(`http://localhost:3000/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name
        }),
      });
      
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setFormData({
          username: '',
          password: '',
          name: '',
          country: '',
          company: '',
          questions: ['']
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSubmissions([]);
  };

  const handleSubmissionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          country: formData.country,
          company: formData.company,
          questions: formData.questions.filter(q => q.trim() !== '')
        }),
      });
      
      if (response.ok) {
        setShowSubmissionForm(false);
        fetchSubmissions();
        setFormData({
          ...formData,
          country: '',
          company: '',
          questions: ['']
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const addQuestionField = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, '']
    }));
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-8">
            <MessageSquare className="h-12 w-12 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isRegistering ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-1 text-indigo-600 hover:text-indigo-500"
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (viewingSubmission) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Interview Experience</h1>
            <button
              onClick={() => setViewingSubmission(null)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to List
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Company</h3>
                <p className="mt-1 text-sm text-gray-600">{viewingSubmission.company}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Country</h3>
                <p className="mt-1 text-sm text-gray-600">{viewingSubmission.country}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Interview Questions</h3>
                <ul className="mt-2 space-y-2">
                  {viewingSubmission.questions.map((question, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {index + 1}. {question}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Interview Experiences</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSubmissionForm(!showSubmissionForm)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5" />
              Share Experience
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showSubmissionForm ? (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Share Your Interview Experience</h3>
              <form onSubmit={handleSubmissionSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interview Questions</label>
                  {formData.questions.map((question, index) => (
                    <div key={index} className="mt-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [...formData.questions];
                          newQuestions[index] = e.target.value;
                          setFormData(prev => ({ ...prev, questions: newQuestions }));
                        }}
                        placeholder={`Question ${index + 1}`}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addQuestionField}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Add Question
                  </button>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <li key={submission._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {submission.company}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {submission.country} • {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setViewingSubmission(submission)}
                        className="inline-flex items-center gap-1 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;