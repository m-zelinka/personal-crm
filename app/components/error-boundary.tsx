import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export function GeneralErrorBoundary() {
  const error = useRouteError();
  const errorMessage = isRouteErrorResponse(error)
    ? error.data
    : getErrorMessage(error);

  return (
    <div>
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
        <ExclamationTriangleIcon className="size-6 text-red-600" />
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-base/6 font-semibold text-gray-900">
          Oops! An error occurred…
        </h3>
        <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  console.error("Unable to get error message for error", error);

  return "Unknown Error";
}
