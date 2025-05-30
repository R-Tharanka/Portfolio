import React, { useState, useEffect } from 'react';
import { getContactMessages, deleteContactMessage } from '../../../services/api';
import { Loader2, Trash2, Mail, Calendar, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Simple Dialog component for delete confirmation
const DeleteConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  message: ContactMessage | null 
}) => {
  if (!isOpen || !message) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Confirm Deletion</h3>
          <button onClick={onClose} className="text-foreground/70 hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="mb-2">Are you sure you want to delete this message?</p>
          <div className="bg-background/50 p-2 rounded">
            <p className="font-medium">{message.title}</p>
            <p className="text-sm text-foreground/70">{message.name}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-background"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface ContactAdminProps {
  token: string | null;
}

interface ContactMessage {
  _id: string;
  id?: string; // Optional field for compatibility
  name: string;
  email: string;
  title: string;
  message: string;
  createdAt: string;
}

const ContactAdmin: React.FC<ContactAdminProps> = ({ token }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch contact messages
  useEffect(() => {
  const fetchMessages = async () => {
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        toast.error('Authentication token is missing. Please log in again.');
        return;
      }

      setLoading(true);
      try {
        const response = await getContactMessages(token);
        if (response.error) {
          setError(response.error);
          toast.error(`Failed to load messages: ${response.error}`);
        } else {
          setMessages(response.data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch contact messages:', err);
        setError('Failed to load contact messages.');
        toast.error(err.message || 'Failed to load contact messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [token]);
  const handleDelete = async (messageId: string) => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      toast.error('Authentication token missing. Please log in again.');
      return;
    }

    // Find the message to delete (if not already selected)
    const messageToDelete = messages.find(message => message._id === messageId);
    if (!messageToDelete) {
      toast.error('Message not found');
      return;
    }
    
    setIsDialogOpen(true);
    // If clicking delete button in the detail view, we already have the selectedMessage
    if (selectedMessage?._id !== messageId) {
      setSelectedMessage(messageToDelete);
    }
  };
  const confirmDelete = async () => {
    if (!token || !selectedMessage) return;

    setLoading(true);
    try {
      const response = await deleteContactMessage(selectedMessage._id, token);
      if (response.error) {
        setError(response.error);
        toast.error(`Failed to delete: ${response.error}`);
      } else {
        // Remove message from list
        setMessages(prev => prev.filter(message => message._id !== selectedMessage._id));
        toast.success('Message deleted successfully!');
      }
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message. Please try again.');
      toast.error(err.message || 'Failed to delete message');
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border/50">
      <h2 className="text-xl font-bold mb-6">Contact Messages</h2>

      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Messages list */}
          <div className="md:col-span-1 border-r border-border/30 pr-4">
            <div className="mb-4 font-medium text-foreground/70">
              {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 text-foreground/60">
                No messages yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {messages.map(message => (
                  <div
                    key={message._id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedMessage?._id === message._id
                      ? 'bg-primary/10 border-primary/30'
                      : 'hover:bg-background border-transparent'
                      } border`}
                  >
                    <div className="font-medium truncate">{message.name}</div>
                    <div className="text-sm text-foreground/70 truncate">{message.title}</div>
                    <div className="text-xs text-foreground/60 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message details */}
          <div className="md:col-span-2 pl-0 md:pl-4">
            {selectedMessage ? (
              <div>
                <div className="bg-background p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{selectedMessage.title}</h3>                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(selectedMessage._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{selectedMessage.name}</span>
                  </div>

                  <div className="flex items-center gap-1 text-foreground/70 text-sm mb-4">
                    <Mail size={14} />
                    <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary">
                      {selectedMessage.email}
                    </a>
                  </div>

                  <div className="text-xs text-foreground/60 mb-4">
                    Received: {formatDate(selectedMessage.createdAt)}
                  </div>

                  <div className="bg-card p-4 rounded-lg border border-border/50">
                    <p className="whitespace-pre-line">{selectedMessage.message}</p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-1"
                    >
                      <Mail size={16} />
                      Reply
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-foreground/50">
                <Mail size={48} className="mb-4 opacity-20" />
                <p>Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notifications container */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      
      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={confirmDelete}
        message={selectedMessage}
      />
    </div>
  );
};

export default ContactAdmin;
