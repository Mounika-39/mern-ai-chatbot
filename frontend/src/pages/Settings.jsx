import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Globe,
  Download,
  HelpCircle,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  Volume2,
  Vibrate,
  Trash2,
  RefreshCw,
  Upload,
  CheckCircle,
  Loader2,
  Mail,
  Smartphone,
  Monitor,
  AlertCircle,
  ChevronRight,
  MessageSquare  // This was missing
} from "lucide-react";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    desktop: false,
    sound: true,
    mentions: true,
    messages: true,
    marketing: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    readReceipts: true,
    twoFactorAuth: false,
    loginNotifications: true
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    timezone: 'PST (UTC-8)',
    dateFormat: 'MM/DD/YYYY',
    compactMode: false,
    reduceMotion: false,
    highContrast: false
  });

  useEffect(() => {
    // Load user profile
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
        setDarkMode(parsed.preferences?.theme === 'dark');
        
        // Load saved preferences if they exist
        if (parsed.preferences) {
          setPreferences(prev => ({
            ...prev,
            language: parsed.preferences.language || 'English',
            timezone: parsed.preferences.timezone || 'PST (UTC-8)',
            dateFormat: parsed.preferences.dateFormat || 'MM/DD/YYYY'
          }));
        }
      } catch (error) {
        console.error("Error parsing profile:", error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    
    setTimeout(() => {
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          preferences: {
            ...userProfile.preferences,
            theme: darkMode ? 'dark' : 'light',
            language: preferences.language,
            timezone: preferences.timezone,
            dateFormat: preferences.dateFormat
          }
        };
        localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
      }
      
      setSaveStatus('success');
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }, 1000);
  };

  const handleClearAllChats = () => {
    if (window.confirm("Are you sure you want to clear all chats?")) {
      const defaultChat = {
        id: Date.now(),
        title: "New Conversation",
        messages: [],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("ai_chats", JSON.stringify([defaultChat]));
      setSaveStatus('chats_cleared');
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }
  };

  const exportData = () => {
    const sessions = localStorage.getItem("ai_chats");
    const profile = localStorage.getItem("user_profile");
    
    const data = {
      sessions: sessions ? JSON.parse(sessions) : [],
      profile: profile ? JSON.parse(profile) : {},
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowExportConfirm(false);
    setSaveStatus('exported');
    
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.sessions) {
            localStorage.setItem("ai_chats", JSON.stringify(data.sessions));
          }
          
          if (data.profile) {
            localStorage.setItem("user_profile", JSON.stringify(data.profile));
            setUserProfile(data.profile);
          }
          
          setShowImportModal(false);
          setSaveStatus('imported');
          
          setTimeout(() => {
            setSaveStatus(null);
          }, 2000);
        } catch (error) {
          alert('Invalid backup file');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!userProfile) {
    return (
      <div className="settings-page-loading">
        <Loader2 size={40} className="spin" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={`settings-page ${darkMode ? 'dark' : 'light'}`}>
      <div className="settings-page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back to Chat</span>
        </button>
        <h1>Settings</h1>
      </div>

      {saveStatus === 'success' && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {saveStatus === 'chats_cleared' && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>All chats cleared successfully!</span>
        </div>
      )}

      {saveStatus === 'exported' && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>Data exported successfully!</span>
        </div>
      )}

      {saveStatus === 'imported' && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>Data imported successfully!</span>
        </div>
      )}

      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <User size={18} />
            <span>Account</span>
          </button>
          
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          
          <button 
            className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Shield size={18} />
            <span>Privacy & Security</span>
          </button>
          
          <button 
            className={`settings-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Globe size={18} />
            <span>Preferences</span>
          </button>
          
          <button 
            className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <Download size={18} />
            <span>Data & Storage</span>
          </button>
          
          <button 
            className={`settings-tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <HelpCircle size={18} />
            <span>Help & Support</span>
          </button>
        </div>

        <div className="settings-content">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="settings-panel">
              <h2>Account Settings</h2>
              
              <div className="settings-group">
                <h3>Profile Information</h3>
                
                <div className="info-card">
                  <div className="info-row">
                    <span className="info-label">Name</span>
                    <span className="info-value">{userProfile.name}</span>
                    <button className="info-action" onClick={() => navigate('/profile')}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{userProfile.email}</span>
                    <button className="info-action" onClick={() => navigate('/profile')}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  <div className="info-row">
                    <span className="info-label">Username</span>
                    <span className="info-value">{userProfile.username}</span>
                    <button className="info-action" onClick={() => navigate('/profile')}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h3>Password & Authentication</h3>
                
                <div className="password-section">
                  <div className="password-strength">
                    <Lock size={16} />
                    <span>Password strength: Strong</span>
                  </div>
                  
                  <button className="btn-secondary">
                    Change Password
                  </button>
                  
                  <label className="toggle-item">
                    <span>Two-factor authentication</span>
                    <input 
                      type="checkbox" 
                      checked={privacySettings.twoFactorAuth}
                      onChange={(e) => setPrivacySettings({
                        ...privacySettings,
                        twoFactorAuth: e.target.checked
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-group danger-zone">
                <h3>Danger Zone</h3>
                
                {!showDeleteConfirm ? (
                  <button 
                    className="btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={16} />
                    Delete Account
                  </button>
                ) : (
                  <div className="confirm-delete">
                    <AlertCircle size={20} />
                    <p>This action cannot be undone. All your data will be permanently deleted.</p>
                    <div className="delete-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => {
                          localStorage.clear();
                          window.location.href = '/';
                        }}
                      >
                        Yes, Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2>Notification Settings</h2>
              
              <div className="settings-group">
                <h3>Email Notifications</h3>
                
                <label className="toggle-item">
                  <div className="toggle-info">
                    <Mail size={18} />
                    <span>Email notifications</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.email}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      email: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <label className="toggle-item">
                  <div className="toggle-info">
                    <span>Marketing emails</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.marketing}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      marketing: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-group">
                <h3>Push Notifications</h3>
                
                <label className="toggle-item">
                  <div className="toggle-info">
                    <Smartphone size={18} />
                    <span>Push notifications</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.push}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      push: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <label className="toggle-item">
                  <div className="toggle-info">
                    <Monitor size={18} />
                    <span>Desktop notifications</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.desktop}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      desktop: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-group">
                <h3>Sound & Alerts</h3>
                
                <label className="toggle-item">
                  <div className="toggle-info">
                    <Volume2 size={18} />
                    <span>Sound effects</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.sound}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      sound: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <label className="toggle-item">
                  <div className="toggle-info">
                    <Vibrate size={18} />
                    <span>Vibrate</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationSettings.vibrate}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      vibrate: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <div className="settings-panel">
              <h2>Privacy & Security</h2>
              
              <div className="settings-group">
                <h3>Privacy Settings</h3>
                
                <div className="select-item">
                  <span>Profile visibility</span>
                  <select 
                    value={privacySettings.profileVisibility}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      profileVisibility: e.target.value
                    })}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends only</option>
                  </select>
                </div>

                <label className="toggle-item">
                  <span>Show online status</span>
                  <input 
                    type="checkbox" 
                    checked={privacySettings.showOnlineStatus}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      showOnlineStatus: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <label className="toggle-item">
                  <span>Read receipts</span>
                  <input 
                    type="checkbox" 
                    checked={privacySettings.readReceipts}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      readReceipts: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-group">
                <h3>Security</h3>
                
                <label className="toggle-item">
                  <span>Login notifications</span>
                  <input 
                    type="checkbox" 
                    checked={privacySettings.loginNotifications}
                    onChange={(e) => setPrivacySettings({
                      ...privacySettings,
                      loginNotifications: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <button className="btn-secondary">
                  <Eye size={16} />
                  Manage Active Sessions
                </button>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="settings-panel">
              <h2>Preferences</h2>
              
              <div className="settings-group">
                <h3>Appearance</h3>
                
                <label className="toggle-item">
                  <span>Dark mode</span>
                  <input 
                    type="checkbox" 
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <label className="toggle-item">
                  <span>Compact mode</span>
                  <input 
                    type="checkbox" 
                    checked={preferences.compactMode}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      compactMode: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-group">
                <h3>Language & Region</h3>
                
                <div className="select-item">
                  <span>Language</span>
                  <select 
                    value={preferences.language}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      language: e.target.value
                    })}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Japanese</option>
                  </select>
                </div>

                <div className="select-item">
                  <span>Timezone</span>
                  <select 
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      timezone: e.target.value
                    })}
                  >
                    <option>PST (UTC-8)</option>
                    <option>EST (UTC-5)</option>
                    <option>GMT (UTC+0)</option>
                    <option>CET (UTC+1)</option>
                    <option>IST (UTC+5:30)</option>
                  </select>
                </div>

                <div className="select-item">
                  <span>Date format</span>
                  <select 
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      dateFormat: e.target.value
                    })}
                  >
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h3>Accessibility</h3>
                
                <label className="toggle-item">
                  <span>Reduce motion</span>
                  <input 
                    type="checkbox" 
                    checked={preferences.reduceMotion}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      reduceMotion: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <label className="toggle-item">
                  <span>High contrast</span>
                  <input 
                    type="checkbox" 
                    checked={preferences.highContrast}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      highContrast: e.target.checked
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {/* Data & Storage */}
          {activeTab === 'data' && (
            <div className="settings-panel">
              <h2>Data & Storage</h2>
              
              <div className="settings-group">
                <h3>Storage Usage</h3>
                
                <div className="storage-info">
                  <div className="storage-bar">
                    <div className="storage-used" style={{width: '30%'}}></div>
                  </div>
                  <p>Using 30% of storage (30 MB / 100 MB)</p>
                </div>
              </div>

              <div className="settings-group">
                <h3>Data Management</h3>
                
                {!showExportConfirm ? (
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowExportConfirm(true)}
                  >
                    <Download size={16} />
                    Export Data
                  </button>
                ) : (
                  <div className="confirm-export">
                    <p>Export all your chats and settings?</p>
                    <div className="export-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setShowExportConfirm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={exportData}
                      >
                        Export
                      </button>
                    </div>
                  </div>
                )}

                {!showImportModal ? (
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowImportModal(true)}
                  >
                    <Upload size={16} />
                    Import Data
                  </button>
                ) : (
                  <div className="import-modal">
                    <p>Select a backup file to import</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: 'none' }}
                      id="import-file"
                    />
                    <div className="import-actions">
                      <button 
                        className="btn-secondary"
                        onClick={() => setShowImportModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => document.getElementById('import-file').click()}
                      >
                        Choose File
                      </button>
                    </div>
                  </div>
                )}

                <button className="btn-secondary" onClick={handleClearAllChats}>
                  <RefreshCw size={16} />
                  Clear All Chats
                </button>

                <button className="btn-secondary">
                  <Trash2 size={16} />
                  Clear Cache
                </button>
              </div>
            </div>
          )}

          {/* Help & Support */}
          {activeTab === 'help' && (
            <div className="settings-panel">
              <h2>Help & Support</h2>
              
              <div className="settings-group">
                <h3>Get Help</h3>
                
                <button className="help-item">
                  <HelpCircle size={18} />
                  <span>FAQ & Documentation</span>
                  <ChevronRight size={16} />
                </button>
                
                <button className="help-item">
                  <Mail size={18} />
                  <span>Contact Support</span>
                  <ChevronRight size={16} />
                </button>
                
                <button className="help-item">
                  <MessageSquare size={18} />
                  <span>Community Forum</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="settings-group">
                <h3>About</h3>
                
                <div className="about-info">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Last updated:</strong> March 15, 2026</p>
                  <p><strong>Developer:</strong> AI Assistant Team</p>
                </div>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button 
              className="btn-primary"
              onClick={handleSaveSettings}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;