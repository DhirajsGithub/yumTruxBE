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

app.post("/webhook", (req, res) => {
  const event = req.body;

  // Handle charge.succeeded event
  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    const paymentIntentId = charge.payment_intent;
  }
  // Handle payment_intent.succeeded event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
  }

  // Handle payment_intent.payment_failed event
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    // Handle failed payment intent
  }


  
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const clientReferenceId = session.client_reference_id;

    console.log(
      "Received checkout session event with client_reference_id:",
      clientReferenceId
    );
  }
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`YumTrux backend app listening at http://localhost:${port}`);
});
