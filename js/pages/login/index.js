import { Form } from "../../Form.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");

  const form = new Form(loginForm, {
    validationRules: {
      username: /^[a-zA-Z0-9_]{3,}$/,
    },
    errorMessages: {
      email: "Wpisz poprawny email!",
      required: "To pole jest wymagane!",
      username: "Username must be at least 3 characters",
    },
    // ← NOWE! Callbacks ↓
    onSubmit: (data) => {
      console.log("📤 Submitting:", data);
    },
    onSuccess: (data) => {
      console.log("✅ Success! Data:", data);
      // Tutaj mógłbyś np. redirect do dashboard
      // window.location.href = '/dashboard.html';
    },
    onError: (data) => {
      console.log("❌ Validation failed:", data);
    },
  });

  console.log("Form ready!");
});
