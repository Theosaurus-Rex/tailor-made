import { Link, useLocation } from "react-router";

import { MessagePage } from "@/components/MessagePage";
import { buttonVariants } from "@/components/ui/button";

export function NotFoundScreen() {
  const { pathname } = useLocation();
  return (
    <MessagePage
      visual={
        <p aria-hidden="true" className="font-serif text-[96px] leading-none text-rose italic">
          404
        </p>
      }
    >
      <h1 className="text-[44px] leading-[1.1]">Page not found</h1>
      <p className="text-subtle">There’s nothing at {pathname}.</p>
      <Link
        to="/"
        className={buttonVariants({ variant: "outline", className: "text-ink hover:text-ink" })}
      >
        Go to the generator
      </Link>
    </MessagePage>
  );
}
