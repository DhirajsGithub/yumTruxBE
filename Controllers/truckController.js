require("dotenv").config();
// /truck/signup
const trucksModel = require("../Models/Truck");
const truckOwnerModel = require("../Models/TruckOwner");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const uniqid = require("uniqid");
const { sendMail } = require("../utils/SendMail");
const { truckDefaultImg } = require("../utils/baseUrls");
const reqDate = new Date();

// /truck/signup
const signup = async (req, res) => {
  const { email, username, password, phoneNo, address } = req.body;
  try {
    if (
      email?.length > 0 &&
      username?.length > 0 &&
      password?.length > 0 &&
      address?.length > 0 &&
      phoneNo
    ) {
      const existingTruck = await trucksModel.findOne({
        // username and email both should be unique
        $or: [{ email: email }],
      });
      if (existingTruck) {
        return res
          .status(400)
          .json({ message: "User already exist", status: "error" });
      }

      const hashPass = await bcrypt.hash(password, 8);

      const result = await trucksModel.create({
        name: "",
        username,
        password: hashPass,
        email,
        phoneNo,
        schedule: [],
        latLong: [],
        description: "",
        imgUrl: truckDefaultImg,
        address,
        timing: "",
        ratings: [],
        menu: [],
        paymentId: "",
        balance: "",
      });

      const token = jwt.sign(
        { email: result.email, id: result._id },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );
      return res.status(201).json({
        truckData: result,
        token,
        message: "Account created successfully",
        status: "success",
      });
    } else {
      return res.status(400).json({
        message: "email, password, username, address, phone number required",
        status: "error",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "error" });
  }
};

// /truck/signin
const signin = async (req, res) => {
  // can think of login with email or username as well
  const { email, password } = req.body;

  try {
    if (email?.length > 0 && password?.length > 0) {
      const existingTruck = await trucksModel.findOne({
        email: email,
      });
      if (!existingTruck) {
        return res
          .status(404)
          .json({ message: "User not found", status: "error" });
      }

      const matchPassword = await bcrypt.compare(
        password,
        existingTruck.password
      );
      if (!matchPassword) {
        return res
          .status(400)
          .json({ message: "Password doesn't match", status: "error" });
      }
      const token = jwt.sign(
        { email: existingTruck.email, id: existingTruck._id },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );
      sendMail(existingTruck.email, existingTruck.username);
      return res.status(201).json({
        truckData: existingTruck,
        token,
        status: "success",
        message: "Successfully login",
      });
    } else {
      return res
        .status(400)
        .json({ message: "email and password required", status: "error" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", status: "success" });
  }
};

// /truck/addTruck  ---> only used to add a empty truck
const addTruck = async (req, res) => {
  const email = req.body.email;
  const truckOwner = await truckOwnerModel.findOne({ email });
  const { name, category, imgUrl } = req.body;
  if (!name || !category || !imgUrl)
    return res.status(400).send({
      message: "Please fill all missing fields!",
      status: "error",
    });
  if (truckOwner) {
    const truck = await trucksModel.create({
      name: name,
      category: category,
      username: truckOwner.username,
      email: truckOwner.email,
      phoneNo: truckOwner.phoneNo,
      schedule: [],
      latLong: [],
      description: "",
      imgUrl: imgUrl,
      address: "",
      orders: [],
      timing: "",
      ratings: [],
      menu: [],
      paymentId: "",
      paypalEmail: "",
      status: "active",
      stripePaymentDate: null,
      RechargeDetail: [],
      addedOn: new Date(),
      adminStatus: "active",
    });
    console.log(truck);

    if (truck) {
      const truckId = truck._id;
      await truckOwnerModel.findByIdAndUpdate(
        { _id: truckOwner._id },
        {
          $push: {
            ownTrucks: { truckId: truckId, addedOn: reqDate, status: "active" },
          },
        }
      );
      return res.status(201).send({
        message: "Truck added successfully",
        status: "success",
        truckId: truck._id,
      });
    } else {
      return res.status(500).send({
        message: "Internal server error",
        status: "error",
      });
    }
  } else {
    return res.status(400).send({
      message: "Couldn't find a truck owner with provided email",
      status: "error",
    });
  }
};

//truckDetails    ---> retrive truck details
const truckDetails = async (req, res) => {
  const userId = req.params.truckId;
  try {
    const findUser = await trucksModel
      .findById({ _id: userId })
      .then((user) => {
        return res
          .status(201)
          .send({ user, message: "success", status: "success" });
      })
      .catch((err) => {
        return res
          .status(400)
          .send({ message: "Couldn't find the user", status: "error" });
      });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal server error", status: "error" });
  }
};

// /truck/upateBasicData/:truckId   ---> update truck name, description, imgUrl, timing, phoneNo, address
const upateBasicData = async (req, res) => {
  const truckId = req.params.truckId;
  const name = req.body.name;
  const address = req.body.address;
  const description = req.body.description;
  const timing = req.body.timing;
  const phoneNo = req.body.phoneNo;
  const category = req.body.category;

  // Only update imgUrl if it's available in the request body
  const updateData = {
    name,
    description,
    timing,
    phoneNo,
    address,
    category,
  };

  if (req.body.imgUrl) {
    updateData.imgUrl = req.body.imgUrl;
  }

  try {
    if (
      name?.length > 0 &&
      address?.length > 0 &&
      description?.length > 0 &&
      timing?.length > 0 &&
      phoneNo?.length > 0 &&
      category?.length > 0
    ) {
      const findTruck = await trucksModel
        .findByIdAndUpdate(
          { _id: truckId },
          updateData // Use the prepared updateData object
        )
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully updated truck basic data",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(201)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(201).send({
        message: "Please fill all missing fields!",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot update truck data at this moment",
      status: "error",
    });
  }
};

// /truck/addSchedule/:truckId    ---> add truck schedule
// dateObj: {date: 16,day: "Mon"}
// locations: [ {city:  "Snyder, TX", address: "Codgell Memorial Hospital", time: "7 AM - 1 PM"},{city: "Snyder, TX", address: "1 1 4 82nd Street", time: "10 AM - 1 PM"}]
const addSchedule = async (req, res) => {
  const truckId = req.params.truckId;
  const dateObj = req.body ? req.body.schedule[0].dateObj : null;
  const locations = req.body ? req.body.schedule[0].locations : null;
  const scheduleId = uniqid();

  try {
    if (locations?.length > 0 && dateObj) {
      const findTruck = await trucksModel
        .findByIdAndUpdate(
          { _id: truckId },
          { $push: { schedule: { dateObj, locations, scheduleId } } }
        )
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully added truck schedule",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "required schedule array and date object",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot update truck schedule at this moment",
      status: "error",
    });
  }
};

// /truck/deleteSchedule/:truckId/    ---> delete truck schedule
const deleteSchedule = async (req, res) => {
  const truckId = req.params.truckId;
  const scheduleId = req.body.scheduleId;
  try {
    if (scheduleId?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate(
          { _id: truckId },
          { $pull: { schedule: { scheduleId } } }
        )
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully deleted truck schedule",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res
        .status(400)
        .send({ message: "required schedule id", status: "error" });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot delete truck schedule at this moment",
      status: "error",
    });
  }
};

// /truck/addTruckMenu/:truckId/
// {
//   "name": "Spring Rolls",
//   "price": "49.99",
//   "description": "A crisp appetizer where shredded veggies are enca...",
//   "imgUrl": "https://i.ndtvimg.com/i/2015-02/spring-roll_625x350_51424323845.jpg"
// }
const addTruckMenu = async (req, res) => {
  const truckId = req.params.truckId;
  const name = req.body.name;
  const price = parseFloat(req.body.price);
  const description = req.body.description;
  const imgUrl = req.body.imgUrl;

  const id = uniqid();

  try {
    if (name?.length > 0 && price && description?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate(
          { _id: truckId },
          { $push: { menu: { name, price, description, imgUrl, id } } }
        )
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully added truck menu",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(201)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(201).send({
        message: "required name, price and description of menu",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(201).send({
      message: "Cannot add truck menu at this moment",
      status: "error",
    });
  }
};

// /truck/deleteTruckMenu/:truckId/
const deleteTruckMenu = async (req, res) => {
  const truckId = req.params.truckId;
  const id = req.body.menuId;
  console.log(String(id).length);
  try {
    if (id) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { $pull: { menu: { id } } })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully deleted truck menu",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res
        .status(400)
        .send({ message: "required id of menu", status: "error" });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Cannot delete truck menu at this moment",
      status: "error",
    });
  }
};

