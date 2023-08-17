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
const truckOwnerRoutes = require("./Routes/truckOwnerRoutes");

// to use req.body as json we need to use middle ware
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(cors());

app.use(express.json());
app.use("/", userRoutes);
app.use("/generalRoutes", generalRoutes);
app.use("/truck", truckRoutes);
app.use("/payments", paymentRoutes);
app.use("/truckOwner", truckOwnerRoutes);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
app.post("/webhook", (req, res) => {
  const event = req.body;
  // Handle the specific event type
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const paymentStatus = paymentIntent.status;

    // Update your database or perform other actions based on payment status
    console.log("Payment succeeded. Status:", paymentStatus);
    console.log("Payment succeeded. Intent:", paymentIntent);
  }

  res.status(200).end();
});

app.listen(port, () => {
  console.log(`YumTrux backend app listening at http://localhost:${port}`);
});
