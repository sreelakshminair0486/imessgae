

import express from "express";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🔥 WEBHOOK HIT");

  try {
    console.log("Secret exists:", !!process.env.CLERK_WEBHOOK_SIGNING_SECRET);

    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body);

    const request = new Request("http://localhost", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    const evt = await verifyWebhook(request, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    });

    console.log("✅ VERIFIED");
    console.log(evt.type);

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ VERIFY FAILED");
    console.error(err);
    res.status(400).send(err.message);
  }
});

export default router;