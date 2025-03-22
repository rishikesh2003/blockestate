import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, and, not } from "drizzle-orm";
import { db, schema } from "@blockestate/data";
import { redirect } from "next/navigation";
import { Check, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BuyButton } from "./buy-button";

const BuyPropertiesPage = async () => {
  const { userId: userAuthId } = await auth();

  if (!userAuthId) {
    return redirect("/");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userAuthId);

  // Get user from database
  const dbUser = await db.query.users.findFirst({
    where: eq(schema.users.authId, userAuthId),
  });

  if (!dbUser) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Account Setup Required</h2>
        <p>Please complete your account setup.</p>
      </div>
    );
  }

  // Get all properties for sale (excluding owned by current user)
  const propertiesForSale = await db.query.properties.findMany({
    where: and(
      eq(schema.properties.isForSale, true),
      eq(schema.properties.isVerified, true),
      not(eq(schema.properties.ownerId, dbUser.id))
    ),
  });

  // Default image if property has no image URL
  const defaultPropertyImage =
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&h=500&fit=crop";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Buy Properties</h2>
        <p className="text-muted-foreground">
          Browse verified properties available for purchase
        </p>
      </div>

      {propertiesForSale.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {propertiesForSale.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={property.imgUrl || defaultPropertyImage}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-2 right-2 bg-blue-500">
                  For Sale
                </Badge>
              </div>
              <CardHeader>
                <CardTitle>{property.name}</CardTitle>
                <CardDescription>{property.location}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-2xl font-bold">ETH {property.price}</p>
                </div>
                {property.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {property.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Verified Property</span>
                </div>
                <div>
                  <Link
                    href={property.documentUrl || "#"}
                    target="_blank"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <Eye className="h-4 w-4" />
                    View Property Documents
                  </Link>
                </div>
              </CardContent>
              <CardFooter>
                <BuyButton
                  propertyId={property.blockchainId || 0}
                  dbPropertyId={property.id}
                  price={property.price || "0"}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No properties available for sale
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for new listings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuyPropertiesPage;
