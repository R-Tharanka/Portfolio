import React, { useState, useEffect } from 'react';
import { getContactMessages, deleteContactMessage, markMessageAsRead, toggleMessageReadStatus } from '../../../services/api';
import { Loader2, Trash2, X, Circle, CheckCircle2 } from 'lucide-react';
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
          <button
            onClick={onClose}
            className="text-foreground/70 hover:text-foreground"
            aria-label="Close dialog"
          >
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
  onMessagesUpdate?: () => void; // Callback to notify parent when messages are updated
}

interface ContactMessage {
  _id: string;
  id?: string; // Optional field for compatibility
  name: string;
  email: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;  // Added read property
}

const ContactAdmin: React.FC<ContactAdminProps> = ({ token }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]); // New state for bulk actions
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false); // New loading state for bulk actions

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

  const handleMessageSelect = async (message: ContactMessage) => {
    setSelectedMessage(message);

    // If the message is unread, mark it as read
    if (!message.read) {
      try {
        const response = await markMessageAsRead(message._id, token || '');
        if (response.error) {
          console.error('Failed to mark message as read:', response.error);
        } else {
          // Update the read status in the messages list
          setMessages(prev =>
            prev.map(msg =>
              msg._id === message._id ? { ...msg, read: true } : msg
            )
          );
          // Also update the selected message
          setSelectedMessage(prev => prev ? { ...prev, read: true } : prev);
        }
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  // Function to toggle read/unread status
  const toggleReadStatus = async (message: ContactMessage) => {
    try {
      const newReadStatus = !message.read;
      const response = await toggleMessageReadStatus(message._id, newReadStatus, token || '');

      if (response.error) {
        toast.error(`Failed to mark message as ${newReadStatus ? 'read' : 'unread'}`);
        return;
      }

      // Update the message in our local state
      setMessages(prev =>
        prev.map(msg =>
          msg._id === message._id ? { ...msg, read: newReadStatus } : msg
        )
      );

      // If this is the currently selected message, update that too
      if (selectedMessage && selectedMessage._id === message._id) {
        setSelectedMessage({ ...selectedMessage, read: newReadStatus });
      }

      toast.success(`Message marked as ${newReadStatus ? 'read' : 'unread'}`);
    } catch (err: any) {
      console.error('Error toggling read status:', err);
      toast.error(err.message || 'An error occurred');
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

  // Function to handle checking a message for bulk actions
  const handleMessageCheckboxChange = (messageId: string) => {
    setSelectedMessageIds(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // Function to select/deselect all displayed messages
  const handleSelectAllMessages = () => {
    const filteredMessageIds = messages
      .filter(message => {
        if (filter === 'all') return true;
        return filter === 'read' ? message.read : !message.read;
      })
      .map(message => message._id);

    if (selectedMessageIds.length === filteredMessageIds.length) {
      // If all are selected, deselect all
      setSelectedMessageIds([]);
    } else {
      // Otherwise select all filtered messages
      setSelectedMessageIds(filteredMessageIds);
    }
  };

  // Function to mark multiple messages as read/unread
  const handleBulkReadStatus = async (markAsRead: boolean) => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      toast.error('Authentication token missing. Please log in again.');
      return;
    }

    if (selectedMessageIds.length === 0) {
      toast.info(`No messages selected to mark as ${markAsRead ? 'read' : 'unread'}`);
      return;
    }

    setIsBulkActionLoading(true);
    try {
      // Create array of promises for each message status update
      const updatePromises = selectedMessageIds.map(id =>
        toggleMessageReadStatus(id, markAsRead, token)
      );

      await Promise.all(updatePromises);

      // Update the messages in the state
      setMessages(prev =>
        prev.map(message =>
          selectedMessageIds.includes(message._id)
            ? { ...message, read: markAsRead }
            : message
        )
      );

      // If the currently selected message is in the list, update it too
      if (selectedMessage && selectedMessageIds.includes(selectedMessage._id)) {
        setSelectedMessage({ ...selectedMessage, read: markAsRead });
      }

      toast.success(`${selectedMessageIds.length} messages marked as ${markAsRead ? 'read' : 'unread'}`);

      // Clear selection after the operation
      setSelectedMessageIds([]);
    } catch (err: any) {
      console.error(`Error marking messages as ${markAsRead ? 'read' : 'unread'}:`, err);
      toast.error(err.message || `An error occurred while marking messages as ${markAsRead ? 'read' : 'unread'}`);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Function to handle bulk delete
  const handleBulkDelete = async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      toast.error('Authentication token missing. Please log in again.');
      return;
    }

    if (selectedMessageIds.length === 0) {
      toast.info('No messages selected for deletion');
      return;
    }

    setIsBulkActionLoading(true);
    try {
      // Perform deletion for each selected message
      const deletePromises = selectedMessageIds.map(id => deleteContactMessage(id, token));
      await Promise.all(deletePromises);

      // Filter out the deleted messages from the state
      setMessages(prev => prev.filter(message => !selectedMessageIds.includes(message._id)));

      // If the currently selected message is deleted, clear the selection
      if (selectedMessage && selectedMessageIds.includes(selectedMessage._id)) {
        setSelectedMessage(null);
      }

      toast.success('Selected messages deleted successfully!');

      // Clear selection after deletion
      setSelectedMessageIds([]);
    } catch (err: any) {
      console.error('Error deleting messages:', err);
      toast.error(err.message || 'An error occurred while deleting messages');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // UI component for bulk actions toolbar - can be reused in other places
  const BulkActionTools: React.FC<{
    selectedIds: string[];
    onMarkAsRead: () => Promise<void>;
    onMarkAsUnread: () => Promise<void>;
    onDelete: () => Promise<void>;
    isLoading: boolean;
  }> = ({ selectedIds, onMarkAsRead, onMarkAsUnread, onDelete, isLoading }) => {
    return (
      <div className="p-3 mb-4 bg-primary/10 border border-primary/30 rounded-lg flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">
          {selectedIds.length} {selectedIds.length === 1 ? 'message' : 'messages'} selected
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            onClick={onMarkAsRead}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded flex items-center text-xs gap-1 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="w-2 h-2 bg-white rounded-full opacity-60"></span>
            Mark as Read
          </button>
          <button
            onClick={onMarkAsUnread}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded flex items-center text-xs gap-1 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="w-2 h-2 bg-white rounded-full opacity-100"></span>
            Mark as Unread
          </button>
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="px-3 py-1 bg-red-500 text-white rounded flex items-center text-xs gap-1 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Delete Selected
          </button>
        </div>
      </div>
    );
  };

  // Get filtered messages based on current filter
  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    return filter === 'read' ? message.read : !message.read;
  });

  // Calculate message statistics
  const totalMessages = messages.length;
  const unreadCount = messages.filter(m => !m.read).length;
  const readCount = totalMessages - unreadCount;

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Contact Messages</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{unreadCount} Unread</span>
            <span className="text-xs px-2 py-1 bg-foreground/10 text-foreground/70 rounded-full">{readCount} Read</span>
          </div>
        </div>
      </div>
      {error && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {selectedMessageIds.length > 0 && (
        <BulkActionTools
          selectedIds={selectedMessageIds}
          onMarkAsRead={() => handleBulkReadStatus(true)}
          onMarkAsUnread={() => handleBulkReadStatus(false)}
          onDelete={handleBulkDelete}
          isLoading={isBulkActionLoading}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Messages list */}
          <div className="md:col-span-1 border-r border-border/30 pr-4">
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium text-foreground/70 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary border-border rounded cursor-pointer"
                  checked={filteredMessages.length > 0 && selectedMessageIds.length === filteredMessages.length}
                  onChange={handleSelectAllMessages}
                  aria-label="Select all messages"
                />
                <span>{messages.length} {messages.length === 1 ? 'Message' : 'Messages'}</span>
                {messages.filter(m => !m.read).length > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {messages.filter(m => !m.read).length} unread
                  </span>
                )}
              </div>

              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="bg-background border border-border/50 rounded px-2 py-1 text-sm"
                  aria-label="Filter messages"
                  title="Filter messages"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-12 text-foreground/60">
                No messages yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {filteredMessages.map(message => (
                  <div
                    key={message._id}
                    className={`p-4 rounded-lg border transition-all flex flex-col gap-2 ${selectedMessage?._id === message._id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background border-border'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-primary border-border rounded cursor-pointer"
                        checked={selectedMessageIds.includes(message._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleMessageCheckboxChange(message._id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select message from ${message.name}`}
                      />
                      <div className="flex-1 cursor-pointer" onClick={() => handleMessageSelect(message)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-foreground">{message.title}</p>
                            <p className="text-xs text-foreground/70">{message.name} - {formatDate(message.createdAt)}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(message._id); }}
                              className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
                              aria-label="Delete message"
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs mt-2">
                          <span className={`px-3 py-1 rounded-full font-semibold ${message.read ? 'bg-foreground/10 text-foreground/70' : 'bg-primary/10 text-primary'}`}>
                            {message.read ? 'Read' : 'Unread'}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleReadStatus(message); }}
                            className="ml-auto px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-semibold hover:bg-primary transition-colors"
                            aria-label={message.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {message.read ? 'Mark as Unread' : 'Mark as Read'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message details panel */}
          <div className="md:col-span-2 pl-4">
            {selectedMessage ? (
              <div className="bg-background p-4 rounded-lg shadow-md border border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedMessage.title}</h3>
                    <p className="text-sm text-foreground/70">{selectedMessage.name} - {formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(selectedMessage._id); }}
                      className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full font-semibold text-xs ${selectedMessage.read ? 'bg-foreground/10 text-foreground/70' : 'bg-primary/10 text-primary'}`}>
                      {selectedMessage.read ? 'Read' : 'Unread'}
                    </span>
                    <span className="text-xs text-foreground/70">
                      {selectedMessage.email}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex-1 px-4 py-2 rounded-md bg-foreground/80 text-white text-sm font-semibold hover:bg-foreground/70 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Message
                  </button>
                  <button
                    onClick={() => toggleReadStatus(selectedMessage)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${selectedMessage.read
                      ? 'bg-primary/80 hover:bg-primary/70 text-white'
                      : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                  >
                    {selectedMessage.read
                      ? <><Circle className="h-4 w-4" /> Mark as Unread</>
                      : <><CheckCircle2 className="h-4 w-4" /> Mark as Read</>
                    }
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-foreground/60">
                Select a message to view details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={confirmDelete}
        message={selectedMessage}
      />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
    </div>
  );
};

export default ContactAdmin;
