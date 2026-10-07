import type { Metadata } from "next";
import { Explore } from "@/components/Explore";

export const metadata: Metadata = { title: "Explore", description: "Every coin launched with Just Ask on Robinhood Chain." };
export default function Page() { return <Explore />; }
