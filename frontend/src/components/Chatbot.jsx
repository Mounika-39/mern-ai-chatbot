import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import { 
  Send, Plus, Trash2, Menu, X, MessageSquare, User, Bot, Loader2,
  Edit2, Check, Copy, ThumbsUp, ThumbsDown, LogOut, Settings, Moon,
  Sun, Bell, Search, FileText, Pin, Upload, File, Download, Tag, Mic,
  XCircle, Paperclip
} from "lucide-react";
import "./chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Core states
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [likedMessages, setLikedMessages] = useState({});
  const [dislikedMessages, setDislikedMessages] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileView, setMobileView] = useState(window.innerWidth <= 768);
  const [unreadCount, setUnreadCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [pinnedChats, setPinnedChats] = useState([]);
  const [chatTags, setChatTags] = useState({});
  const [tagFilter, setTagFilter] = useState("all");
  const [showTagMenu, setShowTagMenu] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [pendingFile, setPendingFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const fileInputRef = useRef(null);
  
  // Search states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedResult, setSelectedResult] = useState(null);

  const availableTags = ["Work", "Personal", "Learning", "Coding", "Ideas", "Important"];

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  const profileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load user data - runs only once
  useEffect(() => {
    const loadData = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      
      if (!storedToken) {
        navigate("/login");
        return;
      }
      
      setToken(storedToken);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setDarkMode(parsedUser.preferences?.theme === 'dark');
      }
      
      try {
        const response = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(response.data);
        setDarkMode(response.data.preferences?.theme === 'dark');
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        console.error("Error loading user data:", error);
      }
      
      setLoadingUser(false);
    };
    
    loadData();
  }, []);

  // Load chats after user is set
  useEffect(() => {
    if (user && !loadingUser) {
      loadUserChats();
    }
  }, [user, loadingUser]);

  const loadUserChats = () => {
    try {
      const userEmail = user?.email || 'default';
      const stored = localStorage.getItem(`ai_chats_${userEmail}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) setActive(parsed[0]?.id);
      } else {
        const defaultChat = { 
          id: Date.now(), 
          title: "New Conversation", 
          messages: [], 
          createdAt: new Date().toISOString() 
        };
        setSessions([defaultChat]);
        setActive(defaultChat.id);
      }
      
      const storedPinned = localStorage.getItem(`pinned_chats_${userEmail}`);
      if (storedPinned) setPinnedChats(JSON.parse(storedPinned));
      
      const storedTags = localStorage.getItem(`chat_tags_${userEmail}`);
      if (storedTags) setChatTags(JSON.parse(storedTags));
      
      const storedFiles = localStorage.getItem(`uploaded_files_${userEmail}`);
      if (storedFiles) setUploadedFiles(JSON.parse(storedFiles));
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  // Save user-specific data
  useEffect(() => {
    if (sessions.length > 0 && user?.email) {
      localStorage.setItem(`ai_chats_${user.email}`, JSON.stringify(sessions));
    }
  }, [sessions, user]);
  
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`pinned_chats_${user.email}`, JSON.stringify(pinnedChats));
      localStorage.setItem(`chat_tags_${user.email}`, JSON.stringify(chatTags));
      localStorage.setItem(`uploaded_files_${user.email}`, JSON.stringify(uploadedFiles));
    }
  }, [pinnedChats, chatTags, uploadedFiles, user]);

  // Voice Input Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      recognitionInstance.onerror = () => setIsListening(false);
      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  }, []);

  // Check mobile view
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom
  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); 
  }, [sessions, isTyping]);

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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); newChat(); }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === 'Escape' && showSearch) setShowSearch(false);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearch]);

  // File download function
  const downloadFile = (fileId) => {
    const file = Object.values(uploadedFiles).flat().find(f => f.id === fileId);
    if (file && file.data) {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Select file
  const selectFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingFile(file);
    }
  };

  // Remove pending file
  const removePendingFile = () => {
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Voice input function
  const startVoiceInput = () => {
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Speech recognition error:", error);
      }
    } else {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
    }
  };

  // Export chat history
  const exportChatHistory = () => {
    const data = {
      exportDate: new Date().toISOString(),
      sessions: sessions,
      tags: chatTags,
      user: user?.name
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${user?.name || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Search functions
  const performSearch = (query) => {
    if (!query.trim()) { 
      setSearchResults([]); 
      return; 
    }
    const results = [];
    const lowerQuery = query.toLowerCase();
    sessions.forEach(session => {
      session.messages.forEach((message, index) => {
        const matches = message.text.toLowerCase().includes(lowerQuery);
        const matchesType = filterType === "all" || 
          (filterType === "user" && message.role === "user") || 
          (filterType === "bot" && message.role === "bot");
        if (matches && matchesType) {
          results.push({
            sessionId: session.id,
            sessionTitle: session.title,
            messageIndex: index,
            message: message.text,
            role: message.role,
            timestamp: message.timestamp || session.createdAt,
            preview: message.text.substring(0, 150) + (message.text.length > 150 ? "..." : "")
          });
        }
      });
    });
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setSearchResults(results);
  };

  const handleSearchChange = (e) => { 
    setSearchQuery(e.target.value); 
    performSearch(e.target.value); 
  };

  const jumpToMessage = (result) => {
    setActive(result.sessionId);
    setSelectedResult(result);
    setShowSearch(false);
    setTimeout(() => {
      const messageElements = document.querySelectorAll('.message-wrapper');
      if (messageElements[result.messageIndex]) {
        messageElements[result.messageIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        messageElements[result.messageIndex].classList.add('highlight-message');
        setTimeout(() => messageElements[result.messageIndex].classList.remove('highlight-message'), 2000);
      }
    }, 100);
  };

  // Send message with file
  const sendMessage = async () => {
    if ((!message.trim() && !pendingFile) || loading) return;
    
    const userMessage = message.trim() || (pendingFile ? `Please analyze this file: ${pendingFile.name}` : "");
    const hasFile = !!pendingFile;
    let fileBase64 = "";
    
    setLoading(true);
    setIsTyping(true);
    setSuggestions([]);
    
    // Process file if exists
    if (hasFile && pendingFile) {
      const reader = new FileReader();
      fileBase64 = await new Promise((resolve) => {
        reader.onload = (event) => {
          resolve(event.target.result);
        };
        reader.readAsDataURL(pendingFile);
      });
      
      const fileData = {
        id: Date.now(),
        name: pendingFile.name,
        type: pendingFile.type,
        size: pendingFile.size,
        data: fileBase64,
        chatId: active,
        timestamp: new Date().toISOString()
      };
      
      setUploadedFiles(prev => ({
        ...prev,
        [active]: [...(prev[active] || []), fileData]
      }));
    }
    
    // Create display message for chat
    const displayMessage = hasFile 
      ? `${userMessage}\n\n📎 **Attached file:** ${pendingFile.name} (${(pendingFile.size / 1024).toFixed(2)} KB)`
      : userMessage;
    
    // Add user message to chat
    setSessions(prev => prev.map(s => {
      if (s.id !== active) return s;
      const newMessages = [...s.messages, { 
        role: "user", 
        text: displayMessage,
        timestamp: new Date().toISOString(),
        isFile: hasFile,
        fileId: hasFile ? Date.now() : null,
        fileName: pendingFile?.name,
        fileType: pendingFile?.type
      }];
      let title = s.title;
      if (s.messages.length === 0 && userMessage) {
        title = userMessage.length > 30 ? userMessage.slice(0, 30) + "..." : userMessage;
      }
      return { ...s, title, messages: newMessages };
    }));
    
    setMessage("");
    const fileNameToSend = pendingFile?.name;
    const fileTypeToSend = pendingFile?.type;
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    try {
      // Get conversation history
      const currentSession = sessions.find(s => s.id === active);
      const conversationHistory = (currentSession?.messages || []).map(msg => ({
        role: msg.role,
        content: msg.text
      }));
      
      // Send to backend
      const res = await axios.post("http://localhost:5000/api/chat", { 
        message: userMessage,
        history: conversationHistory.slice(-20),
        hasFile: hasFile,
        fileName: fileNameToSend,
        fileType: fileTypeToSend,
        fileData: hasFile ? fileBase64 : null
      });
      
      setSessions(prev => prev.map(s => {
        if (s.id !== active) return s;
        return { ...s, messages: [...s.messages, { 
          role: "bot", 
          text: res.data.reply, 
          timestamp: new Date().toISOString() 
        }] };
      }));
      setIsTyping(false);
      
      if (res.data.reply) {
        const lowerReply = res.data.reply.toLowerCase();
        const newSuggestions = lowerReply.includes('code') ? ["Can you explain the code?", "Show me an example"] :
                               lowerReply.includes('tutorial') ? ["Explain in more detail", "Show me step by step"] :
                               ["Tell me more", "Give me an example", "What are the benefits?"];
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setSessions(prev => prev.map(s => {
        if (s.id !== active) return s;
        return { ...s, messages: [...s.messages, { 
          role: "bot", 
          text: "Sorry, I'm having trouble processing your request. Please try again.", 
          error: true, 
          timestamp: new Date().toISOString() 
        }] };
      }));
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

  const handleLike = (i) => {
    setLikedMessages(prev => ({ ...prev, [i]: !prev[i] }));
    if (dislikedMessages[i]) setDislikedMessages(prev => { const newState = { ...prev }; delete newState[i]; return newState; });
  };

  const handleDislike = (i) => {
    setDislikedMessages(prev => ({ ...prev, [i]: !prev[i] }));
    if (likedMessages[i]) setLikedMessages(prev => { const newState = { ...prev }; delete newState[i]; return newState; });
  };

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
  const formatDate = (ts) => {
    if (!ts) return "";
    const date = new Date(ts), today = new Date(), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const newChat = () => {
    const chat = { id: Date.now(), title: "New Conversation", messages: [], createdAt: new Date().toISOString() };
    setSessions(prev => [chat, ...prev]);
    setActive(chat.id);
    setSuggestions([]);
    setPendingFile(null);
    if (mobileView) setSidebarOpen(false);
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this conversation?")) {
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== id);
        if (filtered.length === 0) return [{ id: Date.now(), title: "New Conversation", messages: [], createdAt: new Date().toISOString() }];
        return filtered;
      });
      if (active === id) setActive(sessions.filter(s => s.id !== id)[0]?.id || null);
    }
  };

  const startEditingTitle = (session, e) => {
    e.stopPropagation();
    setEditingTitle(session.id);
    setEditValue(session.title);
  };

  const saveTitle = (id) => {
    if (editValue.trim()) setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editValue.trim() } : s));
    setEditingTitle(null);
  };

  const handleKeyDown = (e) => { 
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      sendMessage(); 
    } 
  };

  const togglePinChat = (chatId, e) => {
    e.stopPropagation();
    setPinnedChats(prev => prev.includes(chatId) ? prev.filter(id => id !== chatId) : [chatId, ...prev]);
  };

  const addTagToChat = (chatId, tag) => {
    setChatTags(prev => ({ ...prev, [chatId]: [...new Set([...(prev[chatId] || []), tag])] }));
    setShowTagMenu(null);
  };

  const removeTagFromChat = (chatId, tag, e) => {
    e.stopPropagation();
    setChatTags(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).filter(t => t !== tag)
    }));
  };

  const clearAllChats = () => {
    if (window.confirm("Clear all chats?")) {
      const defaultChat = { id: Date.now(), title: "New Conversation", messages: [], createdAt: new Date().toISOString() };
      setSessions([defaultChat]);
      setActive(defaultChat.id);
      setSuggestions([]);
      setPinnedChats([]);
      setChatTags({});
      setPendingFile(null);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const activeMessages = sessions.find(s => s.id === active)?.messages || [];
  const filteredSessions = tagFilter === "all" ? sessions : sessions.filter(s => (chatTags[s.id] || []).includes(tagFilter));
  const pinnedList = filteredSessions.filter(s => pinnedChats.includes(s.id));
  const unpinnedList = filteredSessions.filter(s => !pinnedChats.includes(s.id));

  const groupedPinned = pinnedList.reduce((groups, session) => {
    const date = formatDate(session.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(session);
    return groups;
  }, {});

  const groupedUnpinned = unpinnedList.reduce((groups, session) => {
    const date = formatDate(session.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(session);
    return groups;
  }, {});

  const renderSessionItem = (s) => (
    <div
      key={s.id}
      className={`session-item ${s.id === active ? 'active' : ''} ${pinnedChats.includes(s.id) ? 'pinned' : ''}`}
      onClick={() => { setActive(s.id); setSuggestions([]); if (mobileView) setSidebarOpen(false); }}
    >
      {editingTitle === s.id ? (
        <div className="edit-title-container">
          <input ref={editInputRef} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveTitle(s.id); if (e.key === "Escape") setEditingTitle(null); }} className="edit-title-input" />
          <button onClick={() => saveTitle(s.id)} className="save-title-btn"><Check size={14} /></button>
        </div>
      ) : (
        <>
          <Pin size={12} className={`pin-icon ${pinnedChats.includes(s.id) ? 'active' : ''}`} onClick={(e) => togglePinChat(s.id, e)} />
          <MessageSquare size={14} className="session-icon" />
          <span className="session-title">{s.title}</span>
          <div className="session-tags">
            {(chatTags[s.id] || []).map(tag => (
              <span key={tag} className="session-tag">
                {tag}
                <XCircle size={10} onClick={(e) => removeTagFromChat(s.id, tag, e)} className="remove-tag" />
              </span>
            ))}
          </div>
          <div className="session-actions">
            <button onClick={(e) => { e.stopPropagation(); setShowTagMenu(showTagMenu === s.id ? null : s.id); }} className="session-action-btn" title="Add tag"><Tag size={12} /></button>
            <button onClick={(e) => startEditingTitle(s, e)} className="session-action-btn" title="Rename"><Edit2 size={12} /></button>
            <button onClick={(e) => deleteChat(s.id, e)} className="session-action-btn delete" title="Delete"><Trash2 size={12} /></button>
          </div>
          {showTagMenu === s.id && (
            <div className="tag-menu">
              {availableTags.filter(tag => !(chatTags[s.id] || []).includes(tag)).map(tag => (
                <button key={tag} onClick={() => addTagToChat(s.id, tag)} className="tag-option">
                  <Tag size={12} /> {tag}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  if (loadingUser) {
    return (
      <div className="loading-container">
        <Loader2 size={40} className="spin" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`chatbot-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Search Modal */}
      {showSearch && (
        <div className="search-modal-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-modal-header"><h3>Search Messages</h3><button className="close-search" onClick={() => setShowSearch(false)}><X size={18} /></button></div>
            <div className="search-input-container"><Search size={18} /><input ref={searchInputRef} type="text" placeholder="Search in conversations... (Ctrl+K)" value={searchQuery} onChange={handleSearchChange} className="search-input" /></div>
            <div className="search-filters">
              <select value={filterType} onChange={(e) => { setFilterType(e.target.value); performSearch(searchQuery); }} className="filter-select"><option value="all">All</option><option value="user">User</option><option value="bot">AI</option></select>
              <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); performSearch(searchQuery); }} className="filter-select"><option value="all">Any Time</option><option value="today">Today</option><option value="week">Last 7 Days</option></select>
            </div>
            <div className="search-results">
              {searchResults.length === 0 && searchQuery && (<div className="no-results"><MessageSquare size={32} /><p>No messages found</p></div>)}
              {searchResults.map((result, idx) => (
                <div key={idx} className="search-result-item" onClick={() => jumpToMessage(result)}>
                  <div className="result-header"><div className="result-chat"><MessageSquare size={14} /><span>{result.sessionTitle}</span></div><div className={`result-badge ${result.role}`}>{result.role === 'user' ? 'You' : 'AI'}</div></div>
                  <div className="result-preview">{result.preview}</div>
                  <div className="result-footer"><span>{formatDate(result.timestamp)} at {formatTime(result.timestamp)}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && mobileView && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container"><div className="logo"><MessageSquare size={20} /></div><span className="logo-text">AI Assistant</span></div>
          {mobileView && <button className="close-sidebar" onClick={() => setSidebarOpen(false)}><X size={20} /></button>}
        </div>
        
        <div className="sidebar-buttons">
          <button className="new-chat-btn" onClick={newChat} title="New Chat (Ctrl+N)">
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="tag-filter-section"><Tag size={14} /><select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="tag-filter-select"><option value="all">All Chats</option>{availableTags.map(tag => (<option key={tag} value={tag}>{tag}</option>))}</select></div>

        <div className="sessions-container">
          {Object.keys(groupedPinned).length > 0 && (<><div className="date-label pinned-label"><Pin size={12} /><span>Pinned</span></div>{Object.entries(groupedPinned).map(([date, dateSessions]) => (<div key={date} className="date-group"><div className="date-label">{date}</div>{dateSessions.map(s => renderSessionItem(s))}</div>))}</>)}
          {Object.keys(groupedUnpinned).length > 0 && (<>{Object.keys(groupedPinned).length > 0 && <div className="date-label recent-label">Recent</div>}{Object.entries(groupedUnpinned).map(([date, dateSessions]) => (<div key={date} className="date-group"><div className="date-label">{date}</div>{dateSessions.map(s => renderSessionItem(s))}</div>))}</>)}
        </div>

        <div className="sidebar-footer">
          <button className="footer-btn" onClick={clearAllChats}><Trash2 size={16} /><span>Clear All</span></button>
          <button className="footer-btn" onClick={toggleTheme}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}<span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span></button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-chat">
        <div className="chat-header">
          <div className="header-left">
            {mobileView && <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>}
            <h2 className="chat-title">{sessions.find(s => s.id === active)?.title || "AI Assistant"}</h2>
          </div>
          <div className="header-right" ref={profileMenuRef}>
            <button className="search-btn" onClick={() => setShowSearch(true)} title="Search (Ctrl+K)"><Search size={18} /></button>
            <button className="export-btn" onClick={exportChatHistory} title="Export"><FileText size={18} /></button>
            <button className="notification-bell" onClick={() => navigate('/notifications')}><Bell size={18} />{unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}</button>
            <button className="profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="profile-avatar-small">{user?.avatar ? <img src={user.avatar} alt="User" /> : <User size={14} />}</div>
              <span className="profile-name">{user?.name || "User"}</span>
            </button>
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-menu-header"><div className="profile-avatar-large">{user?.avatar ? <img src={user.avatar} alt="User" /> : <User size={24} />}</div><div className="profile-info"><div className="profile-display-name">{user?.name || "User"}</div><div className="profile-email">{user?.email || "user@example.com"}</div></div></div>
                <div className="profile-menu-items">
                  <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}><User size={16} /><span>Profile</span></button>
                  <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}><Settings size={16} /><span>Settings</span></button>
                  <button className="profile-menu-item" onClick={() => { setShowProfileMenu(false); navigate('/notifications'); }}><Bell size={16} /><span>Notifications</span></button>
                  <div className="profile-menu-divider"></div>
                  <button className="profile-menu-item logout" onClick={handleLogout}><LogOut size={16} /><span>Logout</span></button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="messages-container">
          <div className="messages-wrapper">
            {activeMessages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><MessageSquare size={48} /></div>
                <h3 className="empty-state-title">How can I help you today?</h3>
                <p className="empty-state-subtitle">Ask me anything, and I'll do my best to assist you</p>
              </div>
            ) : (
              activeMessages.map((m, i) => (
                <div key={i} className={`message-wrapper ${m.role === 'user' ? 'user' : 'bot'} ${selectedResult?.messageIndex === i && selectedResult?.sessionId === active ? 'highlight-message' : ''}`}>
                  <div className="message-container">
                    <div className={`avatar ${m.role === 'user' ? 'user-avatar' : 'bot-avatar'}`}>{m.role === 'user' ? <User size={18} /> : <Bot size={18} />}</div>
                    <div className="message-content">
                      <div className={`message-bubble ${m.error ? 'error' : ''}`}>
                        {m.isFile && m.fileName && (
                          <div className="file-attachment">
                            <File size={16} />
                            <div className="file-info">
                              <span className="file-name">{m.fileName}</span>
                              <button className="download-file" onClick={() => downloadFile(m.fileId)}><Download size={12} /> Download</button>
                            </div>
                          </div>
                        )}
                        {m.role === 'bot' ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                      </div>
                      <div className="message-actions">
                        <button onClick={() => copyMessage(m.text, i)} className={`action-btn ${copiedIndex === i ? 'copied' : ''}`}>{copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}<span>{copiedIndex === i ? 'Copied!' : 'Copy'}</span></button>
                        {m.role === 'bot' && (<><button onClick={() => handleLike(i)} className={`action-btn ${likedMessages[i] ? 'liked' : ''}`}><ThumbsUp size={14} /></button><button onClick={() => handleDislike(i)} className={`action-btn ${dislikedMessages[i] ? 'disliked' : ''}`}><ThumbsDown size={14} /></button></>)}
                        {m.timestamp && <span className="message-time">{formatTime(m.timestamp)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="message-wrapper bot"><div className="message-container"><div className="avatar bot-avatar"><Bot size={18} /></div><div className="message-content"><div className="typing-indicator"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div></div></div></div>
            )}
            {suggestions.length > 0 && !isTyping && activeMessages.length > 0 && (
              <div className="suggestions-container"><p className="suggestions-label">Suggested:</p><div className="suggestions-list">{suggestions.map((suggestion, idx) => (<button key={idx} className="suggestion-btn" onClick={() => { setMessage(suggestion); inputRef.current?.focus(); }}>{suggestion}</button>))}</div></div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="input-area">
          {pendingFile && (
            <div className="pending-file">
              <Paperclip size={14} />
              <span className="pending-file-name">{pendingFile.name}</span>
              <button className="remove-file" onClick={removePendingFile}><X size={14} /></button>
            </div>
          )}
          
          <div className="input-wrapper">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={selectFile} accept="image/*,.pdf,.txt,.md,.json,.csv" />
            <button onClick={() => fileInputRef.current?.click()} className="file-btn" title="Attach file"><Paperclip size={18} /></button>
            <button onClick={startVoiceInput} className={`voice-btn ${isListening ? 'listening' : ''}`} title="Voice input"><Mic size={18} /></button>
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pendingFile ? "Add a message or ask about the file..." : "Ask anything... (Press Enter to send)"}
              rows={Math.min(3, message.split('\n').length)}
              className="message-input"
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={(!message.trim() && !pendingFile) || loading} className={`send-btn ${(!message.trim() && !pendingFile) || loading ? 'disabled' : ''}`}>
              <Send size={18} /><span>Send</span>
            </button>
          </div>
          <div className="input-footer">AI may produce inaccurate information</div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;