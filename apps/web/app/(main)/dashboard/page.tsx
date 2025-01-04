import { auth, clerkClient } from "@clerk/nextjs/server";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { UserButton } from "@clerk/nextjs";

const Page = async () => {
  const { userId: userAuthId } = await auth();

  if (!userAuthId) {
    throw new Error("User not authenticated");
  }

  const client = await clerkClient();

  const user = await client.users.getUser(userAuthId);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome {user.fullName}</p>
          <UserButton />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
