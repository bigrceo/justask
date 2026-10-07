import { Hero } from "@/components/sections/Hero";
import { Setup } from "@/components/sections/Setup";
import { Fees } from "@/components/sections/Fees";
import { TopCoins } from "@/components/sections/TopCoins";
import { Burns } from "@/components/sections/Burns";
import { FAQ } from "@/components/sections/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <Setup />
      <Fees />
      <TopCoins />
      <Burns />
      <FAQ />
    </>
  );
}
