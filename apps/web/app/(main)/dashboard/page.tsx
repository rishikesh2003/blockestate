import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, TrendingUp, Wallet } from "lucide-react";
import Image from "next/image";
import { db, schema } from "@blockestate/data";
import { eq } from "drizzle-orm";

const Page = async () => {
  const { userId: userAuthId } = await auth();

  if (!userAuthId) {
    throw new Error("User not authenticated");
  }

  // Get user from Clerk
  const client = await clerkClient();
  const user = await client.users.getUser(userAuthId);

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
        <h2 className="text-3xl font-bold tracking-tight">Welcome!</h2>
        <p>Setting up your account. Please check back shortly.</p>
      </div>
    );
  }

  // Get user's properties
  const properties = await db
    .select()
    .from(schema.properties)
    .where(eq(schema.properties.ownerId, dbUser.id));

  // Calculate statistics
  const totalProperties = properties.length;
  let portfolioValue = 0;

  properties.forEach((property) => {
    if (property.price) {
      portfolioValue += parseFloat(property.price);
    }
  });

  const stats = [
    {
      title: "Owned Properties",
      value: totalProperties.toString(),
      icon: Building2,
      change: "Updated just now",
    },
    {
      title: "Portfolio Value",
      value: `ETH ${portfolioValue.toFixed(2)}`,
      icon: Wallet,
      change: "Based on current holdings",
    },
    {
      title: "Status",
      value: totalProperties > 0 ? "Active" : "No Properties",
      icon: TrendingUp,
      change: "Real-time status",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome{user.username ? `, ${user.username}` : ""}.
        </h2>
        <p className="text-muted-foreground">
          Overview of your real estate portfolio
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-2xl font-semibold tracking-tight mb-4">
          Your Properties
        </h3>
        {properties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  <CardTitle>{property.name}</CardTitle>
                  <CardDescription>{property.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold">
                        ETH {property.price || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {property.isVerified
                          ? "Verified"
                          : "Pending Verification"}
                      </p>
                    </div>
                    {property.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {property.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Status: {property.isForSale ? "For Sale" : "Not For Sale"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">
              You don&apos;t own any properties yet. Add your first property to
              get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Page;
