"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

const properties = [
  {
    id: 1,
    title: "Luxury Villa in Bandra",
    location: "Mumbai, Maharashtra",
    price: 250.5,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&h=500&fit=crop",
    area: "5,000 sq ft",
  },
  {
    id: 2,
    title: "Modern Apartment in Indiranagar",
    location: "Bangalore, Karnataka",
    price: 180.75,
    image:
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=800&h=500&fit=crop",
    area: "2,500 sq ft",
  },
  {
    id: 3,
    title: "Penthouse in Jubilee Hills",
    location: "Hyderabad, Telangana",
    price: 320.25,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&h=500&fit=crop",
    area: "4,200 sq ft",
  },
];

const Page = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Buy Property</h2>
        <p className="text-muted-foreground">
          Available properties for purchase
        </p>
      </div>

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
              <p className="text-2xl font-bold">ETH {property.price}</p>
              <p className="text-muted-foreground">{property.area}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant={"secondary"} className="flex-1">
                Send Quote
              </Button>
              <Button className="flex-1">Buy Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Page;
