import { cloneElement, type ReactElement, type ReactNode } from "react";

export function Empty({
  icon,
  title = "No data",
  description,
  children,
}: {
  icon?: ReactElement;
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      {icon
        ? cloneElement(icon, {
            className: "mb-4 size-6 text-gray-400",
            "aria-hidden": true,
          })
        : null}
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
