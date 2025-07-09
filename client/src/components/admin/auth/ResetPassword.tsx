import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword, verifyResetToken } from '../../../services/api';

// Get password reset expiry from environment variable (in minutes)
const passwordResetExpiry = import.meta.env.VITE_PASSWORD_RESET_EXPIRY || '15';

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token');
        setIsTokenValid(false);
        setTokenChecked(true);
        return;
      }
      
      try {
        const response = await verifyResetToken(token);
        if (response.error) {
          setError(response.error);
          setIsTokenValid(false);
        } else {
          setIsTokenValid(true);
        }
      } catch (err) {
        console.error('Token validation failed:', err);
        setError('Failed to validate reset token. It may be expired or invalid.');
        setIsTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    };
    
    validateToken();
  }, [token]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Validate password strength
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await resetPassword(token as string, formData.newPassword);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        // Reset form
        setFormData({
          newPassword: '',
          confirmPassword: '',
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 3000);
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!tokenChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border border-border/50 text-center">
          <div className="animate-pulse">
            <div className="h-6 w-3/4 mx-auto bg-primary/20 rounded mb-4"></div>
            <div className="h-4 w-1/2 mx-auto bg-primary/10 rounded"></div>
          </div>
          <p className="mt-4 text-foreground/70">Validating reset link...</p>
        </div>
      </div>
    );
  }
  
  if (isTokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border border-border/50">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-red-500">Invalid Reset Link</h1>
            <p className="text-foreground/70 mt-2">
              This password reset link is invalid or has expired.
              <span className="block text-xs mt-1">
                Reset links are valid for {passwordResetExpiry} minutes only.
              </span>
            </p>
          </div>
          
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error || "The reset link is no longer valid. Please request a new password reset link."}
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border border-border/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-foreground/70 mt-2">Enter your new password</p>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
            Password reset successful! You will be redirected to the login page.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground/80 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={success}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-foreground/60">
              Must be at least 8 characters
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={success}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || success}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isSubmitting || success
                ? 'bg-primary/70 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark'
            } text-white`}
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-sm text-foreground/70 hover:text-foreground hover:underline transition-all"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
