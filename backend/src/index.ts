import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { register } from "./zod/Register";
import { signin } from "./zod/Signin";
import authMiddleware from "./middlewares/auth";
import { resetpassword } from "./zod/ResetPassword";
import { dateSchema } from "./zod/DateSchema";
import { reserveSchema } from "./zod/reserveSchema";
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

//Endpoints
app.post("/signup", async (req, res) => {
  const parsedInput = register.safeParse(req.body);
  if (!parsedInput.success) {
    res.status(411).json({
      message: "Please send correct inputs",
    });
  }
  const username = parsedInput.data?.username;
  const password = parsedInput.data?.password;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (existingUser) {
      res.status(400).json({ error: "email is already registered" });
    }
    const newUser = await prisma.user.create({
      data: {
        username: req.body.username,
        password: req.body.password,
        name: req.body.name,
      },
    });
    const token = await jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
    return res.status(200).json({
      message: "User created successfully",
      jwt: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const getUser = await prisma.user.findUnique({
    where: {
      username,
      password,
    },
  });
  if (!getUser) {
    res.status(403).send({
      message: "user not found/Incorrect credentials",
    });
  }
  const token = await jwt.sign({ userid: getUser?.id }, process.env.JWT_SECRET);
  return res.status(200).json({
    message: "User signed in successfully",
    token,
  });
});

app.get("/reset-password", async (req, res) => {
  const { success } = resetpassword.safeParse(req.body);
  const user = await prisma.user.findUnique({
    where: { username: req.body.username },
  });
  if (!user) {
    return res.status(400).send("User not found");
  }
  //send email
  if (!success) {
    res.status(411).json({
      message: "Please check the correct inputs",
    });
  }
  try {
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.RESET_PASSWORD_SECRET as string,
      { expiresIn: "1h" }
    );
    res.send("Password reset email sent");
  } catch (error) {
    res.status(500).send("Error sending password reset email");
  }
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const decoded = jwt.verify(
      token,
      process.env.RESET_PASSWORD_SECRET as string
    ) as { userId: number };
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: newPassword },
    });
    res.send("Password reset successful");
  } catch (error) {
    res.status(500).send("Error resetting password");
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.userId },
      select: { username: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).send("Error fetching user profile");
  }
});

app.get("/seat-layout", authMiddleware, async (req, res) => {
  const queryParams = req.query as { date?: string };
  const { success, data, error } = dateSchema.safeParse(queryParams);

  if (!success) {
    return res.status(400).json({ error: error.errors.map((e) => e.message) });
  }
  const { date } = data;
  try {
    const seats = await prisma.seat.findMany({
      include: {
        reservations: {
          where: {
            date: new Date(date),
          },
        },
      },
    });

    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/reserve",authMiddleware, async (req, res) => {
  const { success, data, error } = reserveSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: error.errors.map((e) => e.message) });
  }
  const { seatId, date } = data;
  try {
    const seat = await prisma.seat.findUnique({
      where: {
        id: seatId,
      },
    });
    if (!seat || seat.status !== "available") {
      return res.status(400).json({
        message: "Seat not available",
      });
    }
    await prisma.reservation.create({
      data: {
        date: new Date(date),
        userId: (req as any).user.userId,
        seatId,
      },
    });

    await prisma.seat.update({
      where: { id: seatId },
      data: { status: "reserved" },
    });
    res.json({ message: "Seat reserved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`app listening on ${PORT}`);
});
