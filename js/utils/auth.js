/**
 * Auth utilities for managing users in localStorage
 */

export const auth = {
  /**
   * Get all registered users
   * @returns {Array} Array of user objects
   */
  getAllUsers() {
    const users = localStorage.getItem("registered_users");
    return users ? JSON.parse(users) : [];
  },

  /**
   * Check if user exists by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null
   */
  findUserByEmail(email) {
    const users = this.getAllUsers();
    return (
      users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ||
      null
    );
  },

  /**
   * Check if user exists by username
   * @param {string} username - Username
   * @returns {Object|null} User object or null
   */
  findUserByUsername(username) {
    const users = this.getAllUsers();
    return (
      users.find(
        (user) => user.username.toLowerCase() === username.toLowerCase(),
      ) || null
    );
  },

  /**
   * Register new user
   * @param {Object} userData - User data (username, email, password)
   * @returns {Object} Result with success boolean and message
   */
  registerUser(userData) {
    const users = this.getAllUsers();

    // Check if email already exists
    if (this.findUserByEmail(userData.email)) {
      return {
        success: false,
        message: "This email is already registered. Please log in instead.",
      };
    }

    // Check if username already exists
    if (this.findUserByUsername(userData.username)) {
      return {
        success: false,
        message: "This username is already taken. Please choose another one.",
      };
    }

    // Add new user
    const newUser = {
      id: Date.now(),
      username: userData.username,
      email: userData.email,
      password: userData.password, // In real app, this should be hashed!
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("registered_users", JSON.stringify(users));

    return {
      success: true,
      message: "Registration successful!",
      user: { username: newUser.username, email: newUser.email },
    };
  },

  /**
   * Validate login credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Result with success boolean and message
   */
  validateLogin(email, password) {
    const user = this.findUserByEmail(email);

    if (!user) {
      return {
        success: false,
        message: "No account found with this email. Please register first.",
        shouldRedirect: "register",
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: "Incorrect password. Please try again.",
      };
    }

    return {
      success: true,
      message: "Login successful!",
      user: { username: user.username, email: user.email },
    };
  },
};
