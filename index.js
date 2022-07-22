const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;
const tableRoutes = require('./routes/table.js')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/table', tableRoutes);

app.get('/', async (req, res) => {
  res.send('Homepage');
})

app.get('/killServer', async (req, res) => {
  process.exit();
})


const server = app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));