import type { ReactNode } from "react";
import { ChatGPTMark, ClaudeMark, Feather, Nvda } from "@/components/ui/Brand";

const ITEMS: { icon: ReactNode; name: string; sub: string }[] = [
  { icon: <ClaudeMark className="h-7 w-7 md:h-8 md:w-8" />, name: "Claude", sub: "Anthropic" },
  { icon: <ChatGPTMark className="h-7 w-7 md:h-8 md:w-8" />, name: "ChatGPT", sub: "OpenAI" },
  { icon: <Feather className="h-7 w-auto md:h-8" />, name: "Robinhood", sub: "Chain" },
  { icon: <Nvda className="h-7 w-7 md:h-8 md:w-8" />, name: "NVDA", sub: "Paired stock" },
];

export function LogoRow() {
  return (
    <div>
      <ul className="grid grid-cols-4 gap-2">
        {ITEMS.map((i) => (
          <li key={i.name} className="flex flex-col items-center gap-1.5 rounded-[16px] border border-line bg-white px-1 py-3 text-center md:flex-row md:gap-3 md:px-4 md:text-left">
            <span className="flex h-8 items-center">{i.icon}</span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[12.5px] font-semibold tracking-[-0.01em] text-ink md:text-[16px]">{i.name}</span>
              <span className="block truncate text-[11px] text-muted md:text-[12.5px]">{i.sub}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 text-[12.5px] text-muted md:text-[13.5px]">Works in Claude &amp; ChatGPT · Live on Robinhood Chain · Every coin paired with NVDA</p>
    </div>
  );
}
