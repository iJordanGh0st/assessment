require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

const uri = `mongodb+srv://jordyparv:${process.env.PASS_HASH}@cluster0.zskmc.mongodb.net/test?retryWrites=true&w=majority`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (err) => console.log(err.message));

const CollegeSchema = mongoose.Schema({
  College_Name: String,
  State: String,
  Stream: String,
  UG_fee: String,
  PG_fee: String,
  Rating: Number,
  Academic: String,
  Accommodation: String,
  Faculty: String,
  Infrastructure: String,
  Placement: String,
  Social_Life: String
});
const Colleges = mongoose.model('colleges', CollegeSchema);

app.post('/api/setData', async (req, res) => {
  try {
    const result = await Colleges.insertMany(req.body);

    if (result) {
      res.send('succeeded');
    } else res.send('failed');
  } catch (err) {
    console.log(err.message);
  }
});

app.get(
  '/api/getColleges/:city/:course/:perference/:limit',
  async (req, res) => {
    let { city, course, perference, limit } = req.params;
    city = decodeURIComponent(city);
    course = decodeURIComponent(course);
    console.log(city, perference);
    try {
      const data = await Colleges.find().limit(limit);

      // perference===1 only city; perference===2 only course; perference===3 city and course
      let result = [];
      switch (parseInt(perference)) {
        case 1:
          result = data.filter((item) => item.State == city);
          break;
        case 2:
          result = data.filter((item) => item.Stream == course);
          break;
        case 3:
          result = data.filter((item) => {
            return item.State == city && item.Stream == course;
          });
          break;
        default:
          result = data;
          break;
      }

      res.send(result);
    } catch (error) {}
  }
);

app.listen(5000, () => console.log('server running at 5000 port'));
