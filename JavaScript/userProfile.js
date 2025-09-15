import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://ognyvbpuccecvjmqjnjs.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbnl2YnB1Y2NlY3ZqbXFqbmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyOTEzNTksImV4cCI6MjA2NTg2NzM1OX0.rYnBV_CFotw0Z-FysCvqGhTbmrmJE9_gQ44N3F_u8CU";
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUserData = null;

window.addEventListener("DOMContentLoaded", async () => {
  // Use session manager to get user data
  const userData = sessionManager.getUserSession();
  if (!userData) {
    // Redirect to login if no session
    window.location.href = "login.html";
    return;
  }

  // Store user data globally
  currentUserData = userData;

  // Update profile fields
  document.querySelector(".user-name").textContent =
    userData.name || userData.full_name || "";

  // Update welcome message
  const welcomeMessage = document.getElementById("welcomeMessage");
  if (welcomeMessage) {
    welcomeMessage.textContent = `Welcome, ${
      userData.name || userData.full_name || "User"
    }!`;
  }

  document.querySelector(".info-content h4").textContent = "Full Name";
  document.querySelector(".info-content p").textContent =
    userData.name || userData.full_name || "";
  const infoItems = document.querySelectorAll(".info-item");
  if (infoItems[1])
    infoItems[1].querySelector("p").textContent = userData.location || "";
  if (infoItems[2])
    infoItems[2].querySelector("p").textContent = userData.phone || "";
  if (infoItems[3])
    infoItems[3].querySelector("p").textContent = userData.email || "";

  // Load hired lawyers
  console.log("User data:", userData);
  console.log("User ID:", userData.id);
  await loadHiredLawyers(userData.id);

  // Load user cases
  await loadUserCases(userData.id);

  // Setup navigation link with user data
  setupHireLawyerNavigation();
  setupChatBotNavigation();
  setupCaseTrackerNavigation();
  setupUserDropdown();
  setupLogout();

  // Listen for page visibility changes to refresh cases when user returns
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && currentUserData) {
      loadUserCases(currentUserData.id);
    }
  });
});

