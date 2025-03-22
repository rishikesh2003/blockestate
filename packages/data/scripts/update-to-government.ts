import { db, schema } from "..";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function updateUserToGovernment(userId: string) {
  try {
    console.log(`Attempting to update user ${userId} to government role...`);

    // Check if user exists
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (users.length === 0) {
      console.error(`User with ID ${userId} not found in database`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`Found user: ${user.id} (Auth ID: ${user.authId})`);

    // Update user role to government
    await db
      .update(schema.users)
      .set({
        role: "government",
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));

    console.log(`Successfully updated user ${userId} to government role`);

    // Verify the update
    const updatedUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (updatedUsers.length > 0) {
      const updatedUser = updatedUsers[0];
      console.log(
        `Verification: User ${updatedUser.id} now has role: ${updatedUser.role}`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error("Please provide a user ID as a command line argument");
  console.log("Usage: npm run update-gov <userId>");
  process.exit(1);
}

// Run the update function
updateUserToGovernment(userId);
