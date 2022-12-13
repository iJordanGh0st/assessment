const express = require('express');
const axios = require('axios');
const app = express();
const fs = require('fs/promises');
const axiosThrottle = require('axios-request-throttle');
const cors = require('cors');
const path = require('path');
app.use(express.json());
app.use(cors());
axiosThrottle.use(axios, { requestsPerSecond: 10 });
const PORT = 5000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function extractUrl(text) {
  if (text.length == 0) return '';
  const startIndex = 0;
  const endIndex = text.search('/>');
  return text.substr(startIndex, endIndex);
}
async function getImage(name, idx, res) {
  try {
    const { data } = await axios.get(`https://instagram.com/${name}`);
    //await fs.writeFile('output.html', data);
    const rawUrl = data.substr(
      data.search('https://scontent.cdninstagram.com/'),
      800
    );
    const url = extractUrl(rawUrl);

    let imageUrl = url.replace(/&amp;|"/g, '&');

    const { data: imageBase64 } = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream',
    });
    const image = imageBase64;

    await res.send({
      data: imageUrl,
      name: name,
      success: true,
    });
    await fs.writeFile(`profiles/${name}.jpg`, image);
    console.log(name, 'saved');
  } catch (error) {
    console.log(name, 'failed');
    res.send({ data: 'something went wrong', success: false });
    console.log(error.message, idx);
  }
}

// async function fetchProfiles(res) {
//   try {
//     const userlist = await fs.readFile('testuserlist.txt', { encode: 'utf8' });
//     const users = userlist.toString().split('\n');

//     users.forEach((name, idx) => {
//       getImage(name.replace(/\r/, ''), idx, res);
//     });
//   } catch (error) {
//     console.log(error.message);
//   }
// }

app.get('/api/getImage', (req, res) => {
  const username = req.query.username;
  getImage(username, 0, res);
});

app.listen(PORT, () => console.log(`server is listening on ${PORT}`));
