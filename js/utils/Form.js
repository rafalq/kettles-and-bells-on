export class Form {
  /**
   * Creates a new Form instance with validation
   * @param {HTMLFormElement} formElement - The form DOM element
   * @param {Object} options - Configuration options
   * @param {Object} options.validationRules - Custom validation rules
   * @param {Object} options.errorMessages - Custom error messages
   */
  constructor(formElement, options = {}) {
    this.form = formElement;
    this.inputs = this.form.querySelectorAll("input, textarea");
    this.submitButton = this.form.querySelector('button[type="submit"]');
    this.validationRules = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\d\s\-\+\(\)]+$/,
      password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
      ...options.validationRules,
    };
    this.errorMessages = {
      required: "This field is required",
      email: "Please enter a valid email address",
      phone: "Please enter a valid phone number",
      password:
        "Password must be at least 8 characters with letters and numbers",
      passwordMatch: "Passwords do not match",
      ...options.errorMessages,
    };

    this.callbacks = {
      onSubmit: options.onSubmit || null,
      onSuccess: options.onSuccess || null,
      onError: options.onError || null,
    };

    this.options = {
      showSuccessMessage: options.showSuccessMessage !== false, // default true
      successMessageType: options.successMessageType || "overlay", // 'overlay' or 'toast'
      successMessageDuration: 2000,
      successMessage:
        options.successMessage || "Your form has been submitted successfully.",
    };

    this.formData = {};
    this.init();
  }

  /**
   * Initializes show/hide password toggle buttons
   * @private
   */
  initPasswordToggles() {
    const passwordInputs = this.form.querySelectorAll('input[type="password"]');

    passwordInputs.forEach((input) => {
      // Skip if toggle already exists
      if (input.parentElement.querySelector(".form__password-toggle")) {
        return;
      }

      // Create toggle button
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = "form__password-toggle";
      toggleBtn.setAttribute("aria-label", "Show password");

      const icon = document.createElement("i");
      icon.className = "icon-basic-eye"; // eye open
      toggleBtn.appendChild(icon);

      // Position relative for parent
      input.parentElement.style.position = "relative";

      // Insert after input
      input.after(toggleBtn);

      // Toggle handler
      toggleBtn.addEventListener("click", () => {
        const isPassword = input.type === "password";

        // Toggle type
        input.type = isPassword ? "text" : "password";

        // Toggle icon
        icon.className = isPassword
          ? "icon-basic-eye-closed"
          : "icon-basic-eye";

        // Update aria-label
        toggleBtn.setAttribute(
          "aria-label",
          isPassword ? "Hide password" : "Show password",
        );
      });
    });
  }

  /**
   * Initializes form validation listeners and disables HTML5 validation
   * @private
   */

  init() {
    // Disable HTML5 validation to use custom validation
    this.form.setAttribute("novalidate", "");

    // Add submit event listener
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Add real-time validation on blur
    this.inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearError(input));

      //  input.addEventListener("input", () => {
      //   this.clearError(input);
      //   // Validate on input if field was previously touched
      //   if (
      //     input.classList.contains("form__input--invalid") ||
      //     input.classList.contains("form__input--valid")
      //   ) {
      //     this.validateField(input);
      //   }
      // });
    });

    // Initialize form data from localStorage if available
    this.loadFromStorage();

    // Initialize password toggles
    this.initPasswordToggles();
  }

  /**
   * Validates a single form field based on its type and custom rules
   * @param {HTMLInputElement|HTMLTextAreaElement} input - The input element to validate
   * @returns {boolean} True if valid, false if invalid
   * @example
   * // Validates email input
   * form.validateField(emailInput);
   *
   * // Custom validation with data-validate attribute
   * <input data-validate="username" />
   */

  validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const id = input.id;
    const required = input.hasAttribute("required");

    // Clear previous error
    this.clearError(input);

    // Check if required field is empty
    if (required && !value) {
      this.showError(input, this.errorMessages.required);
      return false;
    }

    // Email validation
    if (type === "email" && value) {
      if (!this.validationRules.email.test(value)) {
        this.showError(input, this.errorMessages.email);
        return false;
      }
    }
    // Custom validation based on data-validat attribute
    const customValidation = input.getAttribute("data-validate");
    if (customValidation && value && this.validationRules[customValidation]) {
      if (!this.validationRules[customValidation].test(value)) {
        this.showError(input, this.errorMessages[customValidation]);
        return false;
      }
    }

    // Phone validation
    if (type === "tel" && value) {
      if (!this.validationRules.phone.test(value)) {
        this.showError(input, this.errorMessages.phone);
        return false;
      }
    }

    // Password validation
    if (type === "password" && value && id === "password") {
      if (!this.validationRules.password.test(value)) {
        this.showError(input, this.errorMessages.password);
        return false;
      }
    }

    // Password confirmation validation
    if (id === "password-confirmation" && value) {
      const passwordInput = this.form.querySelector("#password");
      if (passwordInput && value !== passwordInput.value) {
        this.showError(input, this.errorMessages.passwordMatch);
        return false;
      }
    }

    // Add valid class if field has value and passed validation
    if (value) {
      input.classList.add("form__input--valid");
      input.classList.remove("form__input--invalid");
    }

    return true;
  }

  /**
   * Displays an error message for a specific input field
   * @param {HTMLInputElement|HTMLTextAreaElement} input - The input element with error
   * @param {string} message - The error message to display
   */

  showError(input, message) {
    // Add invalid class, remove valid class
    input.classList.add("form__input--invalid");
    input.classList.remove("form__input--valid");

    // Add error class to input
    input.classList.add("form__input--error");

    // Create or update error message element
    let errorElement = input
      .closest(".form__group")
      .querySelector(".form__error");

    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.className = "form__error";
      input.closest(".form__group").appendChild(errorElement);
    }

    errorElement.textContent = message;
  }

  /**
   * Removes error styling and message from an input field
   * @param {HTMLInputElement|HTMLTextAreaElement} input - The input element to clear
   */

  clearError(input) {
    input.classList.remove("form__input--invalid");
    input.classList.remove("form__input--valid");

    input.classList.remove("form__input--error");
    const errorElement = input
      .closest(".form__group")
      .querySelector(".form__error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Validates all form fields
   * @returns {boolean} True if all fields are valid, false otherwise
   */

  validateForm() {
    let isValid = true;
    this.inputs.forEach((input) => {
      if (input.hasAttribute("required") || input.value.trim()) {
        if (!this.validateField(input)) {
          isValid = false;
        }
      }
    });
    return isValid;
  }

  /**
   * Handles form submission, validates all fields, and saves to localStorage
   * @param {Event} e - The form submit event
   */

  handleSubmit(e) {
    e.preventDefault();

    // Collect form data FIRST (before validation)
    this.collectFormData();

    // Validate all fields
    if (!this.validateForm()) {
      this.showFormError("Please fix all errors before submitting");

      if (this.callbacks.onError) {
        this.callbacks.onError(this.formData);
      }

      return;
    }

    // Call custom onSubmit callback if provided
    if (this.callbacks.onSubmit) {
      const result = this.callbacks.onSubmit(this.formData);

      // If callback returns false, stop submission
      if (result === false) {
        return;
      }
    }

    // Save to localStorage
    this.saveToStorage();

    // Show success message
    if (this.options.showSuccessMessage) {
      if (this.options.successMessageType === "toast") {
        this.showToast(this.options.successMessage);
      } else {
        this.showSuccessMessage();
      }
    }

    // Call success callback if provided
    if (this.callbacks.onSuccess) {
      this.callbacks.onSuccess(this.formData);
    }

    // Reset form after delay
    setTimeout(() => {
      this.form.reset();
      this.clearAllErrors();

      // Remove validation classes
      this.inputs.forEach((input) => {
        input.classList.remove("form__input--valid");
        input.classList.remove("form__input--invalid");
      });
    }, 2000);
  }

  /**
   * Collects all form data including checkboxes and radio buttons
   * @returns {Object} Object containing all form field values
   */

  collectFormData() {
    this.formData = {};
    const formDataObj = new FormData(this.form);

    for (let [key, value] of formDataObj.entries()) {
      this.formData[key] = value;
    }

    // Also collect checked checkboxes and radio buttons
    const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
    const radios = this.form.querySelectorAll('input[type="radio"]:checked');

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        if (!this.formData.interests) {
          this.formData.interests = [];
        }
        this.formData.interests.push(checkbox.id);
      }
    });

    radios.forEach((radio) => {
      this.formData[radio.name] = radio.value || radio.id;
    });

    return this.formData;
  }

  /**
   * Saves form data to localStorage with timestamp
   * Keeps history of last 10 submissions
   */
  saveToStorage() {
    const formId = this.form.id || "form_data";
    const timestamp = new Date().toISOString();

    // Check if "remember me" checkbox exists and is checked
    const rememberMe = this.form.querySelector('input[name="remember-me"]');
    const shouldRemember = rememberMe ? rememberMe.checked : true; // default true if no checkbox

    const dataToSave = {
      ...this.formData,
      submittedAt: timestamp,
    };

    try {
      if (shouldRemember) {
        // Save current submission
        localStorage.setItem(formId, JSON.stringify(dataToSave));
      } else {
        // Clear saved data if not remembering
        localStorage.removeItem(formId);
      }

      // Always save to history
      const allSubmissions =
        JSON.parse(localStorage.getItem(`${formId}_history`)) || [];
      allSubmissions.push(dataToSave);

      if (allSubmissions.length > 10) {
        allSubmissions.shift();
      }

      localStorage.setItem(`${formId}_history`, JSON.stringify(allSubmissions));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  /**
   * Loads previously saved form data from localStorage and auto-fills the form
   * @private
   */
  loadFromStorage() {
    const formId = this.form.id || "form_data";
    try {
      const savedData = localStorage.getItem(formId);
      if (savedData) {
        const data = JSON.parse(savedData);
        // Auto-populate form with saved data
        this.populateForm(data);

        // Check the "remember me" checkbox
        const rememberMe = this.form.querySelector('input[name="remember-me"]');
        if (rememberMe) {
          rememberMe.checked = true;
        }
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }

  /**
   * Populates form fields with provided data
   * @param {Object} data - Object with key-value pairs matching input names
   */
  populateForm(data) {
    Object.keys(data).forEach((key) => {
      const input = this.form.querySelector(`[name="${key}"]`);
      if (input && key !== "submittedAt") {
        input.value = data[key];
      }
    });
  }

  /**
   * Displays a success overlay message with animation
   */
  showSuccessMessage() {
    // Create success message overlay
    const successOverlay = document.createElement("div");
    successOverlay.className = "form__success-overlay";
    successOverlay.innerHTML = `
    <div class="form__success-message">
      <i class="icon-basic-elaboration-browser-check"></i>
      <h3>Success!</h3>
      <p>Your message has been sent successfully.</p>
    </div>
  `;

    this.form.appendChild(successOverlay);

    // Remove after 2 seconds
    setTimeout(() => {
      successOverlay.remove();
    }, 2000);
  }

  /**
   * Displays a toast notification
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   */
  showToast(message, type = "success") {
    if (typeof window.ToastSystem === "undefined") {
      console.warn("Toast system not loaded, falling back to overlay");
      this.showSuccessMessage();
      return;
    }

    window.ToastSystem[type](message, {
      duration: 3000,
    });
  }

  /**
   * Displays a general form error message at the top of the form
   * @param {string} message - The error message to display
   */
  showFormError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "form__general-error";
    errorDiv.textContent = message;

    // Remove any existing general error
    const existingError = this.form.querySelector(".form__general-error");
    if (existingError) {
      existingError.remove();
    }

    this.form.insertBefore(errorDiv, this.form.firstChild);

    // Remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * Removes all error messages and error styling from the form
   */
  clearAllErrors() {
    const errors = this.form.querySelectorAll(".form__error");
    errors.forEach((error) => error.remove());

    this.inputs.forEach((input) => {
      input.classList.remove("form__input--error");
    });
  }

  /**
   * Resets the form to its initial state and clears all data
   */
  reset() {
    this.form.reset();
    this.clearAllErrors();
    this.formData = {};

    // Remove validation classes
    this.inputs.forEach((input) => {
      input.classList.remove("form__input--valid");
      input.classList.remove("form__input--invalid");
    });
  }

  /**
   * Retrieves all form submissions from localStorage
   * @static
   * @param {string} formId - The form identifier
   * @returns {Array} Array of submission objects
   */
  static getSubmissions(formId) {
    try {
      const submissions = localStorage.getItem(`${formId}_history`);
      return submissions ? JSON.parse(submissions) : [];
    } catch (error) {
      console.error("Error retrieving submissions:", error);
      return [];
    }
  }

  /**
   * Clears all form data from localStorage
   * @static
   * @param {string} formId - The form identifier
   */
  static clearStorage(formId) {
    try {
      localStorage.removeItem(formId);
      localStorage.removeItem(`${formId}_history`);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
}
