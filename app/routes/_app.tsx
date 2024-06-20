import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { Form, Outlet } from "@remix-run/react";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function Component() {
  return (
    <div className="bg-background">
      <nav className="fixed inset-y-0 left-0 z-50 border-r bg-background">
        <div className="h-full">
          <div className="flex h-full w-16 flex-col items-center">
            <div className="flex flex-col items-center gap-4 px-2 py-5">
              <div className="flex-none">
                <Logo className="h-9 w-auto text-blue-600" />
              </div>
            </div>
            <div className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
              <SignoutForm />
            </div>
          </div>
        </div>
      </nav>
      <div className="isolate pl-16">
        <Outlet />
      </div>
    </div>
  );
}

function SignoutForm() {
  const buttonLabel = "Sign out";

  return (
    <Form method="post" action="/logout">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="rounded-lg"
            aria-label={buttonLabel}
          >
            <ArrowRightStartOnRectangleIcon className="size-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">{buttonLabel}</TooltipContent>
      </Tooltip>
    </Form>
  );
}
