import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Automatically loads environment variables
import { GoogleGenerativeAI } from '@google/generative-ai';
import cookieParser from 'cookie-parser';

// Initialize the Express app and Google Generative AI client
const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Setup multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(express.static('public')); // Serve static files (UI files) from the public folder
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies for session management
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Initialize Supabase
const supabaseUrl = 'https://vucdnykfosnbcckjjvmf.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication routes
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Signup successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: session, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    // Set the token cookie
    res.cookie('token', session.access_token, {
      httpOnly: true,
      secure: true, // Use true only in production over HTTPS
      sameSite: 'Lax',
    });

    res.status(200).json({ message: 'Login successful', user: session.user });
  } catch (error) {
    console.error('Login error:', error); // Log the error to debug it
    res.status(500).json({ error: 'Failed to log in' });
  }
});


app.post('/logout', async (req, res) => {
  try {
    // Clear the session cookie
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log out' });
  }
});


// Handle image upload and calorie estimation
app.post('/estimate-calories', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  try {
    // Convert image to Base64
    const base64Image = req.file.buffer.toString('base64');

    // Fetch the model for generative content
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

    // Prompt with the image for calorie estimation
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg', // Adjust mime type if necessary (image/png)
        },
      },
      'Give me a single number as output. Estimate the calories of this food item.',
    ]);

    // Extract the calorie estimate from the response
    const calorieEstimate = result.response.text();

    // Respond with the calorie estimate
    return res.json({ calories: calorieEstimate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to estimate calories' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
export default app;
