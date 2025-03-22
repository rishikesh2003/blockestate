import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, schema } from "@blockestate/data";
import { eq, and } from "drizzle-orm";

// GET /api/properties/[id] - Get a specific property
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await params to handle Next.js async routes
    const params = await Promise.resolve(context.params);

    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const propertyId = params.id;
    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    // Get property from database
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
  context: { params: { id: string } }
) {
  try {
    // Await params to handle Next.js async routes
    const params = await Promise.resolve(context.params);

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
  context: { params: { id: string } }
) {
  try {
    // Await params to handle Next.js async routes
    const params = await Promise.resolve(context.params);

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
      // Get transaction hash from request
      let transactionHash;

      try {
        const requestBody = await req.json();
        transactionHash = requestBody.transactionHash;

        if (!transactionHash) {
          return NextResponse.json(
            { error: "Transaction hash is required for property purchase" },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }

      // Make sure user isn't buying their own property
      if (property.ownerId === buyer.id) {
        return NextResponse.json(
          { error: "You cannot buy your own property" },
          { status: 400 }
        );
      }

      // Make sure property is for sale
      if (!property.isForSale) {
        return NextResponse.json(
          { error: "Property is not for sale" },
          { status: 400 }
        );
      }

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
      const updatedProperties = await db
        .update(schema.properties)
        .set({
          ownerId: buyer.id,
          isForSale: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.properties.id, propertyId))
        .returning();

      return NextResponse.json({
        transaction,
        property: updatedProperties[0],
        success: true,
        message: "Property purchased successfully",
      });
    } else if (action === "verify" && buyer.role === "government") {
      // Verify property (only government users can verify)
      let transactionHash;
      let isVerified = true; // Default to verifying the property

      try {
        const requestBody = await req.json();
        transactionHash = requestBody.transactionHash;
        // If isVerified is explicitly set to false, use that
        if (requestBody.isVerified === false) {
          isVerified = false;
        }
      } catch (error) {
        // It's okay if there's no body or transaction hash
      }

      // Update property verification status
      const updatedProperties = await db
        .update(schema.properties)
        .set({
          isVerified: isVerified,
          updatedAt: new Date(),
        })
        .where(eq(schema.properties.id, propertyId))
        .returning();

      // Create verification record if transaction hash is provided
      if (transactionHash) {
        try {
          await db.insert(schema.verifications).values({
            governmentUserId: buyer.id,
            propertyId: property.id,
            status: isVerified ? "approved" : "rejected",
            transactionHash: transactionHash,
          });
        } catch (insertError) {
          console.error("Error inserting verification record:", insertError);
          // Continue even if verification record creation fails
        }
      }

      return NextResponse.json({
        property: updatedProperties[0],
        success: true,
        message: isVerified
          ? "Property verified successfully"
          : "Property verification rejected",
      });
    } else if (action === "list-for-sale") {
      // List property for sale
      let price;
      let transactionHash;

      try {
        const requestBody = await req.json();
        price = requestBody.price;
        transactionHash = requestBody.transactionHash;

        if (!price) {
          return NextResponse.json(
            { error: "Price is required to list property for sale" },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }

      // Ensure user owns this property
      if (property.ownerId !== buyer.id) {
        return NextResponse.json(
          { error: "You don't have permission to list this property for sale" },
          { status: 403 }
        );
      }

      // Update property in database
      const updatedProperties = await db
        .update(schema.properties)
        .set({
          isForSale: true,
          price: price,
          updatedAt: new Date(),
        })
        .where(eq(schema.properties.id, propertyId))
        .returning();

      // Create transaction record if transactionHash is provided
      if (transactionHash) {
        try {
          await db.insert(schema.transactions).values({
            buyerId: buyer.id,
            sellerId: buyer.id, // Same user for listing
            propertyId: property.id,
            amount: price,
            transactionHash: transactionHash,
          });
        } catch (insertError) {
          console.error("Error inserting transaction record:", insertError);
          // Continue even if transaction record creation fails
        }
      }

      return NextResponse.json({
        property: updatedProperties[0],
        success: true,
        message: "Property listed for sale successfully",
      });
    } else if (action === "remove-from-sale") {
      // Remove property from sale
      let transactionHash;

      try {
        const requestBody = await req.json();
        transactionHash = requestBody.transactionHash;
      } catch (error) {
        // It's okay if there's no body or transaction hash
      }

      // Ensure user owns this property
      if (property.ownerId !== buyer.id) {
        return NextResponse.json(
          { error: "You don't have permission to update this property" },
          { status: 403 }
        );
      }

      // Check if property is actually for sale
      if (!property.isForSale) {
        return NextResponse.json(
          { error: "This property is not currently for sale" },
          { status: 400 }
        );
      }

      // Update property in database
      const updatedProperties = await db
        .update(schema.properties)
        .set({
          isForSale: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.properties.id, propertyId))
        .returning();

      // Create transaction record if transactionHash is provided
      if (transactionHash) {
        try {
          await db.insert(schema.transactions).values({
            buyerId: buyer.id,
            sellerId: buyer.id, // Same user for delisting
            propertyId: property.id,
            amount: "0", // No amount for delisting
            transactionHash: transactionHash,
          });
        } catch (insertError) {
          console.error("Error inserting transaction record:", insertError);
          // Continue even if transaction record creation fails
        }
      }

      return NextResponse.json({
        property: updatedProperties[0],
        success: true,
        message: "Property removed from sale successfully",
      });
    } else if (action === "update-blockchain-id") {
      // Update blockchain ID action
      let blockchainId;

      try {
        const requestBody = await req.json();
        blockchainId = requestBody.blockchainId;

        if (blockchainId === undefined) {
          return NextResponse.json(
            { error: "Blockchain ID is required" },
            { status: 400 }
          );
        }

        // Ensure blockchainId is a number
        if (typeof blockchainId !== "number") {
          return NextResponse.json(
            { error: "Blockchain ID must be a number" },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }

      // Ensure user owns this property
      if (property.ownerId !== buyer.id) {
        return NextResponse.json(
          { error: "You don't have permission to update this property" },
          { status: 403 }
        );
      }

      // Update property in database
      const updatedProperties = await db
        .update(schema.properties)
        .set({
          blockchainId,
          updatedAt: new Date(),
        })
        .where(eq(schema.properties.id, propertyId))
        .returning();

      return NextResponse.json({
        property: updatedProperties[0],
        success: true,
        message: "Blockchain ID updated successfully",
      });
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

export const runtime = "nodejs";
