import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../../../services/api';
import { Mail } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage({
          text: 'Please enter a valid email address',
          type: 'error'
        });
        setIsSubmitting(false);
        return;
      }
      
      const response = await requestPasswordReset(email);
      
      if (response.error) {
        setMessage({
          text: response.error,
          type: 'error'
        });
      } else {
        setMessage({
          text: 'If an account with this email exists, a password reset link has been sent.',
          type: 'success'
        });
        // Clear email field after successful submission
        setEmail('');
      }
    } catch (err) {
      console.error('Password reset request failed:', err);
      setMessage({
        text: 'An error occurred. Please try again later.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border border-border/50">
        <div className="text-center mb-6">
          <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
          <p className="text-foreground/70 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        {message && (
          <div className={`p-3 mb-4 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-500' 
              : 'bg-red-500/10 border border-red-500/30 text-red-500'
          } rounded-lg text-sm`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Enter your email"
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
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </button>
          
          <div className="text-center">
            <Link
              to="/admin"
              className="text-sm text-foreground/70 hover:text-foreground hover:underline transition-all"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
