const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seedDefaultAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@studentmart.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail }, { role: "admin" }]
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "StudentMart Administrator",
        usn: "ADMIN001",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        college: "Campus Administration",
        course: "Management"
      });
      console.log(`Default admin account initialized: ${adminEmail}`);
    } else if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`Existing user ${existingAdmin.email} upgraded to admin`);
    }
  } catch (error) {
    console.error("Seed admin error:", error.message);
  }
}

module.exports = seedDefaultAdmin;

