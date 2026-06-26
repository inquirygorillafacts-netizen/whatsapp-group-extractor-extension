const googleLoginBtn = document.getElementById('googleLoginBtn');
const injectBtn = document.getElementById('injectBtn');
const userInfo = document.getElementById('userInfo');
const userEmailSpan = document.getElementById('userEmail');
const userCreditsSpan = document.getElementById('userCredits');
const loader = document.getElementById('loader');

// Check if already logged in
chrome.storage.local.get(['waUser'], async (data) => {
  if (data.waUser) {
    showLoggedInState(data.waUser);
  }
});

// Real Google Login Flow
googleLoginBtn.addEventListener('click', () => {
  googleLoginBtn.style.display = 'none';
  loader.style.display = 'block';

  // Request OAuth Token
  chrome.identity.getAuthToken({ interactive: true }, function(token) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      alert("Google Login Failed: " + chrome.runtime.lastError.message + "\\n\\n(⚠️ Bhai, aapne galti se 'Web application' select kiya tha jabki 'Chrome app' karna tha. Agar error aaye toh Google Cloud Console mein nayi ID banaiye 'Chrome app' type select karke!)");
      loader.style.display = 'none';
      googleLoginBtn.style.display = 'flex';
      return;
    }

    // Fetch real user info from Google using the token
    fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
      .then(response => response.json())
      .then(async userInfo => {
        const realUser = {
          uid: userInfo.id,
          email: userInfo.email,
          name: userInfo.name || "User",
          picture: userInfo.picture || ""
        };

        // Connect to Firestore and check/give credits
        const credits = await checkOrInitializeCredits(realUser.uid);
        realUser.credits = credits;

        // Save real session
        chrome.storage.local.set({ waUser: realUser });
        showLoggedInState(realUser);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        alert("Network Error: Could not fetch your profile.");
        loader.style.display = 'none';
        googleLoginBtn.style.display = 'flex';
      });
  });
});

async function checkOrInitializeCredits(uid) {
  try {
    const url = 'https://firestore.googleapis.com/v1/projects/nazdik-pro/databases/(default)/documents/users/' + uid;
    let res = await fetch(url);
    
    if (res.status === 404) {
      // New user! Give 2 free credits.
      const createRes = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            credits: { integerValue: 2 }
          }
        })
      });
      return 2;
    } else if (res.status === 200) {
      const data = await res.json();
      return parseInt(data.fields.credits.integerValue) || 0;
    }
  } catch (e) {
    console.error("Firebase fetch error", e);
    return 0; // fallback
  }
  return 0;
}

function showLoggedInState(user) {
  loader.style.display = 'none';
  googleLoginBtn.style.display = 'none';
  userInfo.style.display = 'block';
  injectBtn.style.display = 'block';
  
  userEmailSpan.textContent = user.email;
  userCreditsSpan.textContent = user.credits;
}

// Inject Content Script
injectBtn.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes("web.whatsapp.com")) {
    alert("Please open WhatsApp Web first!");
    chrome.tabs.create({ url: "https://web.whatsapp.com" });
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
  window.close();
});
