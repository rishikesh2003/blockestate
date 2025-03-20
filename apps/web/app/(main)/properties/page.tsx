import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Properties - BlockEstate",
  description: "Manage your real estate properties",
};

export default async function PropertiesPage() {
  const { userId: userAuthId } = await auth();

  if (!userAuthId) {
    throw new Error("User not authenticated");
  }

  // Get user from database
  const dbUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.authId, userAuthId));

  const dbUser = dbUsers[0];

  if (!dbUser) {
    // Handle case where user is not in database yet
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
        <p>Setting up your account. Please check back shortly.</p>
      </div>
    );
  }

  // Get all properties
  const properties = await db
    .select()
    .from(schema.properties)
    .where(eq(schema.properties.ownerId, dbUser.id));

  // Get properties for sale (not owned by user)
  const propertiesForSale = await db
    .select()
    .from(schema.properties)
    .where(eq(schema.properties.isForSale, true));

  const filteredPropertiesForSale = propertiesForSale.filter(
    (property) => property.ownerId !== dbUser.id
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">My Properties</h2>
        <Link href="/properties/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={
                    property.imgUrl ||
                    "https://placehold.co/600x400?text=Property+Image"
                  }
                  alt={property.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="truncate">{property.name}</CardTitle>
                  <Badge variant={property.isVerified ? "default" : "outline"}>
                    {property.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <CardDescription>{property.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ETH {property.price || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {property.isForSale ? "For Sale" : "Not For Sale"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/properties/${property.id}`}>
                  <Button variant="outline">Manage</Button>
                </Link>
                {!property.isForSale && (
                  <Link href={`/properties/${property.id}/sell`}>
                    <Button>List For Sale</Button>
                  </Link>
                )}
                {property.isForSale && (
                  <Link href={`/properties/${property.id}/sell`}>
                    <Button variant="outline">Edit Listing</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            You don't own any properties yet. Add your first property to get
            started.
          </p>
          <Link href="/properties/create">
            <Button>Add Property</Button>
          </Link>
        </div>
      )}

      <div className="mt-12 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Properties For Sale
        </h2>
      </div>

      {filteredPropertiesForSale.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPropertiesForSale.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={
                    property.imgUrl ||
                    "https://placehold.co/600x400?text=Property+Image"
                  }
                  alt={property.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="truncate">{property.name}</CardTitle>
                  <Badge variant={property.isVerified ? "default" : "outline"}>
                    {property.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <CardDescription>{property.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  ETH {property.price || "N/A"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link href={`/properties/${property.id}/buy`}>
                  <Button>Buy Property</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">
            No properties are currently for sale by other users.
          </p>
        </div>
      )}
    </div>
  );
}
