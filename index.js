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

// const useServerSentEventsMiddleware = (req, res, next) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');

//   // only if you want anyone to access this endpoint
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   res.flushHeaders();

//   const sendEventStreamData = (data) => {
//       const sseFormattedResponse = `data: ${JSON.stringify(data)}\n\n`;
//       res.write(sseFormattedResponse);
//   }

//   // we are attaching sendEventStreamData to res, so we can use it later
//   Object.assign(res, {
//       sendEventStreamData
//   });

//   next();
// }

// const streamRandomNumbers = (req, res) => {
//   // We are sending anyone who connects to /stream-random-numbers
//   // a random number that's encapsulated in an object
//   let interval = setInterval(function generateAndSendRandomNumber(){
//       const data = {
//           value: Math.random(),
//       };

//       res.sendEventStreamData(data);
//   }, 3000);

//   // close
//   res.on('close', () => {
//       clearInterval(interval);
//       res.end();
//   });
// }

// app.get('/sse', useServerSentEventsMiddleware,
//   streamRandomNumbers)


app.get('/', async (req, res) => {
  res.send('Homepage');
})

app.get('/killServer', async (req, res) => {
  process.exit();
})


const server = app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));