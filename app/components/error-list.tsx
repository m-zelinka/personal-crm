import clsx from "clsx";

export function ErrorList({
  id,
  errors,
  className,
}: {
  id?: string;
  errors?: Array<string | null | undefined> | null | undefined;
  className?: string;
}) {
  const errorsToShow = errors?.filter(Boolean);

  if (!errorsToShow?.length) {
    return null;
  }

  return (
    <ul id={id} className={clsx("space-y-1", className)}>
      {errorsToShow.map((error) => (
        <li key={error} className="text-sm text-red-600">
          {error}
        </li>
      ))}
    </ul>
  );
}
