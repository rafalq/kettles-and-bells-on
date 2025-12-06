import { Form } from "../../utils/Form.js";

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.querySelector("#contact-form");

  if (contactForm) {
    const form = new Form(contactForm, {
      validationRules: {
        phone: /^[\d\s\-\+\(\)]{9,}$/, // min 9 digits for phone
      },
      errorMessages: {
        email: "Please enter a valid email address",
        phone: "Please enter a valid phone number",
        required: "This field is required",
      },
      successMessageType: "toast",
      successMessage: "Message sent successfully! We'll get back to you soon.",

      onSubmit: (data) => {
        console.log("📤 Sending contact message:", data);
      },
      onSuccess: (data) => {
        console.log("✅ Message sent:", data);
      },
      onError: (data) => {
        console.log("❌ Validation failed:", data);
      },
    });

    console.log("Contact form ready!");
  }
});
