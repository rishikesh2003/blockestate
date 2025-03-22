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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { addProperty } from "@/lib/blockchain";
import { ethers } from "ethers";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Property name must be at least 3 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a valid positive number",
    }),
  description: z.string().optional(),
  imgUrl: z.string().url("Please enter a valid image URL"),
});

// TypeScript declaration for Ethereum provider
declare global {
  interface Window {
    ethereum: any;
  }
}

const Page = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      price: "",
      description: "",
      imgUrl: "",
    },
  });

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      toast.info("Processing your property...");

      if (!documentFile) {
        toast.error("Please upload property documents");
        setIsUploading(false);
        return;
      }

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("location", values.location);
      formData.append("price", values.price);
      formData.append("description", values.description || "");
      formData.append("imgUrl", values.imgUrl);
      formData.append("isForSale", "false");
      formData.append("document", documentFile);

      // First upload files and create database entry
      const response = await fetch("/api/properties", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add property");
      }

      const data = await response.json();

      // Now add to blockchain via MetaMask
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask to use this feature."
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No Ethereum accounts found. Please connect your MetaMask wallet."
        );
      }

      // Create a provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Call blockchain function to add property
      toast.info("Confirm the transaction in your MetaMask wallet");

      const blockchainId = await addProperty(
        signer,
        data.name,
        data.location,
        data.price,
        data.documentHash
      );

      if (!data.id) {
        console.error("Error: Property ID is missing in the API response");
        toast.error("Error: Property ID is missing in the API response");
        return;
      }

      const updateResponse = await fetch(
        `/api/properties/${data.id}?action=update-blockchain-id`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ blockchainId }),
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error("Update blockchainId error:", {
          status: updateResponse.status,
          statusText: updateResponse.statusText,
          body: errorData,
        });

        toast.warning(
          `Property was added but blockchain ID could not be updated in the database: ${errorData.error || updateResponse.statusText}`
        );
      }

      toast.success("Property added successfully", {
        description: "Your property has been registered on the blockchain",
      });

      // Redirect to listings page
      router.push("/dashboard/your-listings");
    } catch (error: any) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Add Property</h2>
        <p className="text-muted-foreground">
          List a new property on the blockchain
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Enter the details of your property to list it on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter property name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ETH)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0.5"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Property description"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imgUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter image URL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="documents">Property Documents</Label>
                <Input
                  id="documents"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentChange}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Upload property documents (deeds, certificates, etc.)
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Processing..." : "Add Property"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
