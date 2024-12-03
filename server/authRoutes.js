import { Router } from 'express';
import { auth, sendSignInLinkToEmail, signInWithEmailLink, isSignInWithEmailLink } from './firebaseClient.js'; // Import Firebase Client SDK
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route to send the sign-in link to the email
router.post('/send-sign-in-link', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const actionCodeSettings = {
    url: `http://localhost:3000/api/finishSignUp?email=${email}`, // Redirect URL
    handleCodeInApp: true, // Ensure link handling is in the app
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    res.status(200).json({ message: 'Sign-in link sent to email.' });
  } catch (error) {
    console.error('Error sending sign-in link:', error);
    res.status(500).json({ message: 'Error sending sign-in link.' });
  }
});

// Route to handle finishSignUp page
router.get('/finishSignUp', async (req, res) => {
  const { email } = req.query;
  const emailLink = `${req.protocol}://${req.get('host')}${req.originalUrl}`; // Reconstruct the full email link

  if (!email || !emailLink) {
    return res.status(400).send('Invalid request: Missing email or email link.');
  }

  try {
    // Check if the provided emailLink is a valid sign-in link
    if (!isSignInWithEmailLink(auth, emailLink)) {
      return res.status(400).send('Invalid or expired sign-in link.');
    }

    // Complete the sign-in process
    await signInWithEmailLink(auth, email, emailLink);

    const filePath = path.join(__dirname, '../public/FinishSignUp.html'); // Serve the HTML file
    console.log('Serving FinishSignUp.html from:', filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving FinishSignUp.html:', err);
        res.status(500).send('Server error while serving the file.');
      }
    });
  } catch (error) {
    console.error('Error verifying email link or signing in:', error);
    res.status(500).send('Error verifying email link or signing in.');
  }
});


export default router;
