import type { ReactNode } from "react";
import { cx } from "~/utils/misc";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function ErrorList({
  id,
  errors,
  className,
}: {
  id?: string;
  errors?: ListOfErrors;
  className?: string;
}) {
  const errorsToShow = errors?.filter(Boolean);

  if (!errorsToShow?.length) {
    return null;
  }

  return (
    <ul id={id} className={cx("grid gap-1", className)}>
      {errorsToShow.map((error) => (
        <li key={error} className="text-[0.8rem] text-destructive">
          {error}
        </li>
      ))}
    </ul>
  );
}

export function Description({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p id={id} className={cx("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}
