/* eslint-disable @next/next/no-img-element */
import { BRAND } from "@/lib/brand";
import { ANTHROPIC_D, CLAUDE_D, OPENAI_D } from "./logoPaths";

/** "Robinhood" always comes with its feather right before it. */
export function RH({ chain = true, light = false }: { chain?: boolean; light?: boolean }) {
  return (
    <span className="whitespace-nowrap">
      <Feather light={light} />
      Robinhood{chain ? " Chain" : ""}
    </span>
  );
}

export function Feather({ light = false, className = "rh-feather" }: { light?: boolean; className?: string }) {
  return <img src={light ? "/brand/robinhood.svg" : "/brand/robinhood-dark.svg"} alt="" className={className} aria-hidden />;
}

export function Nvda({ className = "h-5 w-5" }: { className?: string }) {
  return <img src="/logos/NVDA.svg" alt="NVDA" className={`inline-block rounded-full ${className}`} />;
}

/** Just Ask mark: a chat bubble with a spark inside. */
export function Logo({ size = 22, light = false }: { size?: number; light?: boolean }) {
  const bubble = light ? "#ffffff" : "#050609";
  const spark = light ? "#050609" : "#fffdbd";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M16 3C8.8 3 3 8.1 3 14.4c0 3.4 1.7 6.5 4.4 8.6l-1.1 4.6c-.2.8.7 1.4 1.4.9l4.7-3c1.1.3 2.3.4 3.6.4 7.2 0 13-5.1 13-11.5S23.2 3 16 3z" fill={bubble} />
      <path d="M16 8.2l1.5 4.3 4.3 1.5-4.3 1.5-1.5 4.3-1.5-4.3-4.3-1.5 4.3-1.5z" fill={spark} />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Logo light={light} size={22} />
      <span className="text-[15px] font-medium tracking-[-0.02em]">{BRAND.name}</span>
    </span>
  );
}

export function ClaudeMark({ className = "h-4 w-4", color = "#D97757" }: { className?: string; color?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden><path d={CLAUDE_D} fill={color} /></svg>;
}
export function AnthropicMark({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden><path d={ANTHROPIC_D} fill="currentColor" /></svg>;
}
export function ChatGPTMark({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden><path d={OPENAI_D} fill="currentColor" /></svg>;
}
export const OpenAIMark = ChatGPTMark;
