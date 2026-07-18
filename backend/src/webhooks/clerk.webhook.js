import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("✅ Webhook hit");

    const evt = await verifyWebhook(
      new Request("http://localhost", {
        method: "POST",
        headers: new Headers(req.headers),
        body: Buffer.from(req.body).toString(),
      }),
      {
        signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
      }
    );

    console.log("Event:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const user = evt.data;

      const email =
        user.email_addresses.find(
          (e) => e.id === user.primary_email_address_id
        )?.email_address || "";

      await User.findOneAndUpdate(
        { clerkId: user.id },
        {
          clerkId: user.id,
          email,
          fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          profilePic: user.image_url,
        },
        { upsert: true, new: true }
      );

      console.log("✅ User saved");
    }

    if (evt.type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: evt.data.id });
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
});

export default router;