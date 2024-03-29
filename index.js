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

const paymentId = uniqid();
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
    const truckDetails = await trucksModel
      .findById({ _id: clientReferenceId })
      .then((truck) => {
        return truck;
      })
      .catch((err) => {
        return {};
      });
    console.log("in web hook ");
    if (clientReferenceId) {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let p = trucksModel
          .findOneAndUpdate(
            {
              _id: clientReferenceId,
              "RechargeDetail.date": {
                $not: {
                  $gte: startOfDay,
                  $lte: endOfDay,
                },
              },
            },
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
            { new: true }
          )
          .then((truck) => {
            adminModel
              .updateMany(
                {
                  "truckPayments.date": {
                    $not: {
                      $gte: startOfDay,
                      $lte: endOfDay,
                    },
                  },
                },
                {
                  $push: {
                    truckPayments: {
                      truckId: clientReferenceId,
                      amount: parseFloat(session.amount_total / 100),
                      date: new Date(),
                      id: uniqid(),
                      name: truckDetails?.name,
                      owner: truckDetails?.email,
                      phoneNo: truckDetails?.phoneNo,
                      category: truckDetails?.category,
                      username: truckDetails?.username,
                      imgUrl: truckDetails?.imgUrl,
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
        return;
      }
    }
    console.log(
      "Received checkout session event with client_reference_id:",
      clientReferenceId
    );
  }
  return res.status(200).end();
});

io.on("connection", (socket) => {
  console.log("A user connected ", socket.id);

  // emit to particular room
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log("User joined room: " + data);
  });

  socket.on("send_msg", (data) => {
    // Broadcast the message to the specified rooms
    data.room.forEach((room) => {
      socket.to(room).emit("receive_msg", data);
    });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(port, () => {
  console.log(`YumTrux backend app listening at http://localhost:${port}`);
});
