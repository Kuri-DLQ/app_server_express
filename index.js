const express = require('express');
const app = express();
const PORT = 3000;
const tableRoutes = require('./routes/table.js')

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/table', tableRoutes);

app.get('/', async (req, res) => {
  res.send('Homepage');
})


app.listen(PORT, () => `App listening on port ${PORT}...`);