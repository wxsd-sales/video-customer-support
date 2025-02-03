const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const refreshToken = process.env.REFRESH_TOKEN;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const port = process.env.PORT || 3000;
let guestIssuerServiceAppToken = '';

async function refreshAccessToken() {
  const data = 
    new URLSearchParams({
    'grant_type': 'refresh_token',
    'refresh_token': refreshToken,
    'client_id': clientId,
    'client_secret': clientSecret
    });
  const config = {
    method: 'post',
    url: 'https://webexapis.com/v1/access_token',
    headers: { 
      'Content-type': 'application/x-www-form-urlencoded'
    },
    data : data.toString()
  }
  try {
    const response = await axios.request(config);
    guestIssuerServiceAppToken = response.data.access_token;
    console.log('Access token refreshed successfully');
    console.log('Refresh Access Token API status code:', response.status);
  } catch (error) {
    console.error('Error refreshing the access token:', error);
    throw (error);
    // alternative: remove the console.log and build a New Error object that includes error received:
    // throw new Error ('Error refreshing the access token:', {cause: error } )
  }  
}

// Enable CORS for all routes
app.use(cors()); 
// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Initial token refresh
(async () => {
  try {
    await refreshAccessToken();
  }
  catch (error) {
    console.error('Initial token refresh failed',  error );
  }
})();

// Schedule token refresh daily at 1 PM
cron.schedule('0 13 * * *', async () => {
  try {
    await refreshAccessToken();
  }
  catch (error) {
    console.error ('Scheduled token refresh failed', error );
  }
});

app.get('/get-access-token', async (req, res) => {
  let data = JSON.stringify({
    "subject": "ExternalGuestIdentifier-3",
    "displayName": "Johny Doe"
  });
  const config = {
    method: 'post',
    url: 'https://webexapis.com/v1/guests/token',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + guestIssuerServiceAppToken
    },
    data : data
  };

  try {
    const response = await axios.request(config)
    const accessToken = response.data.accessToken
    console.log('Guest token refreshed successfully');
    console.log('Create guest token API status code:', response.status);
    res.status(200).json({ accessToken }); // Send access token and status code in one line
  } catch (error) {
    console.error('Error creating the guest token:', error);
    res.status(500).json({ error: 'Failed to create the guest token' }); // Send error response
  }
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});