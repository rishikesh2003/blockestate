import { auth, currentUser } from "@clerk/nextjs/server";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if user already exists in database
  let existingUser;
  try {
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, userId));

    existingUser = users[0];
  } catch (error) {
    console.error("Failed to get user from database.", error);
    return new Response("Error", { status: 500 });
  }

  const origin = new URL(request.url).origin;

  try {
    // Create or update user in database
    const currUser = await currentUser();

    const govAddress = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

    if (existingUser) {
      // User exists, update it
      await db
        .update(schema.users)
        .set({
          updatedAt: new Date(),
          publicKey: currUser?.primaryWeb3Wallet?.web3Wallet,
        })
        .where(eq(schema.users.authId, userId));
    } else {
      // User doesn't exist, create it
      await db.insert(schema.users).values({
        authId: userId,
        role:
          currUser?.primaryWeb3Wallet?.web3Wallet === govAddress
            ? "government"
            : "user",
        publicKey: currUser?.primaryWeb3Wallet?.web3Wallet,
      });
    }
  } catch (error) {
    console.log(error);
    return new Response("Unable to add user to database.", { status: 500 });
  }

  const url = new URL(request.url);
  const { searchParams } = url;
  const redirectUrl = searchParams.get("redirect_url");

  // Handle redirect
  if (redirectUrl) {
    return NextResponse.redirect(redirectUrl, {
      status: 302,
    });
  }

  // Default redirect to dashboard
  return NextResponse.redirect(`${origin}/dashboard`, {
    status: 302,
  });
}
