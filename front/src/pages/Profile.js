import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import '../css/Profile.css';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <Header />
      
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="profile-initials">
                {user?.firstName ? 
                  (user.firstName.charAt(0) + (user.lastName ? user.lastName.charAt(0) : '')).toUpperCase() :
                  user?.username?.charAt(0).toUpperCase()
                }
              </span>
            </div>
            <div className="profile-info">
              <h1 className="profile-title">Personal Information</h1>
              <p className="profile-subtitle">Manage your account details and preferences</p>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h2>Account Details</h2>
              <div className="profile-fields">
                <div className="field-group">
                  <label>Username</label>
                  <div className="field-value">{user?.username || 'Not provided'}</div>
                </div>
                
                <div className="field-row">
                  <div className="field-group">
                    <label>First Name</label>
                    <div className="field-value">{user?.firstName || 'Not provided'}</div>
                  </div>
                  <div className="field-group">
                    <label>Last Name</label>
                    <div className="field-value">{user?.lastName || 'Not provided'}</div>
                  </div>
                </div>

                <div className="field-group">
                  <label>Phone Number</label>
                  <div className="field-value">{user?.phone || 'Not provided'}</div>
                </div>

                <div className="field-group">
                  <label>Member Since</label>
                  <div className="field-value">October 2025</div>
                </div>
              </div>
              
              <button className="edit-profile-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit Profile
              </button>
            </div>

            <div className="profile-section">
              <h2>Preferences</h2>
              <div className="preferences-list">
                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Newsletter Subscription</h3>
                    <p>Receive updates about new menu items and special offers</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked={user?.newsletter || false} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <h3>Order Notifications</h3>
                    <p>Get notified about your order status updates</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="profile-section danger-zone">
              <h2>Account Management</h2>
              <div className="danger-actions">
                <button className="danger-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;