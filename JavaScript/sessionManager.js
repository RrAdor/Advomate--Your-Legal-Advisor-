// Session Management Utility for Advomate
// Handles user session across all pages

class SessionManager {
  constructor() {
    this.userKey = "advomate_user";
    this.sessionKey = "advomate_session";
  }

  // Store user session data
  setUserSession(userData) {
    try {
      const sessionData = {
        ...userData,
        loginTime: new Date().toISOString(),
        isLoggedIn: true,
      };

      localStorage.setItem(this.userKey, JSON.stringify(sessionData));
      localStorage.setItem(this.sessionKey, "active");

      console.log("User session stored:", sessionData);
      return true;
    } catch (error) {
      console.error("Error storing user session:", error);
      return false;
    }
  }

  // Get current user session
  getUserSession() {
    try {
      const sessionStatus = localStorage.getItem(this.sessionKey);
      const userData = localStorage.getItem(this.userKey);

      if (sessionStatus === "active" && userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error("Error retrieving user session:", error);
      return null;
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    const session = this.getUserSession();
    return session && session.isLoggedIn === true;
  }

  // Get user's display name (full name or first name)
  getUserDisplayName() {
    const session = this.getUserSession();
    if (!session) return null;

    // Try to get full name first, then fall back to first name or email
    return (
      session.full_name ||
      session.first_name ||
      session.name ||
      session.email?.split("@")[0] ||
      "User"
    );
  }

  // Get user email
  getUserEmail() {
    const session = this.getUserSession();
    return session ? session.email : null;
  }

  // Clear user session (logout)
  clearUserSession() {
    try {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.sessionKey);
      // Also clear the old userEmail key for backward compatibility
      localStorage.removeItem("userEmail");
      console.log("User session cleared");
      return true;
    } catch (error) {
      console.error("Error clearing user session:", error);
      return false;
    }
  }

  // Update header to show user info or login button
  updatePageHeader() {
    const loginRegisterDiv = document.querySelector(".login-register");
    if (!loginRegisterDiv) return;

    if (this.isLoggedIn()) {
      const userName = this.getUserDisplayName();
      loginRegisterDiv.innerHTML = `
        <div class="user-info">
          <span class="welcome-text">Welcome, ${userName}</span>
          <div class="user-menu">
            <a href="userProfile.html" class="profile-link">Profile</a>
            <button class="logout-btn" onclick="sessionManager.logout()">Logout</button>
          </div>
        </div>
      `;

      // Add some basic styling
      if (!document.getElementById("session-styles")) {
        const style = document.createElement("style");
        style.id = "session-styles";
        style.textContent = `
          .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .welcome-text {
            color: white;
            font-weight: 500;
          }
          .user-menu {
            display: flex;
            gap: 10px;
            align-items: center;
          }
          .profile-link {
            color: #007bff;
            text-decoration: none;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background-color 0.3s;
          }
          .profile-link:hover {
            background-color: #f8f9fa;
          }
          .logout-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
          }
          .logout-btn:hover {
            background: #c82333;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      // Show login/register buttons
      loginRegisterDiv.innerHTML = `
        <a href="login.html">Log In</a>
        <a href="login.html">Register</a>
      `;
    }
  }

  // Logout function
  logout() {
    if (confirm("Are you sure you want to logout?")) {
      this.clearUserSession();
      // Redirect to login page
      window.location.href = "login.html";
    }
  }

  // Initialize session management on page load
  init() {
    // Update header when page loads
    document.addEventListener("DOMContentLoaded", () => {
      this.updatePageHeader();
    });

    // If DOM is already loaded, update immediately
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.updatePageHeader()
      );
    } else {
      this.updatePageHeader();
    }
  }

  // Migrate old session data (for backward compatibility)
  migrateOldSession() {
    const oldEmail = localStorage.getItem("userEmail");
    if (oldEmail && !this.isLoggedIn()) {
      // If we have old email but no new session, try to maintain compatibility
      this.setUserSession({ email: oldEmail });
    }
  }
}

// Create global instance
const sessionManager = new SessionManager();

// Auto-initialize
sessionManager.init();
sessionManager.migrateOldSession();

// Export for use in other scripts
window.sessionManager = sessionManager;