async function loadUserCases(userId) {
  const casesList = document.getElementById("casesList");

  try {
    // Fetch cases for the current user
    const { data: cases, error } = await supabase
      .from("cases")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching cases:", error);
      casesList.innerHTML = `
                <div class="case-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="case-content">
                        <h4>Error Loading Cases</h4>
                        <p>Unable to load your cases at this time.</p>
                    </div>
                </div>
            `;
      return;
    }

    if (!cases || cases.length === 0) {
      casesList.innerHTML = `
                <div class="no-cases">
                    <i class="fas fa-folder-open"></i>
                    <h4>No Cases Found</h4>
                    <p>You haven't added any cases yet. Visit the <a href="track.html" style="color: #3498db;">Case Tracker</a> to add your first case.</p>
                </div>
            `;
      return;
    }

    // Render cases
    casesList.innerHTML = cases
      .map((caseItem) => {
        const formattedDate = new Date(caseItem.date).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );

        const statusClass = caseItem.status === "solved" ? "solved" : "ongoing";
        const statusIcon =
          caseItem.status === "solved" ? "fas fa-check-circle" : "fas fa-clock";
        const caseIcon = getCaseTypeIcon(caseItem.case_type);

        return `
                <div class="case-item">
                    <i class="${caseIcon}"></i>
                    <div class="case-content">
                        <h4>${caseItem.case_type}</h4>
                        <p class="case-date">Filed on ${formattedDate}</p>
                        <div class="case-status ${statusClass}">
                            <i class="${statusIcon}"></i>
                            ${
                              caseItem.status === "solved"
                                ? "Solved"
                                : "Ongoing"
                            }
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  } catch (error) {
    console.error("Error loading cases:", error);
    casesList.innerHTML = `
            <div class="case-item">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="case-content">
                    <h4>Error</h4>
                    <p>Failed to load cases. Please try again later.</p>
                </div>
            </div>
        `;
  }
}

function getCaseTypeIcon(caseType) {
  const iconMap = {
    "Family Law": "fas fa-home",
    "Criminal Law": "fas fa-gavel",
    "Civil Law": "fas fa-balance-scale",
    "Corporate Law": "fas fa-building",
    "Employment Law": "fas fa-briefcase",
    "Immigration Law": "fas fa-passport",
    "Property Law": "fas fa-key",
    "Tax Law": "fas fa-calculator",
    "Environmental Law": "fas fa-leaf",
    "Constitutional Law": "fas fa-landmark",
    "Administrative Law": "fas fa-university",
    "Contract Law": "fas fa-handshake",
  };

  return iconMap[caseType] || "fas fa-file-alt";
}

function setupHireLawyerNavigation() {
  const hireLawyerLink = document.getElementById("hireLawyerLink");
  if (hireLawyerLink && currentUserData) {
    hireLawyerLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Store user data for lawyer page
      sessionStorage.setItem("currentUser", JSON.stringify(currentUserData));
      // Navigate to lawyer page
      window.location.href = "lawyer.html";
    });
  }
}

function setupCaseTrackerNavigation() {
  const caseTrackerLink = document.querySelector('a[href="#case-tracker"]');
  if (caseTrackerLink && currentUserData) {
    caseTrackerLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Store user data for track page
      sessionStorage.setItem("currentUser", JSON.stringify(currentUserData));
      localStorage.setItem("userEmail", currentUserData.email);
      // Navigate to track page
      window.location.href = "track.html";
    });
  }
}

function setupChatBotNavigation() {
  const chatBotLink = document.getElementById("chatBotLink");
  const topChatBotLink = document.getElementById("topChatBotLink");

  const handleChatBotNavigation = (e) => {
    e.preventDefault();
    if (currentUserData) {
      // Store user data for chatBot page
      sessionStorage.setItem("currentUser", JSON.stringify(currentUserData));
      localStorage.setItem("userEmail", currentUserData.email);
    }
    // Navigate to chatBot page
    window.location.href = "chatBot.html";
  };

  if (chatBotLink) {
    chatBotLink.addEventListener("click", handleChatBotNavigation);
  }

  if (topChatBotLink) {
    topChatBotLink.addEventListener("click", handleChatBotNavigation);
  }
}

async function loadHiredLawyers(userId) {
  const lawyersGrid = document.getElementById("lawyersGrid");

  console.log("Loading hired lawyers for user ID:", userId);

  try {
    // First, try to get hired lawyers from the user_lawyers junction table (if it exists)
    let hiredLawyers = [];

    // Try the new approach first - using a separate user_lawyers table
    const { data: userLawyerRelations, error: relationError } = await supabase
      .from("user_lawyers")
      .select(
        `
        lawyer_id,
        lawyer (*)
      `
      )
      .eq("user_id", userId);

    if (
      !relationError &&
      userLawyerRelations &&
      userLawyerRelations.length > 0
    ) {
      // New approach: using junction table
      hiredLawyers = userLawyerRelations.map((relation) => relation.lawyer);
      console.log("Found hired lawyers using junction table:", hiredLawyers);
    } else {
      // Fallback to old approach: using the hired_lawyers field in users table
      console.log("Junction table not found or empty, trying old approach...");

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("hired_lawyers")
        .eq("id", userId)
        .single();

      if (!userError && userData && userData.hired_lawyers) {
        // Old approach: single lawyer stored as phone number
        const { data: lawyer, error: lawyerError } = await supabase
          .from("lawyer")
          .select("*")
          .eq("phone", userData.hired_lawyers)
          .single();

        if (!lawyerError && lawyer) {
          hiredLawyers = [lawyer];
          console.log("Found hired lawyer using old approach:", lawyer);
        }
      }
    }

    if (hiredLawyers.length === 0) {
      console.log("No hired lawyers found");
      lawyersGrid.innerHTML = `
        <div class="lawyer-card placeholder">
          <i class="fas fa-user-tie"></i>
          <p>No lawyers hired yet. Visit the <a href="lawyer.html">Find Lawyers</a> page to hire a lawyer.</p>
        </div>
      `;
      return;
    }

    // Display all hired lawyers
    lawyersGrid.innerHTML = hiredLawyers
      .map(
        (lawyer) => `
      <div class="lawyer-card">
        <div class="lawyer-info">
          <h3>${lawyer.name || "Unknown"}</h3>
          <p><strong>Phone:</strong> ${lawyer.phone || "N/A"}</p>
          <p><strong>Email:</strong> ${lawyer.email || "N/A"}</p>
          <p><strong>Gender:</strong> ${lawyer.gender || "N/A"}</p>
          <p><strong>Location:</strong> ${lawyer.location || "N/A"}</p>
          <p><strong>Category:</strong> ${lawyer.category || "N/A"}</p>
          <div class="lawyer-actions">
            <button class="btn-remove" onclick="removeLawyer(${
              lawyer.id || lawyer.phone
            })">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    console.log(`Displayed ${hiredLawyers.length} hired lawyer(s)`);
  } catch (err) {
    console.error("Error in loadHiredLawyers:", err);
    lawyersGrid.innerHTML = `
      <div class="lawyer-card placeholder">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading hired lawyer information.</p>
      </div>
    `;
  }
}

// Function to remove a hired lawyer
window.removeLawyer = async function (lawyerId) {
  if (!currentUserData) {
    alert("User data not found. Please refresh the page.");
    return;
  }

  const confirmRemove = confirm("Are you sure you want to remove this lawyer?");
  if (!confirmRemove) return;

  try {
    // Try to remove from user_lawyers table first
    const { error: relationError } = await supabase
      .from("user_lawyers")
      .delete()
      .eq("user_id", currentUserData.id)
      .eq("lawyer_id", lawyerId);

    if (!relationError) {
      console.log("Lawyer removed from user_lawyers table");
    } else {
      // Fallback: try to clear the hired_lawyers field in users table
      console.log("Trying fallback approach to remove lawyer...");
      const { error: userError } = await supabase
        .from("users")
        .update({ hired_lawyers: null })
        .eq("id", currentUserData.id);

      if (userError) {
        console.error("Error removing lawyer:", userError);
        alert("Failed to remove lawyer. Please try again.");
        return;
      }
    }

    // Refresh the lawyers display
    await loadHiredLawyers(currentUserData.id);
    alert("Lawyer removed successfully!");
  } catch (error) {
    console.error("Error removing lawyer:", error);
    alert("An error occurred while removing the lawyer.");
  }
};

function setupUserDropdown() {
  const userProfileIcon = document.getElementById("userProfileIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (userProfileIcon && dropdownMenu) {
    userProfileIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".user-dropdown")) {
        dropdownMenu.classList.remove("show");
      }
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

  // Show confirmation message
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    // Redirect to home page or login page
    window.location.href = "homePage.html";
  }
}
