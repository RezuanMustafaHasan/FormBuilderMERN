import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formService } from '../services/api';
import { Card, Button, Modal, Input, Textarea } from '../components/UI';

const Dashboard = ({ user, showToast }) => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadForms();
    }
  }, [user]);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const userId = user._id || user.id;
      const data = await formService.getMyForms(userId);
      setForms(data);
    } catch (error) {
      console.error(error);
      showToast('Failed to load forms', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateForm = async (e) => {
    e.preventDefault();
    try {
      const userId = user._id || user.id;
      const newForm = await formService.createForm(userId, newTitle, newDesc);
      setIsCreateModalOpen(false);
      navigate(`/builder/${newForm._id || newForm.id}`);
      showToast('Form created!', 'success');
    } catch (error) {
      showToast('Failed to create form', 'error');
    }
  };

  const handleDeleteForm = async (id) => {
    if (confirm('Are you sure you want to delete this form? All responses will be lost.')) {
      try {
        await formService.deleteForm(id);
        loadForms();
        showToast('Form deleted', 'success');
      } catch (error) {
        showToast('Failed to delete form', 'error');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Forms</h1>
          <p className="text-slate-500 mt-1">Manage and track your form responses</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Create New Form
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : forms.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No forms yet</h3>
          <p className="text-slate-500 mb-6">Create your first form to start collecting data.</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Form</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Card key={form._id || form.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${form.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {form.isPublished ? 'Published' : 'Draft'}
                  </div>
                  <button onClick={() => handleDeleteForm(form._id || form.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">{form.title}</h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 min-h-[2.5rem]">{form.description}</p>
                <div className="flex gap-2">
                  <Link to={`/builder/${form._id || form.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Edit</Button>
                  </Link>
                  <Link to={`/responses/${form._id || form.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">Results</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="Create New Form"
      >
        <form onSubmit={handleCreateForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Form Title</label>
            <Input 
              required 
              placeholder="e.g., Customer Feedback" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <Textarea 
              placeholder="What is this form for?" 
              value={newDesc} 
              onChange={e => setNewDesc(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Form</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
