const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

/* =========================================
   REGISTER
   POST /api/auth/register
   ========================================= */

router.post("/register", async (req, res) => {
  try {
    const {
      usn,
      email,
      password,
      name,
      phone,
      college,
      course,
      semester,
      year,
      dateOfBirth,
    } = req.body;

    if (!usn || !email || !password) {
      return res.status(400).json({
        message: "USN, email and password are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const cleanUSN = usn.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingUSN = await User.findOne({
      usn: cleanUSN,
    });

    if (existingUSN) {
      return res.status(400).json({
        message: "This USN is already registered.",
      });
    }

    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "This email is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = new User({
      usn: cleanUSN,
      email: cleanEmail,
      password: hashedPassword,
      name: name ? name.trim() : "",
      phone: phone ? phone.trim() : "",
      college: college ? college.trim() : "",
      course: course ? course.trim() : "",
      semester: semester ? semester.trim() : "",
      year: year ? year.trim() : "",
      dateOfBirth: dateOfBirth || "",
    });

    await user.save();

    return res.status(201).json({
      message: "Registration successful.",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
});

/* =========================================
   LOGIN
   POST /api/auth/login
   ========================================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful.",

      token,

      user: {
        id: user._id,
        name: user.name,
        usn: user.usn,
        email: user.email,
        phone: user.phone,
        college: user.college,
        course: user.course,
        semester: user.semester,
        year: user.year,
        dateOfBirth: user.dateOfBirth,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
});

/* =========================================
   AUTHENTICATION MIDDLEWARE
   ========================================= */

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

/* =========================================
   GET PROFILE
   GET /api/auth/profile
   ========================================= */

router.get(
  "/profile",
  authenticate,
  async (req, res) => {
    try {
      return res.status(200).json({
        user: req.user,
      });
    } catch (error) {
      console.error("PROFILE ERROR:", error);

      return res.status(500).json({
        message: "Unable to load profile.",
      });
    }
  }
);

/* =========================================
   UPDATE PROFILE
   PUT /api/auth/profile
   ========================================= */

router.put(
  "/profile",
  authenticate,
  async (req, res) => {
    try {
      const {
        name,
        usn,
        email,
        phone,
        college,
        course,
        semester,
        year,
        dateOfBirth,
      } = req.body;

      const targetUSN = usn ? usn.trim().toUpperCase() : req.user.usn;
      const targetEmail = email ? email.trim().toLowerCase() : req.user.email;

      if (!targetUSN || !targetEmail) {
        return res.status(400).json({
          message: "USN and email are required.",
        });
      }

      /* Check duplicate USN */
      const existingUSN = await User.findOne({
        usn: targetUSN,
        _id: {
          $ne: req.user._id,
        },
      });

      if (existingUSN) {
        return res.status(400).json({
          message: "This USN is already in use.",
        });
      }

      /* Check duplicate email */
      const existingEmail = await User.findOne({
        email: targetEmail,
        _id: {
          $ne: req.user._id,
        },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "This email is already in use.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          name: name !== undefined ? name.trim() : req.user.name,
          usn: targetUSN,
          email: targetEmail,
          phone: phone !== undefined ? phone.trim() : req.user.phone,
          college: college !== undefined ? college.trim() : req.user.college,
          course: course !== undefined ? course.trim() : req.user.course,
          semester: semester !== undefined ? semester.trim() : req.user.semester,
          year: year !== undefined ? year.trim() : req.user.year,
          dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : req.user.dateOfBirth,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

      return res.status(200).json({
        message: "Profile updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        message: "Unable to update profile.",
      });
    }
  }
);

/* =========================================
   CHANGE PASSWORD
   PUT /api/auth/change-password
   ========================================= */

router.put(
  "/change-password",
  authenticate,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Current password and new password are required.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      const user = await User.findById(
        req.user._id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          message:
            "Current password is incorrect.",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      await user.save();

      return res.status(200).json({
        message:
          "Password changed successfully.",
      });
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to change password.",
      });
    }
  }
);

module.exports = router;