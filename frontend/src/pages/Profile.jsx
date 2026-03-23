import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  User, Mail, Phone, MapPin, Calendar, Link as LinkIcon,
  Github, Twitter, Linkedin, Edit2, Save, Camera, ArrowLeft,
  CheckCircle, Loader2, MessageSquare, Clock, X, LogOut
} from "lucide-react";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
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
      setFormData(parsedUser);
      setDarkMode(parsedUser.preferences?.theme === 'dark');
    }
    
    loadProfile(storedToken);
  }, []);

  const loadProfile = async (authToken) => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(response.data);
      setFormData(response.data);
      setDarkMode(response.data.preferences?.theme === 'dark');
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error loading profile:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
      setError("Failed to load profile");
    } finally {
      setLoading(false);
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

  const saveProfile = async () => {
    setSaveStatus('saving');
    setError(null);
    
    try {
      const response = await axios.put("http://localhost:5000/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setSaveStatus('success');
        setIsEditing(false);
        setPreviewAvatar(null);
        setDarkMode(response.data.user.preferences?.theme === 'dark');
        
        setTimeout(() => {
          setSaveStatus(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile. Please try again.");
      setSaveStatus('error');
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const cancelEdit = () => {
    setFormData(user);
    setIsEditing(false);
    setPreviewAvatar(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
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

  if (!user) {
    return (
      <div className="profile-page-loading">
        <p>No user data found</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
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
          <div className="header-actions">
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
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

      {error && (
        <div className="error-banner">
          <X size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="profile-content">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {previewAvatar || user.avatar ? (
                <img src={previewAvatar || user.avatar} alt={user.name || "Profile"} />
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
            <h2>{user.name || 'Your Name'}</h2>
            <p className="profile-username">{user.username || '@username'}</p>
            <p className="profile-email">{user.email}</p>
          </div>

          <div className="profile-stats-grid">
            <div className="stat-card">
              <MessageSquare size={20} />
              <div className="stat-info">
                <span className="stat-value">{user.stats?.chats || 0}</span>
                <span className="stat-label">Chats</span>
              </div>
            </div>
            <div className="stat-card">
              <User size={20} />
              <div className="stat-info">
                <span className="stat-value">{user.stats?.messages || 0}</span>
                <span className="stat-label">Messages</span>
              </div>
            </div>
            <div className="stat-card">
              <Calendar size={20} />
              <div className="stat-info">
                <span className="stat-value">{user.stats?.daysActive || 1}</span>
                <span className="stat-label">Days Active</span>
              </div>
            </div>
          </div>

          <div className="profile-join-date">
            <Calendar size={14} />
            <span>Joined {formatDate(user.joinDate) || 'Today'}</span>
          </div>
        </div>

        {/* Right Content */}
        <div className="profile-main">
          {isEditing ? (
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
            <div className="profile-view">
              {user.bio && (
                <div className="profile-bio-section">
                  <h3>About</h3>
                  <p>{user.bio}</p>
                </div>
              )}

              <div className="profile-details-section">
                <h3>Contact Information</h3>
                <div className="details-grid">
                  {user.email && (
                    <div className="detail-item">
                      <Mail size={18} />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="detail-item">
                      <Phone size={18} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="detail-item">
                      <MapPin size={18} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="detail-item">
                      <LinkIcon size={18} />
                      <a href={`https://${user.website}`} target="_blank" rel="noopener noreferrer">
                        {user.website}
                      </a>
                    </div>
                  )}
                  {user.birthday && (
                    <div className="detail-item">
                      <Calendar size={18} />
                      <span>{formatDate(user.birthday)}</span>
                    </div>
                  )}
                </div>

                {!user.email && !user.phone && !user.location && !user.website && !user.birthday && (
                  <p className="empty-state-message">No contact information added yet.</p>
                )}
              </div>

              <div className="profile-social-section">
                <h3>Social Profiles</h3>
                <div className="social-links">
                  {user.social?.github && (
                    <a href={`https://github.com/${user.social.github}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Github size={20} />
                    </a>
                  )}
                  {user.social?.twitter && (
                    <a href={`https://twitter.com/${user.social.twitter}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Twitter size={20} />
                    </a>
                  )}
                  {user.social?.linkedin && (
                    <a href={`https://linkedin.com/in/${user.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <Linkedin size={20} />
                    </a>
                  )}
                </div>

                {!user.social?.github && !user.social?.twitter && !user.social?.linkedin && (
                  <p className="empty-state-message">No social profiles added yet.</p>
                )}
              </div>

              <div className="profile-preferences-section">
                <h3>Preferences</h3>
                <div className="preferences-grid-view">
                  <div className="pref-item">
                    <span className="pref-label">Language:</span>
                    <span className="pref-value">{user.preferences?.language || 'English'}</span>
                  </div>
                  <div className="pref-item">
                    <span className="pref-label">Timezone:</span>
                    <span className="pref-value">{user.preferences?.timezone || 'PST (UTC-8)'}</span>
                  </div>
                  <div className="pref-item">
                    <span className="pref-label">Date Format:</span>
                    <span className="pref-value">{user.preferences?.dateFormat || 'MM/DD/YYYY'}</span>
                  </div>
                  <div className="pref-item">
                    <span className="pref-label">Theme:</span>
                    <span className="pref-value">{user.preferences?.theme || 'dark'}</span>
                  </div>
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