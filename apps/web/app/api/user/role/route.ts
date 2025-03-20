import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Verify authentication
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the user ID from query params
  const searchParams = request.nextUrl.searchParams;
  const requestedUserId = searchParams.get("userId");

  // Make sure the authenticated user is requesting their own role
  if (requestedUserId !== clerkUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Query the user from the database
    const users = await db
      .select({
        id: schema.users.id,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.authId, clerkUserId));

    if (!users.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user role
    return NextResponse.json({ role: users[0].role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
