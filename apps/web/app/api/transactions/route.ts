import { NextResponse } from "next/server";
import { db, schema } from "@blockestate/data";
import { auth } from "@clerk/nextjs/server";
import { eq, or, isNull } from "drizzle-orm";

// POST /api/transactions - Record a property transaction
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, transactionHash, amount } = await request.json();

    // Validate required fields
    if (!propertyId || !transactionHash || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get buyer (current user) from database
    const buyer = await db.query.users.findFirst({
      where: eq(schema.users.authId, userId),
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Get property details
    const property = await db.query.properties.findFirst({
      where: eq(schema.properties.id, propertyId),
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Ensure property is for sale
    if (!property.isForSale) {
      return NextResponse.json(
        { error: "Property is not for sale" },
        { status: 400 }
      );
    }

    // Ensure property has an owner
    if (!property.ownerId) {
      return NextResponse.json(
        { error: "Property has no owner" },
        { status: 400 }
      );
    }

    // Get seller from database
    const seller = await db.query.users.findFirst({
      where: eq(schema.users.id, property.ownerId),
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Create transaction record
    const [transaction] = await db
      .insert(schema.transactions)
      .values({
        buyerId: buyer.id,
        sellerId: seller.id,
        propertyId: property.id,
        amount,
        transactionHash,
      })
      .returning();

    // Update property ownership and status
    await db
      .update(schema.properties)
      .set({
        ownerId: buyer.id,
        isForSale: false,
      })
      .where(eq(schema.properties.id, propertyId));

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error recording transaction:", error);
    return NextResponse.json(
      { error: "Failed to record transaction" },
      { status: 500 }
    );
  }
}

// GET /api/transactions - Get all transactions for a user
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(schema.users.authId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all transactions where user is either buyer or seller
    const transactions = await db.query.transactions.findMany({
      where: or(
        eq(schema.transactions.buyerId, user.id),
        eq(schema.transactions.sellerId, user.id)
      ),
      with: {
        property: true,
        buyer: true,
        seller: true,
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
