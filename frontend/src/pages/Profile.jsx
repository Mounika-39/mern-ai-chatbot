import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Link as LinkIcon,
  Github, 
  Twitter, 
  Linkedin,
  Edit2,
  Save,
  Camera,
  ArrowLeft,
  CheckCircle,
  Loader2,
  MessageSquare,
  Award,
  Clock
} from "lucide-react";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    birthday: '',
    avatar: null,
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    preferences: {
      language: 'English',
      timezone: 'PST (UTC-8)',
      dateFormat: 'MM/DD/YYYY',
      theme: 'dark'
    },
    social: {
      github: '',
      twitter: '',
      linkedin: ''
    },
    stats: {
      chats: 0,
      messages: 0,
      daysActive: 1
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userProfile });
  const [saveStatus, setSaveStatus] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load theme preference and profile data
    loadProfile();
  }, []);

  const loadProfile = () => {
    setLoading(true);
    
    // Load theme from existing profile or default
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
        setFormData(parsed);
        setDarkMode(parsed.preferences?.theme === 'dark');
      } catch (error) {
        console.error("Error parsing profile:", error);
        // If error, use default empty profile
        initializeEmptyProfile();
      }
    } else {
      // No profile exists, use empty profile
      initializeEmptyProfile();
    }
    
    // Load sessions to update stats
    loadSessionStats();
    
    setLoading(false);
  };

  const initializeEmptyProfile = () => {
    const emptyProfile = {
      name: '',
      email: '',
      username: '',
      bio: '',
      location: '',
      website: '',
      phone: '',
      birthday: '',
      avatar: null,
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      preferences: {
        language: 'English',
        timezone: 'PST (UTC-8)',
        dateFormat: 'MM/DD/YYYY',
        theme: 'dark'
      },
      social: {
        github: '',
        twitter: '',
        linkedin: ''
      },
      stats: {
        chats: 0,
        messages: 0,
        daysActive: 1
      }
    };
    setUserProfile(emptyProfile);
    setFormData(emptyProfile);
  };

  const loadSessionStats = () => {
    const sessions = localStorage.getItem("ai_chats");
    if (sessions) {
      try {
        const parsedSessions = JSON.parse(sessions);
        const totalMessages = parsedSessions.reduce((acc, session) => 
          acc + (session.messages?.length || 0), 0);
        
        setUserProfile(prev => ({
          ...prev,
          stats: {
            chats: parsedSessions.length,
            messages: totalMessages,
            daysActive: prev.stats?.daysActive || 1
          }
        }));
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
        setFormData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      const updatedProfile = {
        ...formData,
        lastActive: new Date().toISOString()
      };
      
      setUserProfile(updatedProfile);
      localStorage.setItem("user_profile", JSON.stringify(updatedProfile));
      setSaveStatus('success');
      setIsEditing(false);
      setPreviewAvatar(null);
      
      // Update theme if changed
      setDarkMode(updatedProfile.preferences?.theme === 'dark');
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }, 1000);
  };

  const cancelEdit = () => {
    setFormData(userProfile);
    setIsEditing(false);
    setPreviewAvatar(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="profile-page-loading">
        <Loader2 size={40} className="spin" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={`profile-page ${darkMode ? 'dark' : 'light'}`}>
      <div className="profile-page-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Back to Chat</span>
        </button>
        
        <h1>Profile</h1>
        
        {!isEditing ? (
          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="header-actions">
            <button className="btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={saveProfile}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {saveStatus === 'success' && (
        <div className="success-banner">
          <CheckCircle size={20} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div className="profile-content">
        {/* Left Sidebar - Profile Card */}
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {previewAvatar || userProfile.avatar ? (
                <img src={previewAvatar || userProfile.avatar} alt={userProfile.name || 'Profile'} />
              ) : (
                <User size={60} />
              )}
            </div>
            
            {isEditing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  className="upload-avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} />
                  Upload Photo
                </button>
              </>
            )}
          </div>

          <div className="profile-name-section">
            <h2>{userProfile.name || 'Your Name'}</h2>
            <p className="profile-username">{userProfile.username || '@username'}</p>
            <p className="profile-status">
              <Clock size={12} />
              Last active: Just now
            </p>
          </div>

          <div className="profile-stats-grid">
            <div className="stat-card">
              <MessageSquare size={20} />
              <div className="stat-info">
                <span className="stat-value">{userProfile.stats?.chats || 0}</span>
                <span className="stat-label">Chats</span>
              </div>
            </div>
            
            <div className="stat-card">
              <User size={20} />
              <div className="stat-info">
                <span className="stat-value">{userProfile.stats?.messages || 0}</span>
                <span className="stat-label">Messages</span>
              </div>
            </div>
            
            <div className="stat-card">
              <Calendar size={20} />
              <div className="stat-info">
                <span className="stat-value">{userProfile.stats?.daysActive || 1}</span>
                <span className="stat-label">Days Active</span>
              </div>
            </div>
          </div>

          <div className="profile-join-date">
            <Calendar size={14} />
            <span>Joined {formatDate(userProfile.joinDate)}</span>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="profile-main">
          {isEditing ? (
            // Edit Mode
            <div className="profile-edit-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      placeholder="@username"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself"
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      placeholder="yourwebsite.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Birthday</label>
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Social Links</h3>
                <div className="social-inputs">
                  <div className="social-input-group">
                    <Github size={18} />
                    <input
                      type="text"
                      value={formData.social?.github || ''}
                      onChange={(e) => handleSocialChange('github', e.target.value)}
                      placeholder="GitHub username"
                    />
                  </div>

                  <div className="social-input-group">
                    <Twitter size={18} />
                    <input
                      type="text"
                      value={formData.social?.twitter || ''}
                      onChange={(e) => handleSocialChange('twitter', e.target.value)}
                      placeholder="Twitter username"
                    />
                  </div>

                  <div className="social-input-group">
                    <Linkedin size={18} />
                    <input
                      type="text"
                      value={formData.social?.linkedin || ''}
                      onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                      placeholder="LinkedIn username"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Preferences</h3>
                <div className="preferences-grid">
                  <div className="preference-item">
                    <label>Language</label>
                    <select 
                      value={formData.preferences?.language || 'English'}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <label>Timezone</label>
                    <select 
                      value={formData.preferences?.timezone || 'PST (UTC-8)'}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    >
                      <option>PST (UTC-8)</option>
                      <option>EST (UTC-5)</option>
                      <option>GMT (UTC+0)</option>
                      <option>CET (UTC+1)</option>
                      <option>IST (UTC+5:30)</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <label>Date Format</label>
                    <select 
                      value={formData.preferences?.dateFormat || 'MM/DD/YYYY'}
                      onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                    >
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div className="preference-item">
                    <label>Theme</label>
                    <select 
                      value={formData.preferences?.theme || 'dark'}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="profile-view">
              {userProfile.bio && (
                <div className="profile-bio-section">
                  <h3>About</h3>
                  <p>{userProfile.bio}</p>
                </div>
              )}

              <div className="profile-details-section">
                <h3>Contact Information</h3>
                <div className="details-grid">
                  {userProfile.email ? (
                    <div className="detail-item">
                      <Mail size={18} />
                      <span>{userProfile.email}</span>
                    </div>
                  ) : (
                    <div className="detail-item empty">
                      <Mail size={18} />
                      <span className="empty-text">No email added</span>
                    </div>
                  )}
                  
                  {userProfile.phone ? (
                    <div className="detail-item">
                      <Phone size={18} />
                      <span>{userProfile.phone}</span>
                    </div>
                  ) : (
                    <div className="detail-item empty">
                      <Phone size={18} />
                      <span className="empty-text">No phone added</span>
                    </div>
                  )}
                  
                  {userProfile.location ? (
                    <div className="detail-item">
                      <MapPin size={18} />
                      <span>{userProfile.location}</span>
                    </div>
                  ) : (
                    <div className="detail-item empty">
                      <MapPin size={18} />
                      <span className="empty-text">No location added</span>
                    </div>
                  )}
                  
                  {userProfile.website ? (
                    <div className="detail-item">
                      <LinkIcon size={18} />
                      <a href={`https://${userProfile.website}`} target="_blank" rel="noopener noreferrer">
                        {userProfile.website}
                      </a>
                    </div>
                  ) : (
                    <div className="detail-item empty">
                      <LinkIcon size={18} />
                      <span className="empty-text">No website added</span>
                    </div>
                  )}
                  
                  {userProfile.birthday ? (
                    <div className="detail-item">
                      <Calendar size={18} />
                      <span>{formatDate(userProfile.birthday)}</span>
                    </div>
                  ) : (
                    <div className="detail-item empty">
                      <Calendar size={18} />
                      <span className="empty-text">No birthday added</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-social-section">
                <h3>Social Profiles</h3>
                <div className="social-links">
                  {userProfile.social?.github ? (
                    <a href={`https://github.com/${userProfile.social.github}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Github size={20} />
                    </a>
                  ) : (
                    <div className="social-link empty">
                      <Github size={20} />
                    </div>
                  )}
                  
                  {userProfile.social?.twitter ? (
                    <a href={`https://twitter.com/${userProfile.social.twitter}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Twitter size={20} />
                    </a>
                  ) : (
                    <div className="social-link empty">
                      <Twitter size={20} />
                    </div>
                  )}
                  
                  {userProfile.social?.linkedin ? (
                    <a href={`https://linkedin.com/in/${userProfile.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Linkedin size={20} />
                    </a>
                  ) : (
                    <div className="social-link empty">
                      <Linkedin size={20} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;