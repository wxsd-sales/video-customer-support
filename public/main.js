// const myServerUrl = 'https://video-support-wxsd.glitch.me/';
const myServerUrl = 'http://localhost:3000'; // Update this with your server URL
async function getAccessToken() {
    const url = myServerUrl + '/get-access-token';
    const requestOptions = {
        method: 'GET'
    };
    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            console.error('Backend API status code:', response.status);
            return null
        }
        else {
            const data = await response.json();
            const accessToken = data.accessToken;
            console.log('Access token sent to Front End');
            return accessToken;
        }   
    }
    catch (error) {
        console.error('Error getting the access token from the backend:', error);
        return null;
    }
}
