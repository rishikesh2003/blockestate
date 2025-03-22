import { db, schema } from "..";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function updateUserToGovernmentByAuth(authId: string) {
  try {
    console.log(
      `Attempting to update user with auth ID ${authId} to government role...`
    );

    // Check if user exists by auth ID
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, authId));

    if (users.length === 0) {
      console.error(`User with auth ID ${authId} not found in database`);
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
      .where(eq(schema.users.authId, authId));

    console.log(
      `Successfully updated user with auth ID ${authId} to government role`
    );

    // Verify the update
    const updatedUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, authId));

    if (updatedUsers.length > 0) {
      const updatedUser = updatedUsers[0];
      console.log(
        `Verification: User ${updatedUser.id} (Auth ID: ${updatedUser.authId}) now has role: ${updatedUser.role}`
      );
      console.log(
        `This user's Ethereum address should be set as the government address in the PropertyRegistry contract`
      );
      if (updatedUser.publicKey) {
        console.log(`User's Ethereum address: ${updatedUser.publicKey}`);
      } else {
        console.log(
          `Warning: User does not have an Ethereum address set. Connect a wallet in the app first.`
        );
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
}

// Get auth ID from command line argument
const authId = process.argv[2];

if (!authId) {
  console.error("Please provide a user auth ID as a command line argument");
  console.log("Usage: npm run update-gov-auth <authId>");
  process.exit(1);
}

// Run the update function
updateUserToGovernmentByAuth(authId);
