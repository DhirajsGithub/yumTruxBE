const connectToMongo = require("./database");
connectToMongo();
const express = require("express");
const app = express();
const port = 8000; // we will have out react app on port 3000
const userRoutes = require("./Routes/userRoutes");
const truckRoutes = require("./Routes/truckRoutes");
const generalRoutes = require("./Routes/genralRoute");

// to use req.body as json we need to use middle ware
app.use(express.json());
app.use("/", userRoutes);
app.use("/", generalRoutes);
// app.use("/", truckRoutes);

app.listen(port, () => {
  console.log(`YumTrux backend app listening at http://localhost:${port}`);
});
