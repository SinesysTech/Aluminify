"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SuperadminUserAvatar } from "./superadmin-user-avatar";

interface SuperadminHeaderProps {
  name: string;
  email: string;
}

export function SuperadminHeader({ name, email }: SuperadminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 md:h-16 shrink-0 items-center gap-2 justify-between bg-background/80 backdrop-blur-xl dark:bg-background/60">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 min-w-0">
        <SidebarTrigger className="-ml-1 shrink-0" />
      </div>
      <div className="flex items-center gap-2 px-2 md:px-4 shrink-0">
        <ThemeToggle iconOnly />
        <SuperadminUserAvatar name={name} email={email} />
      </div>
    </header>
  );
}
