
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formService } from '../services/api';
import { Button, Card } from '../components/UI';
import { QuestionType } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import * as XLSX from 'xlsx';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981', '#06b6d4'];

const ResponsesView = ({ user, publicView, showToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const formData = await formService.getFormById(id);
      if (!formData) {
        navigate('/');
        return;
      }

      if (publicView && !formData.allowPublicResponsesView) {
        showToast('Public results are disabled for this form.', 'error');
        navigate(`/f/${id}`);
        return;
      }

      // Check ownership if not public view
      if (!publicView) {
         const userId = user?._id || user?.id;
         if (formData.ownerId !== userId) {
            navigate('/dashboard');
            return;
         }
      }

      const questionData = await formService.getQuestions(id);
      const responseData = await formService.getFullResponses(id);
      
      setForm(formData);
      setQuestions(questionData);
      setResponses(responseData);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      navigate('/');
    }
  };

  const exportToExcel = () => {
    if (!form || responses.length === 0) return;

    const data = responses.map(r => {
      const row = {
        'Submitted At': new Date(r.submittedAt).toLocaleString(),
        'Response ID': r._id || r.id
      };
      questions.forEach(q => {
        const qId = q._id || q.id;
        const answer = r.answers.find(a => a.questionId === qId);
        row[q.label] = Array.isArray(answer?.value) ? answer.value.join(', ') : answer?.value || '';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
    XLSX.writeFile(workbook, `${form.title.replace(/\s+/g, '_')}_Responses.xlsx`);
    showToast('Exported successfully!', 'success');
  };

  const stats = useMemo(() => {
    return questions.map(q => {
      const qId = q._id || q.id;
      const answers = responses.map(r => r.answers.find(a => a.questionId === qId)?.value).filter(v => v !== undefined);
      
      const counts = {};
      answers.forEach(val => {
        if (Array.isArray(val)) {
          val.forEach(v => counts[v] = (counts[v] || 0) + 1);
        } else {
          counts[val] = (counts[val] || 0) + 1;
        }
      });

      const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
      return { question: q, data };
    });
  }, [questions, responses]);

  if (isLoading || !form) return <div className="p-20 text-center">Loading responses...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">{form.title}</h1>
          <p className="text-slate-500 mt-1">{responses.length} {responses.length === 1 ? 'Response' : 'Responses'}</p>
        </div>
        {!publicView && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportToExcel} disabled={responses.length === 0}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export Excel
            </Button>
            <Button onClick={() => navigate(`/builder/${form._id || form.id}`)}>Edit Form</Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        {['summary', 'table'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {responses.length === 0 ? (
        <Card className="p-20 text-center">
          <div className="text-6xl mb-4">⌛</div>
          <h3 className="text-2xl font-bold text-slate-900">Waiting for responses</h3>
          <p className="text-slate-500 mt-2">No data to display yet.</p>
        </Card>
      ) : activeTab === 'summary' ? (
        <div className="space-y-8">
          {stats.map((item, idx) => (
            <Card key={idx} className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">{item.question.label}</h3>
              
              {[QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT, QuestionType.EMAIL].includes(item.question.type) ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {responses.map((r, rIdx) => {
                    const qId = item.question._id || item.question.id;
                    const ans = r.answers.find(a => a.questionId === qId);
                    if (!ans?.value) return null;
                    return (
                      <div key={rIdx} className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm border border-slate-100">
                        {ans.value}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {item.question.type === QuestionType.MULTIPLE_CHOICE || item.question.type === QuestionType.DROPDOWN ? (
                      <PieChart>
                        <Pie
                          data={item.data}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {item.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    ) : (
                      <BarChart data={item.data} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]}>
                          {item.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase sticky left-0 bg-slate-50 shadow-sm">Submitted At</th>
                {questions.map(q => (
                  <th key={q._id || q.id} className="p-4 text-xs font-bold text-slate-500 uppercase min-w-[200px]">{q.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-500 sticky left-0 bg-white group-hover:bg-slate-50 whitespace-nowrap shadow-sm">
                    {new Date(r.submittedAt).toLocaleString()}
                  </td>
                  {questions.map(q => {
                    const qId = q._id || q.id;
                    const ans = r.answers.find(a => a.questionId === qId);
                    return (
                      <td key={qId} className="p-4 text-sm text-slate-700">
                        {Array.isArray(ans?.value) ? (
                          <div className="flex flex-wrap gap-1">
                            {ans.value.map((v, i) => (
                              <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{v}</span>
                            ))}
                          </div>
                        ) : ans?.value || <span className="text-slate-300 italic">No response</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default ResponsesView;
