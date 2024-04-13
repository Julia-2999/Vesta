const Stream = require('node-rtsp-stream');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

let streamInstance = null; 

app.use(cors());
app.use(bodyParser.json());

app.post('/start-stream', (req, res) => {
  const { url, wsPort } = req.body;

  if (!url || !wsPort) {
    return res.status(400).json({ error: 'Brak wymaganych parametrów.' });
  }

  if (streamInstance) {
    streamInstance.stop();
    streamInstance = null;
  }

  streamInstance = new Stream({
    name: 'name',
    streamUrl: url,
    wsPort: wsPort,
    ffmpegOptions: { 
      '-stats': '', 
      '-r': 30 
    }
  });

  res.json({ success: true, message: 'Strumień uruchomiony pomyślnie.' });
});

app.post('/stop-stream', (req, res) => {
  if (streamInstance) {
    streamInstance.stop();
    streamInstance = null;

    res.json({ success: true, message: 'Strumień zatrzymany pomyślnie.' });
  } else {
    res.status(404).json({ error: 'Brak aktywnego strumienia do zatrzymania.' });
  }
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});




