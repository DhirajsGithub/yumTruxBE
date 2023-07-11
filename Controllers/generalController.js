const getReqeuest = async (req, res) => {
  res.send("Welcome to YumTrux :) \nWe are here for your serving 3");
};

const sample = async (req, res) => {
  try {
    let r = await fetch("https://jsonplaceholder.typicode.com/posts/2");
    r = await r.json();
    return res.status(200).send(r);
  } catch (error) {
    return res.status(400).send(error);
  }
};

module.exports = { getReqeuest, sample };
