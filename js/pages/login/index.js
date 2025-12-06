import { Form } from "../../utils/Form.js";
import { auth } from "../../utils/auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");

  const form = new Form(loginForm, {
    validationRules: {
      password: {
        pattern: /.+/, // any non-empty
        message: "Password is required",
      },
    },
    errorMessages: {
      email: "Please enter a valid email address",
      required: "This field is required",
    },
    successMessageType: "toast",
    successMessage: "Logged in successfully!",
    showSuccessMessage: false,

    onSubmit: (data) => {
      console.log("📤 Submitting login:", data);

      // Validate credentials
      const result = auth.validateLogin(data.email, data.password);

      if (!result.success) {
        // Login failed
        window.ToastSystem.error(result.message, { duration: 4000 });

        // If user doesn't exist, redirect to register
        if (result.shouldRedirect === "register") {
          setTimeout(() => {
            window.location.href = "./register.html";
          }, 2000);
        }

        return false; // Stop form submission
      }
    },
    onSuccess: (data) => {
      console.log("✅ Login successful:", data);

      window.ToastSystem.success("Logged in successfully!");

      // Save logged in state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username: data.username,
          email: data.email,
        }),
      );

      // Redirect after toast
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1500);
    },
    onError: (data) => {
      console.log("❌ Validation failed:", data);
    },
  });

  console.log("Login form ready!");
});
