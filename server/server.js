const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "StudentMart API is running",
  });
});

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/products",
  require("./routes/ProductRoutes")
);

app.use(
  "/api/cart",
  require("./routes/CartRoutes")
);

async function startServer() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );

    const seedDefaultAdmin = require("./seedAdmin");
    await seedDefaultAdmin();

    app.listen(
      PORT,
      "127.0.0.1",
      () => {
        console.log(
          `StudentMart server running at http://127.0.0.1:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:"
    );

    console.error(error);
  }
}

startServer();
