import express from "express";
import User from "../models/user.model.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("🔥 WEBHOOK HIT");

  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!signingSecret) {
      return res.status(500).json({
        message: "CLERK_WEBHOOK_SIGNING_SECRET is missing",
      });
    }

    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : String(req.body);

    const request = new Request("http://localhost", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    const evt = await verifyWebhook(request, {
      signingSecret,
    });

    console.log("✅ VERIFIED");
    console.log("Event:", evt.type);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      try {
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
          u.username ||
          email?.split("@")[0];

        console.log("Saving user:", {
          clerkId: u.id,
          email,
          fullName,
          profilePic: u.image_url,
        });

        const savedUser = await User.findOneAndUpdate(
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
            runValidators: true,
          }
        );

        console.log("✅ User saved successfully");
        console.log(savedUser);
      } catch (err) {
        console.error("❌ MongoDB Save Error:");
        console.error(err);
      }
    }

    if (evt.type === "user.deleted") {
      try {
        await User.findOneAndDelete({
          clerkId: evt.data.id,
        });

        console.log("✅ User deleted");
      } catch (err) {
        console.error(err);
      }
    }

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.error("❌ Webhook Error");
    console.error(err);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;