// /truck/updateStripePaymentId/:truckId    // stripe payment id will be unique or different for each truck, it will be updated through truck id and not truckOwner id
const updateStripePaymentId = async (req, res) => {
  const truckId = req.params.truckId;
  const paymentId = req.body.paymentId;
  try {
    if (paymentId?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { paymentId })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully updated payment id of truck",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "required payment id",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// /truck/updatePaypalEmail/:truckId    // paypal email will be unique or different for each truck, it will be updated through truck id and not truckOwner id
const updatePaypalEmail = async (req, res) => {
  const truckId = req.params.truckId;
  const paypalEmail = req.body.paypalEmail;
  try {
    if (paypalEmail?.length > 0) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { paypalEmail })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully updated paypal email of truck",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "required paypal email id",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// /truck/addOrderToTruck/:truckId      // add order to truck it is used in app side when user place order
const addOrderToTruck = async (req, res) => {
  let truckId = req.params.truckId;
  const order = req.body.order;
  const notification = req.body.notification;
  if (truckId?.length > 0) {
    if (order) {
      try {
        const findTruck = await trucksModel
          .findByIdAndUpdate(
            { _id: truckId },
            {
              $push: {
                orders: { ...order },
                notifications: {
                  ...notification,
                  date: new Date(),
                  viewed: false,
                },
              },
            }
          )
          .then((truck) => {
            return res.status(201).send({
              message: "Successfully added order to truck",
              status: "success",
            });
          })
          .catch((err) => {
            return res.status(201).send({
              message: "couldn't find the truck",
              status: "error",
            });
          });
      } catch (error) {
        return res.status(500).send({ error: error.message });
      }
    } else {
      return res
        .status(400)
        .send({ message: "required order", status: "error" });
    }
  } else {
    return res
      .status(400)
      .send({ message: "required truck id", status: "error" });
  }
};

// /truck/updateTruckLocation/:truckId    // add trucks latitude and longitude, it should be called frequently as per trucks movement
const updateTruckLocation = async (req, res) => {
  const truckId = req.params.truckId;
  const location = req.body.location;
  try {
    if (location?.latitude && location?.longitude) {
      const findTruck = await trucksModel
        .findByIdAndUpdate({ _id: truckId }, { latLong: location })
        .then((truck) => {
          return res.status(201).send({
            message: "Successfully updated truck location",
            status: "success",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .send({ message: "Couldn't find the truck", status: "error" });
        });
    } else {
      return res.status(400).send({
        message: "latitude and longitude required",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  const truckId = req.params.truckId; // Truck ID
  const menuId = req.body.menuId; // Menu Item ID
  const { name, price, description, imgUrl } = req.body; // Updated menu item data
  console.log(menuId);
  console.log(imgUrl);

  try {
    if (menuId) {
      const updatedMenuItem = await trucksModel.findOneAndUpdate(
        { _id: truckId, "menu.id": menuId }, // Find the truck by ID and the menu item by its ID
        {
          $set: {
            "menu.$.name": name,
            "menu.$.price": price,
            "menu.$.description": description,
            "menu.$.imgUrl": imgUrl,
          },
        },
        { new: true }
      );

      if (updatedMenuItem) {
        return res.status(200).send({
          message: "Menu item updated successfully",
          status: "success",
          updatedMenuItem,
        });
      } else {
        return res.status(404).send({
          message: "Menu item not found or couldn't be updated",
          status: "error",
        });
      }
    } else {
      return res.status(400).send({
        message: "Menu item ID required",
        status: "error",
      });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// /truck/addNotification
const addNotification = async (req, res) => {
  const ids = req.body.ids; // pass array of truck ids
  const notification = req.body.notification;
  if (!notification || !ids) {
    return res.status(400).send({
      message: "notification and ids required",
      status: "error",
    });
  }
  try {
    let truck = await trucksModel
      .updateMany(
        { _id: { $in: ids } },
        {
          $push: {
            notifications: {
              ...notification,
              date: new Date(),
              viewed: false,
            },
          },
        },
        { multi: true }
      )
      .then((truck) => {
        return res.status(200).send({
          message: "Successfully updated notifications",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck",
          status: "error",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};

// /truck/updateNotification/:truckId/:notificationId
const updateNotification = async (req, res) => {
  // if deleteNotification is true then delete the notification
  // else notification viewed will set to true
  const deleteNotification = req.body.deleteNotification; // boolean
  const truckId = req.params.truckId;
  const notificationId = req.params.notificationId;
  if (!truckId || !notificationId) {
    return res.status(400).send({
      message: "truckId and notificationId required",
      status: "error",
    });
  }
  if (deleteNotification) {
    try {
      let truck = await trucksModel
        .findOneAndUpdate(
          { _id: truckId },
          { $pull: { notifications: { notificationId: notificationId } } },
          { new: true }
        )
        .then((truck) => {
          return res.status(200).send({
            message: "Successfully deleted the notification",
            status: "success",
          });
        })
        .catch((err) => {
          return res.status(400).send({
            message: "Couldn't find the truck",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        status: "error",
      });
    }
  } else {
    try {
      let truck = await trucksModel
        .findOneAndUpdate(
          {
            _id: truckId,
            notifications: { $elemMatch: { notificationId: notificationId } },
          },
          { $set: { "notifications.$.viewed": true } },
          { new: true }
        )
        .then((owner) => {
          return res.status(200).send({
            message: "Successfully updated the notification",
            status: "success",
          });
        })
        .catch((err) => {
          return res.status(400).send({
            message: "Couldn't find the truck",
            status: "error",
          });
        });
    } catch (error) {
      return res.status(500).send({
        message: "Internal server error",
        status: "error",
      });
    }
  }
};

// /truck/getNotifications/:truckId
const getNotifications = async (req, res) => {
  const truckId = req.params.truckId;
  if (!truckId) {
    return res.status(400).send({
      message: "truckId required",
      status: "error",
    });
  }
  try {
    let truck = await trucksModel
      .findById({ _id: truckId })
      .then((owner) => {
        return res.status(200).send({
          notifications: owner.notifications,
          message: "Successfully fetched the notifications",
          status: "success",
        });
      })
      .catch((err) => {
        return res.status(400).send({
          message: "Couldn't find the truck",
          status: "error",
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal server error",
      status: "error",
    });
  }
};

// add notification and update notification api's for truck remaining

module.exports = {
  signup,
  signin,
  upateBasicData,
  addSchedule,
  deleteSchedule,
  addTruckMenu,
  deleteTruckMenu,
  updateStripePaymentId,
  updatePaypalEmail,
  truckDetails,
  addOrderToTruck,
  updateTruckLocation,
  addTruck,
  updateMenuItem,
  addNotification,
  updateNotification,
  getNotifications,
};
