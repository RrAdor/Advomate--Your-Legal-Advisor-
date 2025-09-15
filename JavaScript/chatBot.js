// User session management
let currentUser = null;

// Check for user session on page load
window.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
  setupDropdownToggle();
  setupLogout();
});

function checkUserSession() {
  // Check for user data in sessionStorage (from userProfile navigation)
  const sessionUser = sessionStorage.getItem("currentUser");
  // Check for user email in localStorage (from login)
  const userEmail = localStorage.getItem("userEmail");

  if (sessionUser) {
    currentUser = JSON.parse(sessionUser);
    showUserWelcome();
  } else if (userEmail) {
    // User is logged in but navigated directly, try to load user data
    loadUserDataFromEmail(userEmail);
  } else {
    showLoginRegister();
  }
}

async function loadUserDataFromEmail(email) {
  try {
    // You would need to import Supabase here if available
    // For now, just show a generic welcome
    currentUser = { name: "User", email: email };
    showUserWelcome();

    // If Supabase is available, you could load full user data:
    /*
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (!error && data) {
            currentUser = data;
            document.getElementById('welcomeUserName').textContent = data.name || 'User';
        }
        */
  } catch (error) {
    console.error("Error loading user data:", error);
    showLoginRegister();
  }
}

function showUserWelcome() {
  const userWelcomeSection = document.getElementById("userWelcomeSection");
  const loginRegisterSection = document.getElementById("loginRegisterSection");
  const welcomeUserName = document.getElementById("welcomeUserName");

  if (currentUser && currentUser.name) {
    welcomeUserName.textContent = currentUser.name;
  }

  userWelcomeSection.style.display = "flex";
  loginRegisterSection.style.display = "none";
}

function showLoginRegister() {
  const userWelcomeSection = document.getElementById("userWelcomeSection");
  const loginRegisterSection = document.getElementById("loginRegisterSection");

  userWelcomeSection.style.display = "none";
  loginRegisterSection.style.display = "flex";
}

function setupDropdownToggle() {
  const userProfileIcon = document.getElementById("userProfileIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (userProfileIcon && dropdownMenu) {
    userProfileIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      dropdownMenu.classList.remove("show");
    });

    // Prevent dropdown from closing when clicking inside it
    dropdownMenu.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  // Clear all stored user data
  localStorage.removeItem("userEmail");
  sessionStorage.removeItem("currentUser");
  currentUser = null;

  // Show login/register section
  showLoginRegister();

  // Optionally redirect to home page
  // window.location.href = 'homePage.html';
}

// Existing chatbot code
const messagesContainer = document.querySelector(".chatbot-messages");
const input = document.querySelector(".message-input");
const sendBtn = document.querySelector(".send-btn");
const promptBtns = document.querySelectorAll(".prompt-btn");
const apiStatus = document.getElementById("api-status");

function appendMessage(text, sender = "bot") {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender}-message`;
  msgDiv.textContent = text;
  messagesContainer.appendChild(msgDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Use backend proxy for Together AI API calls
async function fetchLegalAnswer(question) {
  appendMessage(question, "user");
  appendMessage("Thinking...", "bot");

  try {
    const response = await fetch("http://localhost:3001/together-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert Bangladeshi legal assistant with comprehensive knowledge of Bangladesh's legal system, laws, and judicial procedures. You specialize exclusively in Bangladeshi law including: the Constitution of Bangladesh, Penal Code 1860, Civil Procedure Code 1908, Criminal Procedure Code 1898, Contract Act 1872, Labour Act 2006, Company Act 1994, Family laws (Muslim Family Laws Ordinance 1961, Hindu Marriage Act), Property laws, Commercial laws, and all other laws applicable in Bangladesh. \n\nIMPORTANT INSTRUCTIONS:\n1. ONLY provide legal advice based on Bangladeshi laws and regulations\n2. ALWAYS structure your responses in clear, numbered steps\n3. Reference specific Bangladeshi legal provisions, sections, and acts when applicable\n4. Include relevant court procedures and legal remedies available in Bangladesh\n5. If asked about non-Bangladeshi law, politely redirect to Bangladeshi legal matters\n6. Provide practical, actionable steps that can be taken within the Bangladeshi legal framework\n7. Mention relevant Bangladeshi courts, authorities, or legal institutions when appropriate\n\nFormat all responses as:\nStep 1: [First action/consideration]\nStep 2: [Second action/consideration]\n...and so on, with clear explanations for each step.",
          },
          { role: "user", content: question },
        ],
        max_tokens: 800,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // Remove the 'Thinking...' message
    const thinkingMsg = messagesContainer.querySelector(
      ".bot-message:last-child"
    );
    if (thinkingMsg && thinkingMsg.textContent === "Thinking...")
      thinkingMsg.remove();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      appendMessage(data.choices[0].message.content.trim(), "bot");
    } else if (data.error && data.error.message) {
      appendMessage("Error: " + data.error.message, "bot");
    } else {
      appendMessage(
        "Sorry, I could not get an answer. Please try again.",
        "bot"
      );
    }
  } catch (err) {
    const thinkingMsg = messagesContainer.querySelector(
      ".bot-message:last-child"
    );
    if (thinkingMsg && thinkingMsg.textContent === "Thinking...")
      thinkingMsg.remove();
    appendMessage(
      "Sorry, there was an error connecting to the legal assistant. " +
        (err.message || err),
      "bot"
    );
  }
}

sendBtn.addEventListener("click", () => {
  const question = input.value.trim();
  if (question) {
    fetchLegalAnswer(question);
    input.value = "";
  }
});
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
promptBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    fetchLegalAnswer(btn.textContent);
  });
});
apiChoice.addEventListener("change", () => {
  const serviceName = apiChoice.options[apiChoice.selectedIndex].text;
  apiStatus.textContent = `Ready to use ${serviceName}`;
});
