import { Form } from "../../utils/Form.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");

  const form = new Form(loginForm, {
    validationRules: {
      username: /^[a-zA-Z0-9_]{3,}$/,
    },
    errorMessages: {
      username: "Username must be at least 3 characters",
    },
    // toast messages
    successMessageType: "toast",
    successMessage: "Logged in successfully!",
    // Callbacks
    // onSubmit: (data) => {
    //   console.log("📤 Submitting:", data);
    // },
    onSuccess: (data) => {
      // Save logged in state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username: data.username,
          email: data.email,
        }),
      );

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 3000);
    },
    onError: (data) => {
      console.log("❌ Validation failed:", data);
    },
  });

  console.log("Form ready!");
});
