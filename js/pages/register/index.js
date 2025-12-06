import { Form } from "../../utils/Form.js";
import { auth } from "../../utils/auth.js"; // ← DODAJ IMPORT

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("form");

  const form = new Form(registerForm, {
    validationRules: {
      username: /^[a-zA-Z0-9_]{3,}$/,
      password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    },
    errorMessages: {
      email: "Please enter a valid email address",
      required: "This field is required",
      username: "Username must be at least 3 characters (letters, numbers, _)",
      password:
        "Password must be at least 8 characters with letters and numbers",
      passwordMatch: "Passwords do not match",
    },
    successMessageType: "toast",
    successMessage: "Account created successfully!",
    showSuccessMessage: false, // show custom toast

    onSubmit: (data) => {
      console.log("📤 Submitting registration:", data);

      // Check if user already exists
      const result = auth.registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (!result.success) {
        // User already exists - show error toast
        window.ToastSystem.error(result.message, { duration: 4000 });

        // uncomment to redirect to login after 2 seconds
        // setTimeout(() => {
        //   window.location.href = "./login.html";
        // }, 2000);

        return false; // Stop form submission
      }
    },
    onSuccess: (data) => {
      console.log("✅ Registration successful:", data);

      window.ToastSystem.success("Account created successfully!");

      // Auto login - save state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username: data.username,
          email: data.email,
        }),
      );

      // Redirect to homepage
      // setTimeout(() => {
      //   window.location.href = "./index.html";
      // }, 1500);
    },
    onError: (data) => {
      console.log("❌ Validation failed:", data);
    },
  });

  console.log("Register form ready!");
});
