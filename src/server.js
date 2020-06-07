const express = require("express");
const axios = require("axios");

const app = express();
// app.use(express.json());
app.get("/:city", (req, res) => {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${req.params.city}&appid=${process.env.API_KEY}`;
  return axios
    .get(url)
    .then((response) => res.status(200).send(response.data))
    .catch((error) => {
      console.log(error);
      return res.status(500).send(error);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
