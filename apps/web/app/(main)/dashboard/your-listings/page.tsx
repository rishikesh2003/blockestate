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
    title: "3BHK Apartment in Powai",
    location: "Mumbai, Maharashtra",
    price: 150.25,
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&h=500&fit=crop",
    status: "Listed",
  },
  {
    id: 2,
    title: "Villa in Koramangala",
    location: "Bangalore, Karnataka",
    price: 280.5,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&h=500&fit=crop",
    status: "Pending",
  },
];

const Page = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Listings</h2>
        <p className="text-muted-foreground">Manage your property listings</p>
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
              <p className="text-sm text-muted-foreground">
                Status: {property.status}
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Edit Listing</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Page;
