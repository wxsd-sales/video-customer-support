const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const path = require('path');

if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const token = process.env.TOKEN;
const port = 3000;
 
app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/get-access-token', async (req, res) => {
  let data = JSON.stringify({
    "subject": "ExternalGuestIdentifier",
    "displayName": "John Doe"
  });
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://webexapis.com/v1/guests/token',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + token
    },
    data : data
  };

  try {
    const response = await axios.request(config)
    const accessToken = response.data.accessToken
    console.log('Create guest token API status code:', response.status);
    res.status(200).json({ accessToken }); // Send access token and status code in one line
  } catch (error) {
    console.error('Error creating the guest user:', error);
    res.status(500).json({ error: 'Failed to create the guest user' }); // Send error response
  }
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});