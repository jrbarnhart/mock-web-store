"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

export function Nav({ children }: { children: React.ReactNode }) {
  return (
    <nav className="bg-primary text-primary-foreground flex justify-center px-4 text-sm sm:text-base">
      {children}
    </nav>
  );
}

export function NavLink(props: Omit<ComponentProps<typeof Link>, "classname">) {
  const pathname = usePathname();
  return (
    <Link
      {...props}
      className={cn(
        "p-3 hover:bg-secondary hover:text-secondary-foreground focus-visible::bg-secondary focus-visible::text-secondary-foreground",
        pathname === props.href && "bg-background text-foreground"
      )}
    />
  );
}
