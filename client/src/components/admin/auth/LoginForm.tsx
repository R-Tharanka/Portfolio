import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../../../services/api';

interface LoginFormProps {
  onLogin: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await login(formData);
      if (response.error) {
        setError(response.error);
      } else {
        onLogin(response.data.token);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border border-border/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-foreground/70 mt-2">Enter your credentials to access the dashboard</p>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground/80 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? 'bg-primary/70 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            } text-white`}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-primary hover:text-primary-dark hover:underline transition-all"
            >
              Forgot username or password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
