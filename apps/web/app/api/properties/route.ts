import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const {
      name,
      location,
      price,
      blockchainId,
      documentUrl,
      documentHash,
      imgUrl,
      description,
      isForSale,
    } = await request.json();

    // Validate required fields
    if (!name || !location || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user ID from the database
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

    const dbUser = users[0];

    // Insert property into database
    const result = await db.insert(schema.properties).values({
      name,
      location,
      blockchainId,
      ownerId: dbUser.id,
      documentUrl,
      documentHash,
      imgUrl,
      price,
      isForSale: Boolean(isForSale),
    });

    return NextResponse.json({
      success: true,
      message: "Property created successfully",
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}

// Get all properties
export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const forSale = searchParams.get("forSale");

    let queryBuilder = db.select().from(schema.properties);

    // Filter by owner if userId is provided
    if (userId) {
      queryBuilder = queryBuilder.where(
        eq(schema.properties.ownerId, userId)
      ) as typeof queryBuilder;
    }

    // Filter by for sale status if provided
    if (forSale !== null) {
      const isForSaleValue = forSale === "true";
      queryBuilder = queryBuilder.where(
        eq(schema.properties.isForSale, isForSaleValue)
      ) as typeof queryBuilder;
    }

    const properties = await queryBuilder;

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
