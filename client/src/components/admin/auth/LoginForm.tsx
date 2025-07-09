import React, { useState } from 'react';
import { login } from '../../../services/api';

interface LoginFormProps {
  onLogin: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError(null);
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
        
        {showForgotPassword ? (
          <ForgotPasswordForm onBack={toggleForgotPassword} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>            <label htmlFor="username" className="block text-sm font-medium text-foreground/80 mb-1">
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
              <button
                type="button"
                onClick={toggleForgotPassword}
                className="text-sm text-primary hover:text-primary-dark hover:underline transition-all"
              >
                Forgot username or password?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // We'll implement this API call later
      const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/auth/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to request password reset');
      } else {
        setSuccess('If this email exists in our system, you will receive a password reset link shortly.');
        setEmail('');
      }
    } catch (err) {
      console.error('Password reset request failed:', err);
      setError('Failed to request password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
            Recovery Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="admin@example.com"
          />
          <p className="mt-2 text-xs text-foreground/60">
            Enter the email address associated with your admin account.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !!success}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isSubmitting || success
              ? 'bg-primary/70 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark'
          } text-white`}
        >
          {isSubmitting ? 'Processing...' : 'Send Reset Link'}
        </button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-foreground/70 hover:text-foreground hover:underline transition-all"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
