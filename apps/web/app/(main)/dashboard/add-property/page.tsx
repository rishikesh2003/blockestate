"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Page = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add Property</h2>
        <p className="text-muted-foreground">List a new property for sale</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Enter the details of your property to list it on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name</Label>
                <Input
                  id="propertyName"
                  placeholder="Enter property name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Enter city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Enter state" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" placeholder="Enter pincode" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Complete Address</Label>
              <Input
                id="address"
                placeholder="Enter complete address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Property Documents</Label>
              <Input
                id="documents"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={() => setIsUploading(true)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Upload property documents (deeds, certificates, etc.)
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? "Uploading Documents..." : "Add Property"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
