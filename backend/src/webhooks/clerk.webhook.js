import express from "express";

const router = express.Router();

router.post("/", (req, res) => {
  console.log("🔥 WEBHOOK WORKS");
  console.log(req.headers);
  res.status(200).send("OK");
});

export default router;