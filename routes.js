const express = require("express");
const Log = require("./log");
const moment = require("moment");

const router = express.Router();

// Create a new user
router.post("/log", async (req, res) => {
  const formattedDate = moment().format("MMMM Do YYYY, h:mm:ss a");
  const {
    sender,
    receiver,
    message,
    date = formattedDate,
    view = "notSeen",
  } = req.body;

  try {
    const user = new Log({ sender, receiver, message, date, view });
    await user.save();
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Get all users
router.get("/log", async (req, res) => {
  try {
    const users = await Log.find({});
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/", (req, res) => {
  res.send("it's working ");
});

// Update a user
router.put("/log/:id", async (req, res) => {
  const { id } = req.params;
  const { sender, receiver, message, date } = req.body;

  try {
    const user = await Log.findByIdAndUpdate(
      id,
      { sender, receiver, message, date },
      { new: true }
    );
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete a user
router.delete("/log/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Log.findByIdAndDelete(id);
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/log/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const filteredEntries = await Log.find({
      $or: [{ sender: id }, { receiver: id }],
    });

    console.log(filteredEntries);
    res.send(filteredEntries);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/contacts/:sender", async (req, res) => {
  const { sender } = req.params;

  try {
    const receivers = await Log.find({
      sender,
      message: "[Added as a contact]",
    })
      .distinct("receiver")
      .collation({ locale: "en", strength: 2 })
      .sort();
    res.json({ receivers });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.delete("/contacts/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;

  try {
    // Delete log entries where sender, receiver, and message match
    await Log.deleteMany({
      sender,
      receiver,
      message: "[Added as a contact]",
    });

    // Fetch updated list of receivers after deletion
    const updatedReceivers = await Log.find({
      sender,
      message: "[Added as a contact]",
    }).distinct("receiver");

    res.json({ receivers: updatedReceivers });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.put("/updateView/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;
  try {
    // Update the "view" field from "notSeen" to "Seen"
    const result = await Log.updateMany(
      { sender: sender, receiver: receiver, view: "notSeen" }, // Specify the documents to update
      { $set: { view: "Seen" } }, // Set the new value for the "view" field
      { multi: true } // Add this option to update multiple documents
    );

    res.json({ updatedDocuments: result.nModified });
  } catch (error) {
    console.error("Error updating documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ... (previous code)

router.get("/getMessage/:sender/:receiver", async (req, res) => {
  try {
    const sender = req.params.sender; // Access route parameter using req.params
    const receiver = req.params.receiver; // Access route parameter using req.params

    if (!sender || !receiver) {
      return res
        .status(400)
        .json({ error: "Both sender and receiver parameters are required." });
    }

    const messageData = await Log.findOne({ sender, receiver }).sort({
      date: -1,
    });

    if (messageData) {
      res.json({
        message: messageData.message,
        view: messageData.view,
        date: messageData.date,
      });
    } else {
      res.json({ message: "", view: "", date: "" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/messages/:user", async (req, res) => {
  try {
    const user = req.params.user;

    const filteredMessages = await Log.find({
      $or: [{ sender: user }, { receiver: user }],
    }).sort({ _id: -1 });

    res.json({ success: true, data: filteredMessages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
