import "dotenv/config";

import mongoose from "mongoose";
import connectToMongoDB  from "../lib/db.js";
import User from "../models/user.model.js";

const seedUsers = [
  [
    "seed_alex_chen",
    "Alex Chen",
    "alex.chen@example.com",
    "https://i.pravatar.cc/150?img=1",
  ],
  [
    "seed_sam_taylor",
    "Sam Taylor",
    "sam.taylor@example.com",
    "https://i.pravatar.cc/150?img=2",
  ],
];

async function seedDatabase() {
  await connectToMongoDB();

  const result = await User.bulkWrite(
    seedUsers.map(([clerkId, fullName, email, profilePic]) => ({
      updateOne: {
        filter: { clerkId },
        update: {
          $set: { clerkId, fullName, email, profilePic },
        },
        upsert: true,
      },
    })),
  );

  console.log(
    `Seeded users. Inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, matched: ${result.matchedCount}`,
  );
}

seedDatabase()
  .catch((error) => {
    console.error("Failed to seed users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });