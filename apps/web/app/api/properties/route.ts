import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";

import { uploadDocument } from "@/lib/document-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle multipart form data
    const formData = await request.formData();

    // Get form fields
    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const isForSale = formData.get("isForSale") === "true";
    const imgUrl = formData.get("imgUrl") as string;

    // Get document file
    const documentFile = formData.get("document") as File;

    // Validate required fields
    if (!name || !location || !price || !imgUrl || !documentFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the user from the database
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

    // Upload document file to storage
    const documentUpload = await uploadDocument(documentFile);

    // Get URL and hash from upload result
    const documentUrl = documentUpload.url;
    const documentHash = documentUpload.hash;

    /*
    Since we're not adding to blockchain from the server side (client will handle this),
     we insert into database first and update blockchain ID later after client transaction
    */

    // Insert property into database
    const [newProperty] = await db
      .insert(schema.properties)
      .values({
        name,
        location,
        description,
        ownerId: dbUser.id,
        documentUrl,
        documentHash,
        imgUrl,
        price,
        isForSale,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Property created successfully",
      id: newProperty.id,
      documentHash,
      name,
      location,
      description,
      price,
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
    const verified = searchParams.get("verified");

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

    // Filter by verification status if provided
    if (verified !== null) {
      const isVerifiedValue = verified === "true";
      queryBuilder = queryBuilder.where(
        eq(schema.properties.isVerified, isVerifiedValue)
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
