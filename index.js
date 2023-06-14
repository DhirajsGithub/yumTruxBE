const connectToMongo = require("./database");
connectToMongo();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8000;
const userRoutes = require("./Routes/userRoutes");
const truckRoutes = require("./Routes/truckRoutes");
const generalRoutes = require("./Routes/genralRoute");
const paymentRoutes = require("./Routes/paymentRoutes");

// to use req.body as json we need to use middle ware
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(cors());

app.use(express.json());
app.use("/", userRoutes);
app.use("/", generalRoutes);
app.use("/truck", truckRoutes);
app.use("/payments", paymentRoutes);

app.listen(port, () => {
  console.log(`YumTrux backend app listening at http://localhost:${port}`);
});
