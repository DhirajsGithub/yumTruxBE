const connectToMongo = require("./database");

connectToMongo();
const express = require("express");
const fileUpload = require("express-fileupload");
const { Server } = require("socket.io");
const cors = require("cors");
const uniqid = require("uniqid");
const app = express();
const port = process.env.PORT || 8000;

// ------------------socket io------------------
const http = require("http");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ------------------socket io------------------

const userRoutes = require("./Routes/userRoutes");
const truckRoutes = require("./Routes/truckRoutes");
const generalRoutes = require("./Routes/genralRoute");
const paymentRoutes = require("./Routes/paymentRoutes");
const truckOwnerRoutes = require("./Routes/truckOwnerRoutes");
const adminRoutes = require("./Routes/adminRoute");

// for webhook
const trucksModel = require("./Models/Truck");
const adminModel = require("./Models/Admin");

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
app.use("/admin", adminRoutes);

app.post("/webhook", async (req, res) => {
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
    if (clientReferenceId) {
      try {
        let p = trucksModel
          .findOneAndUpdate(
            { _id: clientReferenceId },

            {
              $set: { stripePaymentDate: new Date() },

              $push: {
                RechargeDetail: {
                  amount: session.amount_total,
                  date: new Date(),
                  id: uniqid(),
                },
              },
            },
            { upsert: true, new: true }
          )
          .then((truck) => {
            adminModel
              .updateMany(
                {},
                {
                  $push: {
                    truckPayments: {
                      truckId: clientReferenceId,
                      amount: session.amount_total,
                      date: new Date(),
                      id: uniqid(),
                    },
                  },
                }
              )
              .then((admin) => {
                return;
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    }
    console.log(
      "Received checkout session event with client_reference_id:",
      clientReferenceId
    );
  }
  res.status(200).end();
});

io.on("connection", (socket) => {
  console.log("A user connected ", socket.id);

  // emit to particular room
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log("User joined room: " + data);
  });

  // Listen for messages from the client
  socket.on("send_msg", (data) => {
    // Broadcast the message to all connected clients
    socket.to(data.room).emit("receive_msg", data);
    console.log(data);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(port, () => {
  console.log(`YumTrux backend app listening at http://localhost:${port}`);
});
