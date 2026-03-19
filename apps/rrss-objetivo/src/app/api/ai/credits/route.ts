import { NextResponse } from "next/server";
import { getHFCredits } from "@/lib/hf-credits";

export async function GET() {
  const credits = await getHFCredits();
  return NextResponse.json(credits);
}
