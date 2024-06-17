import { Outlet } from "@remix-run/react";
import { Logo } from "~/components/logo";

export default function Component() {
  return (
    <>
      <nav className="fixed inset-y-0 left-0 z-50 bg-gray-900">
        <div className="h-full py-4">
          <div className="flex h-full w-20 flex-col items-center justify-between">
            <div className="flex items-center">
              <div className="flex-none">
                <Logo className="h-8 w-auto text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="isolate pl-20">
        <Outlet />
      </div>
    </>
  );
}
