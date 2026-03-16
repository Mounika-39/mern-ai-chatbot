import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Bell,
  MessageSquare,
  Shield,
  User,
  Check,
  X,
  Clock,
  Settings,
  Mail,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Trash2
} from "lucide-react";
import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme preference
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDarkMode(parsed.preferences?.theme === 'dark');
      } catch (error) {
        console.error("Error parsing profile:", error);
      }
    }

    // Load notifications from localStorage
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setLoading(true);
    const stored = localStorage.getItem("notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications([]);
      }
    }
    setLoading(false);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const deleteNotification = (id, e) => {
    e.stopPropagation();
    const updated = notifications.filter(notif => notif.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      localStorage.removeItem("notifications");
    }
  };

  const getFilteredNotifications = () => {
    switch(filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifTime.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <div className="notifications-page-loading">
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className={`notifications-page ${darkMode ? 'dark' : 'light'}`}>
      <div className="notifications-page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back to Chat</span>
        </button>
        
        <div className="header-title">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} new</span>
          )}
        </div>
        
        <div className="header-actions">
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              <Check size={16} />
              <span>Mark all read</span>
            </button>
          )}
          
          <button 
            className={`settings-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="quick-settings">
          <h4>Notification Settings</h4>
          <label className="toggle-item">
            <span>Push notifications</span>
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
          <label className="toggle-item">
            <span>Email notifications</span>
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
          <label className="toggle-item">
            <span>Sound alerts</span>
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
          <button 
            className="full-settings-btn"
            onClick={() => navigate('/settings')}
          >
            <Settings size={14} />
            Full Settings
          </button>
        </div>
      )}

      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">
              <Bell size={48} />
            </div>
            <h3>No notifications</h3>
            <p>
              {filter === 'all' 
                ? "You don't have any notifications yet" 
                : filter === 'unread' 
                ? "No unread notifications" 
                : "No read notifications"}
            </p>
            {filter !== 'all' && (
              <button 
                className="clear-filter-btn"
                onClick={() => setFilter('all')}
              >
                Show all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => {
              // Determine icon based on type or use Bell as default
              let Icon = Bell;
              switch(notification.type) {
                case 'message': Icon = MessageSquare; break;
                case 'security': Icon = Shield; break;
                case 'profile': Icon = User; break;
                case 'email': Icon = Mail; break;
                case 'alert': Icon = AlertCircle; break;
                case 'success': Icon = CheckCircle; break;
                case 'info': Icon = Info; break;
                default: Icon = Bell;
              }
              
              const timeAgo = getTimeAgo(notification.timestamp);
              
              return (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    <Icon size={20} />
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h3>{notification.title || 'Notification'}</h3>
                      <button 
                        className="delete-notification"
                        onClick={(e) => deleteNotification(notification.id, e)}
                        title="Delete notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    
                    <p className="notification-message">{notification.message || ''}</p>
                    
                    <div className="notification-footer">
                      <Clock size={12} />
                      <span className="notification-time">{timeAgo}</span>
                    </div>
                  </div>
                  
                  {!notification.read && <span className="unread-dot" title="Unread"></span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notifications-footer">
          <div className="footer-stats">
            <span>Total: {notifications.length}</span>
            <span>Unread: {unreadCount}</span>
            <span>Read: {notifications.length - unreadCount}</span>
          </div>
          <button className="clear-all-btn" onClick={clearAll}>
            <Trash2 size={14} />
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
}

export default Notifications;