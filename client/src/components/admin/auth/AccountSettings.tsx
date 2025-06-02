import React, { useState } from 'react';
import { updateCredentials } from '../../../services/api';
import { Lock, User, KeyRound, Save, AlertCircle, CheckCircle, Shield, Clock, Fingerprint } from 'lucide-react';

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
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-card shadow-lg rounded-xl border border-border/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <KeyRound className="h-6 w-6" />
                            Account Security
                        </h2>
                        <p className="text-white/80 mt-1">Update your credentials and keep your account secure</p>
                    </div>

                    <div className="p-6">
                        {error && (
                            <div className="p-4 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="p-4 mb-6 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-green-500 text-sm">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <h3 className="text-lg font-semibold text-foreground/90 border-b border-border pb-2">
                                    Authentication Details
                                </h3>

                                <div className="relative">
                                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1 text-foreground/80">
                                        Current Password *
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Enter your current password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="newUsername" className="block text-sm font-medium mb-1 text-foreground/80">
                                        New Username (optional)
                                    </label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            id="newUsername"
                                            name="newUsername"
                                            value={formData.newUsername}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Enter new username"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-foreground/60">Leave blank to keep your current username</p>
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1 text-foreground/80">
                                        New Password (optional)
                                    </label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-foreground/60">Minimum 6 characters</p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-foreground/80">
                                        Confirm New Password
                                    </label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isSubmitting
                                            ? 'bg-primary/70 cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary-dark'
                                        } text-white`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5" />
                                            Update Credentials
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="bg-card shadow-lg rounded-xl border border-border/50 p-6">
                    <h3 className="text-lg font-semibold text-foreground/90 border-b border-border pb-2 mb-4">
                        Security Tips
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-primary flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Strong Password
                            </h4>
                            <p className="text-sm text-foreground/70 mt-1">
                                Use a combination of uppercase, lowercase, numbers, and special characters.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-primary flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Regular Updates
                            </h4>
                            <p className="text-sm text-foreground/70 mt-1">
                                Change your password periodically to maintain security.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-primary flex items-center gap-2">
                                <Fingerprint className="h-4 w-4" />
                                Unique Credentials
                            </h4>
                            <p className="text-sm text-foreground/70 mt-1">
                                Avoid using the same password across multiple websites or services.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium text-primary flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Confidentiality
                            </h4>
                            <p className="text-sm text-foreground/70 mt-1">
                                Never share your login credentials with anyone else.
                            </p>
                        </div>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4 mt-6 border border-border/70">
                        <p className="text-xs text-foreground/60">
                            After updating your credentials, you will remain logged in with your new details.
                            Your session token will be refreshed automatically.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
