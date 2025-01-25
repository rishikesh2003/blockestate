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

const stats = [
  {
    title: "Owned Properties",
    value: "4",
    icon: Building2,
    change: "+1 from last month",
  },
  {
    title: "Portfolio Value",
    value: "ETH 450.89",
    icon: Wallet,
    change: "+ETH 45.34 from last month",
  },
  {
    title: "Appreciation",
    value: "+24.5%",
    icon: TrendingUp,
    change: "+5% from last month",
  },
];

const properties = [
  {
    id: 1,
    title: "Luxury Villa in Bandra",
    location: "Mumbai, Maharashtra",
    value: 250.5,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&h=500&fit=crop",
    area: "5,000 sq ft",
    purchaseDate: "Jan 2024",
  },
  {
    id: 2,
    title: "Modern Apartment in Indiranagar",
    location: "Bangalore, Karnataka",
    value: 180.75,
    image:
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=800&h=500&fit=crop",
    area: "2,500 sq ft",
    purchaseDate: "Nov 2023",
  },
];

const Page = async () => {
  const { userId: userAuthId } = await auth();

  if (!userAuthId) {
    throw new Error("User not authenticated");
  }

  const client = await clerkClient();

  const user = await client.users.getUser(userAuthId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome, {user.username}.
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{property.title}</CardTitle>
                <CardDescription>{property.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">ETH {property.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.area}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Purchased: {property.purchaseDate}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Page;
