import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, userId));

    if (!users.length) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Return user data (excluding sensitive fields)
    return NextResponse.json({
      id: user.id,
      authId: user.authId,
      role: user.role,
      publicKey: user.publicKey,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
