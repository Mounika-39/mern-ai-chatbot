import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Send, 
  Plus, 
  Trash2, 
  Menu, 
  X, 
  MessageSquare, 
  User,
  Bot,
  Loader2,
  Edit2,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  LogOut,
  Settings,
  Moon,
  Sun,
  Bell,
  LogIn
} from "lucide-react";
import "./chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileView, setMobileView] = useState(window.innerWidth <= 768);
  
  // User profile data (shared across components)
  const [userProfile, setUserProfile] = useState({
    id: "user_1",
    name: "John Doe",
    email: "john.doe@example.com",
    username: "@johndoe",
    bio: "AI enthusiast & developer",
    location: "San Francisco, CA",
    website: "johndoe.com",
    phone: "+1 (555) 123-4567",
    birthday: "1995-06-15",
    avatar: null,
    joinDate: "2024-01-15",
    preferences: {
      language: "English",
      timezone: "PST (UTC-8)",
      dateFormat: "MM/DD/YYYY",
      theme: "dark"
    },
    social: {
      github: "johndoe",
      twitter: "johndoe",
      linkedin: "johndoe"
    },
    stats: {
      chats: 0,
      messages: 0,
      daysActive: 0
    },
    notifications: {
      unread: 3,
      settings: {
        email: true,
        push: true,
        desktop: false,
        sound: true
      }
    }
  });

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Check for mobile view on resize
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load all data from localStorage
  useEffect(() => {
    // Load sessions
    const storedSessions = localStorage.getItem("ai_chats");
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions);
        setSessions(parsed);
        if (parsed.length > 0) setActive(parsed[0]?.id);
      } catch (error) {
        console.error("Error parsing sessions:", error);
      }
    } else {
      // Create default welcome chat
      const defaultChat = {
        id: Date.now(),
        title: "Welcome Chat",
        messages: [
          {
            role: "bot",
            text: "Hello! I'm your AI assistant. How can I help you today?",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };
      setSessions([defaultChat]);
      setActive(defaultChat.id);
    }

    // Load user profile
    const storedProfile = localStorage.getItem("user_profile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setUserProfile(parsed);
      } catch (error) {
        console.error("Error parsing profile:", error);
      }
    }
  }, []);

  // Update stats when sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      const totalMessages = sessions.reduce((acc, session) => acc + session.messages.length, 0);
      const daysActive = userProfile.joinDate 
        ? Math.floor((Date.now() - new Date(userProfile.joinDate).getTime()) / (1000 * 60 * 60 * 24))
        : 1;

      const updatedProfile = {
        ...userProfile,
        stats: {
          chats: sessions.length,
          messages: totalMessages,
          daysActive: daysActive
        }
      };
      
      setUserProfile(updatedProfile);
      localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
    }
  }, [sessions]);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("ai_chats", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [sessions, loading]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingTitle && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTitle]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const newChat = () => {
    const chat = {
      id: Date.now(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [chat, ...prev]);
    setActive(chat.id);
    if (mobileView) {
      setSidebarOpen(false);
    }
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== id);
        if (filtered.length === 0) {
          const defaultChat = {
            id: Date.now(),
            title: "New Conversation",
            messages: [],
            createdAt: new Date().toISOString()
          };
          return [defaultChat];
        }
        return filtered;
      });
      
      if (active === id) {
        const remaining = sessions.filter(s => s.id !== id);
        setActive(remaining[0]?.id || null);
      }
    }
  };

  const startEditingTitle = (session, e) => {
    e.stopPropagation();
    setEditingTitle(session.id);
    setEditValue(session.title);
  };

  const saveTitle = (id) => {
    if (editValue.trim()) {
      setSessions(prev =>
        prev.map(s => s.id === id ? { ...s, title: editValue.trim() } : s)
      );
    }
    setEditingTitle(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");
    setLoading(true);

    setSessions(prev =>
      prev.map(s => {
        if (s.id !== active) return s;
        
        const newMessages = [...s.messages, { 
          role: "user", 
          text: userMessage,
          timestamp: new Date().toISOString()
        }];
        
        let title = s.title;
        if (s.messages.length === 0) {
          title = userMessage.length > 30 
            ? userMessage.slice(0, 30) + "..." 
            : userMessage;
        }
        
        return { ...s, title, messages: newMessages };
      })
    );

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: userMessage
      });

      setSessions(prev =>
        prev.map(s => {
          if (s.id !== active) return s;
          return {
            ...s,
            messages: [
              ...s.messages,
              { 
                role: "bot", 
                text: res.data.reply,
                timestamp: new Date().toISOString()
              }
            ]
          };
        })
      );
    } catch (error) {
      console.error("Error sending message:", error);
      
      setSessions(prev =>
        prev.map(s => {
          if (s.id !== active) return s;
          return {
            ...s,
            messages: [
              ...s.messages,
              { 
                role: "bot", 
                text: "Sorry, I'm having trouble connecting. Please try again.",
                error: true,
                timestamp: new Date().toISOString()
              }
            ]
          };
        })
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const copyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLike = (messageIndex) => {
    setLikedMessages(prev => ({
      ...prev,
      [messageIndex]: !prev[messageIndex]
    }));
    if (dislikedMessages[messageIndex]) {
      setDislikedMessages(prev => {
        const newState = { ...prev };
        delete newState[messageIndex];
        return newState;
      });
    }
  };

  const handleDislike = (messageIndex) => {
    setDislikedMessages(prev => ({
      ...prev,
      [messageIndex]: !prev[messageIndex]
    }));
    if (likedMessages[messageIndex]) {
      setLikedMessages(prev => {
        const newState = { ...prev };
        delete newState[messageIndex];
        return newState;
      });
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const clearAllChats = () => {
    if (window.confirm("Are you sure you want to clear all chats?")) {
      const defaultChat = {
        id: Date.now(),
        title: "New Conversation",
        messages: [],
        createdAt: new Date().toISOString()
      };
      setSessions([defaultChat]);
      setActive(defaultChat.id);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const handleLogout = () => {
    // Clear session data but keep profile
    const defaultChat = {
      id: Date.now(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString()
    };
    setSessions([defaultChat]);
    setActive(defaultChat.id);
    setShowProfileMenu(false);
    // Optionally redirect to login page
    // navigate('/login');
  };

  const activeMessages = sessions.find(s => s.id === active)?.messages || [];

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = formatDate(session.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  return (
    <div className={`chatbot-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && mobileView && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
              <MessageSquare size={20} />
            </div>
            <span className="logo-text">AI Assistant</span>
          </div>
          {mobileView && (
            <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <button className="new-chat-btn" onClick={newChat}>
          <Plus size={18} />
          <span>New Chat</span>
        </button>

        <div className="sessions-container">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date} className="date-group">
              <div className="date-label">{date}</div>
              {dateSessions.map(s => (
                <div
                  key={s.id}
                  className={`session-item ${s.id === active ? 'active' : ''}`}
                  onClick={() => {
                    setActive(s.id);
                    if (mobileView) setSidebarOpen(false);
                  }}
                >
                  {editingTitle === s.id ? (
                    <div className="edit-title-container">
                      <input
                        ref={editInputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveTitle(s.id);
                          if (e.key === "Escape") setEditingTitle(null);
                        }}
                        className="edit-title-input"
                      />
                      <button onClick={() => saveTitle(s.id)} className="save-title-btn">
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <MessageSquare size={14} className="session-icon" />
                      <span className="session-title">{s.title}</span>
                      <div className="session-actions">
                        <button
                          onClick={(e) => startEditingTitle(s, e)}
                          className="session-action-btn"
                          title="Rename"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => deleteChat(s.id, e)}
                          className="session-action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="footer-btn" onClick={clearAllChats}>
            <Trash2 size={16} />
            <span>Clear All Chats</span>
          </button>
          <button className="footer-btn" onClick={toggleTheme}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-left">
            {mobileView && (
              <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
            )}
            <h2 className="chat-title">
              {sessions.find(s => s.id === active)?.title || "AI Assistant"}
            </h2>
          </div>
          
          <div className="header-right" ref={profileMenuRef}>
            <button 
              className="notification-bell"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={18} />
              {userProfile.notifications?.unread > 0 && (
                <span className="notification-badge">{userProfile.notifications.unread}</span>
              )}
            </button>

            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-avatar-small">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} />
                ) : (
                  <User size={14} />
                )}
              </div>
              <span className="profile-name">{userProfile.name}</span>
            </button>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-avatar-large">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt={userProfile.name} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="profile-info">
                    <div className="profile-display-name">{userProfile.name}</div>
                    <div className="profile-email">{userProfile.email}</div>
                  </div>
                </div>
                <div className="profile-menu-items">
                  <button 
                    className="profile-menu-item" 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/profile');
                    }}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button 
                    className="profile-menu-item" 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button 
                    className="profile-menu-item" 
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/notifications');
                    }}
                  >
                    <Bell size={16} />
                    <span>Notifications</span>
                  </button>
                  <div className="profile-menu-divider"></div>
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          <div className="messages-wrapper">
            {activeMessages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MessageSquare size={48} />
                </div>
                <h3 className="empty-state-title">How can I help you today?</h3>
                <p className="empty-state-subtitle">
                  Ask me anything, and I'll do my best to assist you
                </p>
              </div>
            ) : (
              activeMessages.map((m, i) => (
                <div
                  key={i}
                  className={`message-wrapper ${m.role === 'user' ? 'user' : 'bot'}`}
                >
                  <div className="message-container">
                    <div className={`avatar ${m.role === 'user' ? 'user-avatar' : 'bot-avatar'}`}>
                      {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>

                    <div className="message-content">
                      <div className={`message-bubble ${m.error ? 'error' : ''}`}>
                        {m.text}
                      </div>

                      {m.role === 'bot' && (
                        <div className="message-actions">
                          <button
                            onClick={() => copyMessage(m.text, i)}
                            className={`action-btn ${copiedIndex === i ? 'copied' : ''}`}
                            title="Copy"
                          >
                            {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedIndex === i ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => handleLike(i)}
                            className={`action-btn ${likedMessages[i] ? 'liked' : ''}`}
                            title="Like"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => handleDislike(i)}
                            className={`action-btn ${dislikedMessages[i] ? 'disliked' : ''}`}
                            title="Dislike"
                          >
                            <ThumbsDown size={14} />
                          </button>
                          {m.timestamp && (
                            <span className="message-time">
                              {formatTime(m.timestamp)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="message-wrapper bot">
                <div className="message-container">
                  <div className="avatar bot-avatar">
                    <Bot size={18} />
                  </div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <Loader2 size={18} className="spin" />
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... (Press Enter to send)"
              rows={Math.min(3, message.split('\n').length)}
              className="message-input"
              disabled={loading}
            />
            {message.length > 0 && (
              <div className="char-counter">
                {message.length}/2000
              </div>
            )}
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className={`send-btn ${!message.trim() || loading ? 'disabled' : ''}`}
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </div>
          <div className="input-footer">
            AI may produce inaccurate information
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;