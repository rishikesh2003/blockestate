"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Boxes,
  Building2,
  LayoutDashboard,
  Plus,
  CheckCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Your Listings",
    icon: Building2,
    href: "/dashboard/your-listings",
  },
  {
    label: "Buy Property",
    icon: Building2,
    href: "/dashboard/buy-properties",
  },
  {
    label: "Add Property",
    icon: Plus,
    href: "/dashboard/add-property",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isGovernment, setIsGovernment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user role from the database when Clerk user is loaded
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/role?userId=${user.id}`);

        if (response.ok) {
          const data = await response.json();
          setIsGovernment(data.role === "government");
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user, isLoaded]);

  // Government-only routes
  const governmentRoutes = [
    {
      label: "Verify Properties",
      icon: CheckCircle,
      href: "/dashboard/verify-properties",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-black text-white text-card-foreground border-r">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <Boxes className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl text-blue-400 font-bold ml-2">BlockEstate</h1>
        </Link>

        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition",
                pathname === route.href
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3")} />
                {route.label}
              </div>
            </Link>
          ))}

          {/* Show government routes only for government users */}
          {!isLoading && isGovernment && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-muted-foreground">
                Government Tools
              </div>
              {governmentRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition",
                    pathname === route.href
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className={cn("h-5 w-5 mr-3")} />
                    {route.label}
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
