const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwYV5JJjOZPLc_qRXaHZVpFoALGMWfVu3xzA6sLob7nVdxpZl_G5yhwqPLkwZ7AB5Lm/exec";


// CONTACT FORM
const contactForm =
  document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const button =
      contactForm.querySelector('button[type="submit"]');

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Sending...";

    const data = {
      formType: "contact",
      name: contactForm.elements["name"].value.trim(),
      email: contactForm.elements["email"].value.trim(),
      phone: contactForm.elements["phone"].value.trim(),
      subject: contactForm.elements["subject"].value.trim(),
      message: contactForm.elements["message"].value.trim()
    };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
      });

      alert("Message sent successfully!");
      contactForm.reset();

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");

    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
}


// ALL LEAD / ENQUIRY FORMS
// Delegated on document (not a one-time querySelectorAll) because the
// enquiry popup form is injected later via fetch by components.js, after
// this script has already run.
document.addEventListener("submit", async function (e) {
  const form = e.target.closest(".lead-form");
  if (!form) return;

  e.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  const originalText = button.textContent;

  button.disabled = true;
  button.textContent = "Submitting...";

  const data = {
    formType: "lead",
    name: form.elements["name"].value.trim(),
    phone: form.elements["phone"].value.trim(),
    email: form.elements["email"].value.trim(),
    course: form.elements["course"].value,
    message: form.elements["message"].value.trim()
  };

  // Optional context fields (only sent if the form includes them, e.g. the
  // Previous Year Question Paper subscribe popup passes source/paper info).
  ["source", "paperTitle", "paperYear"].forEach(function (key) {
    if (form.elements[key]) data[key] = form.elements[key].value;
  });

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(data)
    });

    alert("Enquiry submitted successfully!");
    form.reset();
    form.dispatchEvent(new CustomEvent("leadFormSuccess", { bubbles: true, detail: data }));

  } catch (error) {
    console.error(error);
    alert("Something went wrong. Please try again.");
    form.dispatchEvent(new CustomEvent("leadFormError", { bubbles: true, detail: error }));

  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
});
