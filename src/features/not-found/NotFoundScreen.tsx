import { Link, useLocation } from "react-router";

import { buttonVariants } from "@/components/ui/button";

export function NotFoundScreen() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto mt-12 flex max-w-[560px] flex-col items-center gap-4 text-center md:mt-20">
      <p aria-hidden="true" className="font-serif text-[96px] leading-none text-rose italic">
        404
      </p>
      <h1 className="text-[44px] leading-[1.1]">Page not found</h1>
      <p className="text-subtle">There’s nothing at {pathname}.</p>
      <Link to="/" className={`${buttonVariants({ variant: "outline" })} text-ink hover:text-ink`}>
        Go to the generator
      </Link>
    </div>
  );
}
