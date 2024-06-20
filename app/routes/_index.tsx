import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Logo } from "~/components/logo";
import { buttonVariants } from "~/components/ui/button";
import { useOptionalUser } from "~/utils/user";

export const meta: MetaFunction = () => {
  return [{ title: "Welcome" }];
};

export default function Component() {
  const user = useOptionalUser();

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <Logo className="mx-auto h-11 w-auto" />
        <div className="text-center">
          <h1 className="mt-10 text-balance text-4xl font-extrabold tracking-tight lg:text-5xl">
            Supercharge your relationships
          </h1>
          <p className="mt-6 text-pretty text-xl text-muted-foreground">
            Finally, manage all your personal and professional relationships.
            Move beyond the CRM—keep in touch with your network.
          </p>
        </div>
        <div className="mt-10">
          {user ? (
            <div className="flex flex-col items-center gap-2">
              <Link to="/contacts" className={buttonVariants()}>
                <span>
                  Continue to contacts <span aria-hidden>→</span>
                </span>
              </Link>
              <p className="text-[0.8rem] text-muted-foreground">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {user.email}
                </span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link to="/join" className={buttonVariants()}>
                Get started
              </Link>
              <Link
                to="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                <span>
                  Log in <span aria-hidden>→</span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
