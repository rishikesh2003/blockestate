import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, schema } from "@blockestate/data";
import { eq, and } from "drizzle-orm";
import * as blockchain from "@/lib/blockchain";

// GET /api/properties/[id] - Get a specific property
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyId = params.id;

    // Get property from database
    const properties = await db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.id, propertyId));

    if (properties.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(properties[0]);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Update a property (for listing for sale)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyId = params.id;
    const body = await req.json();
    const { isForSale, price } = body;

    // Get user from database
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, userId));

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check if property exists and belongs to user
    const properties = await db
      .select()
      .from(schema.properties)
      .where(
        and(
          eq(schema.properties.id, propertyId),
          eq(schema.properties.ownerId, user.id)
        )
      );

    if (properties.length === 0) {
      return NextResponse.json(
        { error: "Property not found or doesn't belong to you" },
        { status: 404 }
      );
    }

    const property = properties[0];

    // In real implementation, you would call blockchain.listPropertyForSale
    // with proper signer from client-side

    // Update property in database
    const updatedProperties = await db
      .update(schema.properties)
      .set({
        isForSale,
        price: price || property.price,
        updatedAt: new Date(),
      })
      .where(eq(schema.properties.id, propertyId))
      .returning();

    return NextResponse.json(updatedProperties[0]);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/buy - Buy a property
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyId = params.id;
    const action = req.nextUrl.searchParams.get("action");

    // Get buyer from database
    const buyers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, userId));

    if (buyers.length === 0) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const buyer = buyers[0];

    // Get property
    const properties = await db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.id, propertyId));

    if (properties.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const property = properties[0];

    // Check if property is for sale
    if (!property.isForSale) {
      return NextResponse.json(
        { error: "Property is not for sale" },
        { status: 400 }
      );
    }

    // Get current owner (seller)
    const sellers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, property.ownerId || ""));

    if (sellers.length === 0) {
      return NextResponse.json(
        { error: "Property owner not found" },
        { status: 500 }
      );
    }

    const seller = sellers[0];

    // Check action type
    if (action === "buy") {
      // In real implementation, this would be done on client-side with proper signing
      // Blockchain transaction would be handled client-side with eth.js
      const transactionHash = "mock_transaction_" + Date.now(); // Mock transaction hash

      // Create transaction record
      const [transaction] = await db
        .insert(schema.transactions)
        .values({
          buyerId: buyer.id,
          sellerId: seller.id,
          propertyId: property.id,
          amount: property.price,
          transactionHash,
        })
        .returning();

      // Update property ownership
      await db
        .update(schema.properties)
        .set({
          ownerId: buyer.id,
          isForSale: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.properties.id, propertyId));

      return NextResponse.json({ transaction, success: true });
    } else if (action === "verify" && buyer.role === "government") {
      // Verify property (only government users can verify)
      // In real implementation, this would be done with proper signing

      // Update property verification status
      await db
        .update(schema.properties)
        .set({
          isVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(schema.properties.id, propertyId));

      // Create verification record
      const [verification] = await db
        .insert(schema.verifications)
        .values({
          governmentUserId: buyer.id,
          propertyId: property.id,
          status: "approved",
        })
        .returning();

      return NextResponse.json({ verification, success: true });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing property action:", error);
    return NextResponse.json(
      { error: "Failed to process property action" },
      { status: 500 }
    );
  }
}
