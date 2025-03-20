import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@blockestate/data";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye } from "lucide-react";
import Link from "next/link";
import { ListForSale } from "./list-for-sale";

const Page = async () => {
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

  // Get all properties owned by the user
  const properties = await db.query.properties.findMany({
    where: eq(schema.properties.ownerId, dbUser.id),
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Properties</h2>
        <p className="text-muted-foreground">
          View, manage, and list your properties for sale
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
          <CardDescription>
            List your properties for sale or manage existing listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>List for Sale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      {property.name}
                    </TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>
                      {property.price ? `ETH ${property.price}` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className="w-fit"
                          variant={property.isForSale ? "default" : "outline"}
                        >
                          {property.isForSale ? "For Sale" : "Not Listed"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <span>Verified:</span>
                          {property.isVerified ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={property.documentUrl || "#"}
                        target="_blank"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        View Document
                      </Link>
                    </TableCell>
                    <TableCell>
                      {property.isVerified ? (
                        <ListForSale
                          propertyId={property.id}
                          isForSale={property.isForSale ?? false}
                          currentPrice={property.price ?? undefined}
                          onListingUpdate={() => {
                            // This will trigger a refresh of the page data
                            window.location.reload();
                          }}
                        />
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Property needs verification
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You don&apos;t have any properties yet
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/add-property"
                  className="text-blue-600 hover:underline"
                >
                  Add your first property
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
