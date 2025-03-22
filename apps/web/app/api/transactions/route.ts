import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// POST /api/transactions - Record a property transaction
export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request data
    const { propertyId, amount, transactionHash } = await request.json();

    if (!propertyId || !amount || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get buyer from database
    const buyers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.authId, userId));

    if (!buyers.length) {
      return NextResponse.json(
        { error: "Buyer not found in database" },
        { status: 404 }
      );
    }

    const buyer = buyers[0];

    // Get property details
    const properties = await db
      .select()
      .from(schema.properties)
      .where(eq(schema.properties.id, propertyId));

    if (!properties.length) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const property = properties[0];

    // Get seller details
    const sellers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, property.ownerId || ""));

    if (!sellers.length) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const seller = sellers[0];

    // Record the transaction
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

    // Update property ownership
    await db
      .update(schema.properties)
      .set({
        ownerId: buyer.id,
        isForSale: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.properties.id, propertyId));

    return NextResponse.json({
      success: true,
      message: "Transaction recorded and property ownership updated",
      transaction,
    });
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
