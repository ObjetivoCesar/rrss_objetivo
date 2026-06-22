'use client';

import DashboardLayout from "@/components/layout/DashboardLayout";
import BrandSpreadsheet from "@/components/brand/BrandSpreadsheet";

export default function BrandPlannerPage() {
  return (
    <DashboardLayout>
      <div className="w-full h-full p-2">
        <BrandSpreadsheet />
      </div>
    </DashboardLayout>
  );
}
