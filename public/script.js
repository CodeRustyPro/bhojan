// Function to toggle visibility of sections
function toggleSections(isLoggedIn, userEmail = '') {
  const authForms = document.getElementById('authForms');
  const userDetails = document.getElementById('userDetails');
  const calorieEstimator = document.getElementById('calorieEstimator');
  const userEmailElement = document.getElementById('userEmail');

  if (isLoggedIn) {
    authForms.style.display = 'none';
    userDetails.style.display = 'block';
    calorieEstimator.style.display = 'block';
    userEmailElement.textContent = userEmail;
  } else {
    authForms.style.display = 'block';
    userDetails.style.display = 'none';
    calorieEstimator.style.display = 'none';
  }
}

// Check for user session on page load

// JavaScript to handle image upload preview
document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const imagePreviewContainer = document.getElementById("imagePreviewContainer");
  const imagePreview = document.getElementById("imagePreview");

  // Event listener for image input
  imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        imagePreview.src = e.target.result; // Set the image source to the uploaded file
        imagePreviewContainer.style.display = "block"; // Display the preview section
      };

      reader.readAsDataURL(file); // Convert image to Base64 string
    } else {
      imagePreviewContainer.style.display = "none"; // Hide the preview if no file is selected
    }
  });
});

// Signup form handler
document.getElementById('signupForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Signup successful! Please confirm your email');
      toggleSections(true, email); // Automatically log in after signup
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('An error occurred during signup.');
  }
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('Login successful!');
      toggleSections(true, email);
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred during login.');
  }
});

document.getElementById('logoutButton').addEventListener('click', async function () {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
    });

    if (response.ok) {
      alert('Logged out successfully!');
      toggleSections(false);
    } else {
      alert('Error logging out.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('An error occurred during logout.');
  }
});

// Calorie estimation form handler
document.getElementById('imageForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const imageInput = document.getElementById('imageInput');
  const formData = new FormData();
  formData.append('image', imageInput.files[0]);

  const loadingElement = document.getElementById('loading');
  const resultElement = document.getElementById('result');
  const calorieResultElement = document.getElementById('calorieResult');

  // Show the loading message
  loadingElement.style.display = 'block';
  resultElement.style.display = 'none';

  try {
    // Send image to the server
    const response = await fetch('/estimate-calories', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to estimate calories');
    }

    const data = await response.json();

    // Show the result
    calorieResultElement.textContent = data.calories || 'Could not estimate calories';
    resultElement.style.display = 'block';
  } catch (error) {
    console.error('Calorie estimation error:', error);
    alert('An error occurred while processing your image.');
  } finally {
    // Hide the loading message
    loadingElement.style.display = 'none';
  }
});


