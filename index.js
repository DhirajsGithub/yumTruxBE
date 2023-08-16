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

app.post(
  "/stripe_webhooks",
  express.json({ type: "application/json" }),
  (request, response) => {
    const event = request.body;
    console.log(event);
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

app.listen(port, () => {
  console.log(`YumTrux backend app listening at http://localhost:${port}`);
});
