"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { VerifyActions } from "./verify-actions";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface Property {
  id: string;
  name: string;
  location: string;
  documentUrl: string | null;
  isVerified: boolean;
  blockchainId?: number;
}

const VerifyPropertiesPage = () => {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGovernment, setIsGovernment] = useState<boolean | null>(null);

  // Handle user authentication and role check
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Wait for auth to be loaded
        if (!isLoaded) return;

        // If user is not signed in, redirect to home
        if (!isSignedIn || !userId) {
          toast.error("Authentication required", {
            description: "Please sign in to access this page",
          });
          router.push("/");
          return;
        }

        setLoading(true);

        // Check if user is a government official
        const userResponse = await fetch("/api/users/me");
        if (!userResponse.ok) {
          console.error(
            "Failed to fetch user data:",
            await userResponse.text()
          );
          if (userResponse.status === 401) {
            toast.error("Session expired", {
              description: "Please sign in again",
            });
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        const isGov = userData.role === "government";
        setIsGovernment(isGov);

        if (!isGov) {
          toast.error("Access denied", {
            description: "This page is only accessible to government officials",
          });
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // Fetch unverified properties
        await fetchProperties();
      } catch (error) {
        console.error("Error checking user role:", error);
        toast.error("Error loading data", {
          description:
            error instanceof Error ? error.message : "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [isLoaded, isSignedIn, userId, router]);

  // Separate function to fetch properties for reuse
  const fetchProperties = async () => {
    try {
      const propertiesResponse = await fetch("/api/properties?verified=false");
      if (!propertiesResponse.ok) {
        console.error(
          "Failed to fetch properties:",
          await propertiesResponse.text()
        );
        throw new Error("Failed to fetch properties");
      }

      const propertiesData = await propertiesResponse.json();
      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Error loading properties", {
        description: "Failed to load properties for verification",
      });
    }
  };

  const handleStatusChange = async () => {
    // Refresh properties list
    setLoading(true);
    await fetchProperties();
    setLoading(false);
  };

  // Show loading state while authentication is being checked
  if (!isLoaded || isGovernment === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking authorization...</p>
      </div>
    );
  }

  // Show loading state while properties are being fetched
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    );
  }

  // Show access denied message
  if (!isGovernment) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-red-50">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p>This dashboard is only accessible to government officials.</p>
        <p className="text-sm text-muted-foreground">
          Redirecting to home page...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Government Verification Dashboard
        </h2>
        <p className="text-muted-foreground">
          Verify property documents and ownership
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties Awaiting Verification</CardTitle>
          <CardDescription>
            Review and verify ownership documents for these properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Blockchain ID</TableHead>
                  <TableHead>Actions</TableHead>
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
                      {property.blockchainId ? (
                        property.blockchainId
                      ) : (
                        <span className="text-amber-500">Not on chain</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <VerifyActions
                        propertyId={property.id}
                        onStatusChange={handleStatusChange}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No properties awaiting verification
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyPropertiesPage;
