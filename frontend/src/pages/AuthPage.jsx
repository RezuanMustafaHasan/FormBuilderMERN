import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Input, Button } from '../components/UI';
import { authService } from '../services/api';

const AuthPage = ({ type, onLogin, showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === 'signup') {
        const newUser = await authService.signup(name, email, password);
        onLogin(newUser);
        showToast('Account created successfully!', 'success');
      } else {
        const user = await authService.login(email);
        onLogin(user);
        showToast('Welcome back!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 mt-2">
            {type === 'login' ? 'Enter your details to sign in' : 'Start building forms for free today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <Input 
                required 
                placeholder="John Doe" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <Input 
              required 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <Input 
              required 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : (type === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <Link 
              to={type === 'login' ? '/signup' : '/login'} 
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              {type === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
