import React, { useState } from 'react';
import { updateCredentials } from '../../../services/api';

interface AccountSettingsProps {
  onCredentialsUpdated: (newToken: string) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onCredentialsUpdated }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }

    if (!formData.newUsername && !formData.newPassword) {
      setError('Please provide either a new username or password');
      return false;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await updateCredentials(
        {
          currentPassword: formData.currentPassword,
          newUsername: formData.newUsername || undefined,
          newPassword: formData.newPassword || undefined
        }, 
        token
      );
      
      if (response.error) {
        setError(response.error);
      } else {
        onCredentialsUpdated(response.data.token);
        setSuccess('Credentials updated successfully!');
        
        // Reset form
        setFormData({
          currentPassword: '',
          newUsername: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Failed to update credentials:', err);
      setError('Failed to update credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      
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
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
            Current Password *
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter current password"
          />
        </div>
        
        <div>
          <label htmlFor="newUsername" className="block text-sm font-medium mb-1">
            New Username (optional)
          </label>
          <input
            type="text"
            id="newUsername"
            name="newUsername"
            value={formData.newUsername}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter new username"
          />
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
            New Password (optional)
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter new password"
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Confirm new password"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            isSubmitting
              ? 'bg-primary/70 cursor-not-allowed'
              : 'bg-primary hover:bg-primary-dark'
          } text-white mt-4`}
        >
          {isSubmitting ? 'Updating...' : 'Update Credentials'}
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;
