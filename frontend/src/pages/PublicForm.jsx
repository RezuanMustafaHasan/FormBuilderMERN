
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formService } from '../services/api';
import { Card, Button, Input, Textarea } from '../components/UI';
import { QuestionType } from '../constants';

const PublicForm = ({ showToast }) => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const formData = await formService.getFormById(id);
      if (!formData || (!formData.isPublished && !formData.title)) { // Handle unpublished or not found
         // Note: API might return 404 which throws, or return null
         // If API throws, catch block handles it.
         // If unpublished, we might want to show error unless owner? 
         // But this is Public view.
         if (formData && !formData.isPublished) {
           // We might still allow loading but show "Not Published" UI?
           // Original code: if (!formData || !formData.isPublished) setIsLoading(false); return;
         }
      }
      
      if (!formData) {
        setIsLoading(false);
        return;
      }

      if (!formData.isPublished) {
        setIsLoading(false);
        // We will handle the "Form Not Found" UI below
        return;
      }

      const questionData = await formService.getQuestions(id);
      setForm(formData);
      setQuestions(questionData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleCheckboxChange = (qId, option, checked) => {
    const current = answers[qId] || [];
    const updated = checked 
      ? [...current, option] 
      : current.filter(o => o !== option);
    handleInputChange(qId, updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    // Basic required validation
    const missing = questions.filter(q => q.required && !answers[q._id || q.id]);
    if (missing.length > 0) {
      showToast(`Please answer all required questions: ${missing[0].label}`, 'error');
      return;
    }

    setIsSubmitting(true);
    // await new Promise(r => setTimeout(r, 1000)); // Simulate delay if needed
    try {
      // Pass a dummy userId or null for anonymous
      await formService.submitResponse(form._id || form.id, answers, null);
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Form submitted successfully!', 'success');
    } catch (error) {
      setIsSubmitting(false);
      showToast('Failed to submit form', 'error');
    }
  };

  if (isLoading) return <div className="p-20 text-center">Loading form...</div>;

  if (!form) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🚫</div>
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Form Not Found</h2>
      <p className="text-slate-500 mb-8">This form might have been unpublished or deleted.</p>
      <Link to="/"><Button>Back Home</Button></Link>
    </div>
  );

  if (isSubmitted) return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <Card className="p-10 text-center border-t-8 border-emerald-500">
        <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 text-3xl">✓</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Response Recorded</h2>
        <p className="text-slate-500 mb-10">Your response has been successfully submitted. Thank you!</p>
        <div className="flex flex-col gap-3">
          {form.allowMultipleSubmissions && (
            <Button onClick={() => { setAnswers({}); setIsSubmitted(false); }}>Submit another response</Button>
          )}
          {form.allowPublicResponsesView && (
            <Link to={`/f/${form._id || form.id}/responses`}>
              <Button variant="secondary" className="w-full">View Public Results</Button>
            </Link>
          )}
          <p className="mt-8 text-xs text-slate-400">Powered by FormFlow</p>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen py-10 lg:py-20 px-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <Card className="p-8 border-t-8 border-indigo-600">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{form.title}</h1>
          <p className="text-slate-600 whitespace-pre-wrap">{form.description}</p>
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-red-500 font-semibold">* Required</span>
            {form.allowPublicResponsesView && (
              <Link to={`/f/${form._id || form.id}/responses`} className="text-xs text-indigo-600 hover:underline">
                View current results
              </Link>
            )}
          </div>
        </Card>

        {questions.map((q) => {
          const qId = q._id || q.id;
          return (
          <Card key={qId} className="p-8">
            <label className="block text-lg font-bold text-slate-900 mb-2">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            {q.helpText && <p className="text-sm text-slate-500 mb-4">{q.helpText}</p>}
            
            <div className="mt-4">
              {q.type === QuestionType.SHORT_TEXT && (
                <Input 
                  required={q.required} 
                  value={answers[qId] || ''} 
                  onChange={e => handleInputChange(qId, e.target.value)} 
                  placeholder="Your answer"
                />
              )}
              {q.type === QuestionType.LONG_TEXT && (
                <Textarea 
                  required={q.required} 
                  value={answers[qId] || ''} 
                  onChange={e => handleInputChange(qId, e.target.value)} 
                  placeholder="Your answer"
                />
              )}
              {q.type === QuestionType.MULTIPLE_CHOICE && (
                <div className="space-y-3">
                  {q.options?.map(opt => (
                    <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name={qId} 
                        value={opt}
                        checked={answers[qId] === opt}
                        onChange={e => handleInputChange(qId, e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === QuestionType.CHECKBOXES && (
                <div className="space-y-3">
                  {q.options?.map(opt => (
                    <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={(answers[qId] || []).includes(opt)}
                        onChange={e => handleCheckboxChange(qId, opt, e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600"
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.type === QuestionType.DATE && (
                <Input 
                  type="date" 
                  value={answers[qId] || ''} 
                  onChange={e => handleInputChange(qId, e.target.value)} 
                />
              )}
              {q.type === QuestionType.NUMBER && (
                <Input 
                  type="number" 
                  value={answers[qId] || ''} 
                  onChange={e => handleInputChange(qId, e.target.value)} 
                  placeholder="0"
                />
              )}
              {q.type === QuestionType.EMAIL && (
                <Input 
                  type="email" 
                  value={answers[qId] || ''} 
                  onChange={e => handleInputChange(qId, e.target.value)} 
                  placeholder="example@email.com"
                />
              )}
               {q.type === QuestionType.DROPDOWN && (
                <select
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={answers[qId] || ''}
                  onChange={e => handleInputChange(qId, e.target.value)}
                  required={q.required}
                >
                  <option value="">Select an option</option>
                  {q.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          </Card>
          );
        })}

        <div className="flex justify-between items-center pt-6">
          <p className="text-xs text-slate-400">Never submit passwords through FormFlow.</p>
          <Button size="lg" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PublicForm;
