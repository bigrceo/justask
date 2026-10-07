import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-paper pt-24">
      <div className="container flex flex-col items-center text-center">
        <div className="caption text-muted">404</div>
        <h1 className="display mt-4">Nothing here.</h1>
        <p className="caption-lg mt-5 text-muted">Just ask for something else.</p>
        <Button href="/" className="mt-8">Back home</Button>
      </div>
    </section>
  );
}
