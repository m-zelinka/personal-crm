import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Logo } from "~/components/logo";
import { buttonVariants } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [{ title: "Welcome" }];
};

export default function Component() {
  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <Logo className="mx-auto h-11 w-auto" />
        <div className="text-center">
          <h1 className="mt-10 text-balance text-4xl font-extrabold tracking-tight lg:text-5xl">
            Supercharge your relationships
          </h1>
          <p className="mt-6 text-pretty text-xl text-muted-foreground">
            A better way to keep in touch, and manage your personal &amp;
            professional relationships.
          </p>
        </div>
        <div className="mt-10">
          <div className="flex justify-center gap-4">
            <Link to="/join" className={buttonVariants()}>
              Get started
            </Link>
            <Link to="/login" className={buttonVariants({ variant: "ghost" })}>
              <span>
                Log in <span aria-hidden>→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
