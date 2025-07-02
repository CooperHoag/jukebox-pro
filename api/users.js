import express from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByUsername } from "../db/queries/users.js";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      const err = new Error("Username and password are required.");
      err.status = 400;
      throw err;
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user with hashed password
    const user = await createUser(username, hashedPassword);

    // 4. Generate JWT with user.id
    const token = createToken({ userId: user.id });

    // 5. Return token
    res.status(201).send({ token });
  } catch (err) {
    next(err);
  }
});

// LOGIN
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1. Validate input
    if (!username || !password) {
      const err = new Error("Username and password are required.");
      err.status = 400;
      throw err;
    }

    // 2. Get user from DB
    const user = await getUserByUsername(username);
    if (!user) {
      const err = new Error("Invalid username or password.");
      err.status = 400;
      throw err;
    }

    // 3. Compare passwords
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const err = new Error("Invalid username or password.");
      err.status = 400;
      throw err;
    }

    // 4. Create and send token
    const token = createToken({ userId: user.id });
    res.send({ token });

  } catch (err) {
    next(err);
  }
});

export default router;

