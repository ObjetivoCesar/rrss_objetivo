"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Composer from "@/components/composer/Composer";

export default function EditorPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)]">
        <Composer />
      </div>
    </DashboardLayout>
  );
}
