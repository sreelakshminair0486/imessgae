import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!signingSecret) {
      return res.status(500).json({
        message: "Missing CLERK_WEBHOOK_SIGNING_SECRET",
      });
    }

    const payload = req.body.toString();

    const request = new Request(
      "https://imessgae.onrender.com/api/webhooks/clerk",
      {
        method: "POST",
        headers: new Headers(req.headers),
        body: payload,
      }
    );

    const evt = await verifyWebhook(request, { signingSecret });

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find(
          (e) => e.id === u.primary_email_address_id
        )?.email_address ||
        u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name]
          .filter(Boolean)
          .join(" ") ||
        email?.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: u.id },
        {
          clerkId: u.id,
          email,
          fullName,
          profilePic: u.image_url,
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    if (evt.type === "user.deleted") {
      await User.findOneAndDelete({
        clerkId: evt.data.id,
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(400).json({
      message: error.message,
    });
  }
});

export default router;