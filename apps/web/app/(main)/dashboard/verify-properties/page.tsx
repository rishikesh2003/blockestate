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
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { VerifyActions } from "./verify-actions";

const VerifyPropertiesPage = async () => {
  const { userId: userAuthId } = await auth();

  if (!userAuthId) {
    return redirect("/");
  }

  const client = await clerkClient();

  // Get user from database
  const dbUser = await db.query.users.findFirst({
    where: eq(schema.users.authId, userAuthId),
  });

  // Check if user is a government user
  if (!dbUser || dbUser.role !== "government") {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>This dashboard is only accessible to government officials.</p>
      </div>
    );
  }

  // Get all unverified properties
  const properties = await db.query.properties.findMany({
    where: eq(schema.properties.isVerified, false),
  });

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
                      <VerifyActions
                        propertyId={property.id}
                        onStatusChange={() => {
                          // This will trigger a refresh of the page data
                          window.location.reload();
                        }}
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
