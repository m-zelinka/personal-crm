import { invariant, invariantResponse } from "@epic-web/invariant";
import { PencilIcon, StarIcon, TrashIcon } from "@heroicons/react/20/solid";
import type { Contact } from "@prisma/client";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { prisma } from "~/utils/db.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.contact
        ? data.contact.first || data.contact.last
          ? `${data.contact.first} ${data.contact.last}`
          : "No Name"
        : "No contact found",
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
    select: { id: true, first: true, last: true, avatar: true, favorite: true },
    where: { id: params.contactId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  return json({ contact });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
    select: { id: true },
    where: { id: params.contactId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  const formData = await request.formData();

  if (formData.get("intent") === "favorite") {
    const favorite = formData.get("favorite");

    await prisma.contact.update({
      select: { id: true },
      data: { favorite: favorite === "true" },
      where: { id: params.contactId },
    });

    return json({ ok: true });
  }

  if (formData.get("intent") === "delete") {
    await prisma.contact.delete({
      select: { id: true },
      where: { id: contact.id },
    });

    return redirect("/contacts");
  }

  invariantResponse(
    false,
    `Invalid intent: ${formData.get("intent") ?? "Missing"}`,
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex items-end">
        <div className="flex flex-none">
          {contact.avatar ? (
            <img
              key={contact.avatar}
              src={contact.avatar}
              alt=""
              className="size-32 rounded-full"
            />
          ) : (
            <span
              className="inline-block size-32 overflow-hidden rounded-full bg-gray-100"
              aria-hidden
            >
              <svg
                className="h-full w-full text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
          )}
        </div>
        <div className="ml-5 flex w-full min-w-0 items-baseline gap-3 pb-1">
          <h1
            className={clsx(
              "truncate text-2xl font-bold",
              contact.first || contact.last ? "text-gray-900" : "text-gray-500",
            )}
          >
            {contact.first || contact.last ? (
              <>
                {contact.first} {contact.last}
              </>
            ) : (
              "No Name"
            )}
          </h1>
          <Favorite contact={contact} />
        </div>
        <div className="ml-6 flex gap-4 pb-1">
          <Form action="edit">
            <button
              type="submit"
              className="inline-flex justify-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <PencilIcon className="-ml-0.5 size-5 text-gray-400" />
              Edit
            </button>
          </Form>
          <Form
            method="post"
            onSubmit={(event) => {
              const shouldDelete = confirm(
                "Please confirm you want to delete this record.",
              );

              if (!shouldDelete) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              className="inline-flex justify-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <TrashIcon className="-ml-0.5 size-5 text-gray-400" />
              Delete
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}

function Favorite({ contact }: { contact: Pick<Contact, "id" | "favorite"> }) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="favorite" />
      <input
        type="hidden"
        name="favorite"
        value={favorite ? "false" : "true"}
      />
      <button
        type="submit"
        className={clsx(
          "relative inline-flex size-8 items-center justify-center rounded-full bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600",
          favorite
            ? "text-yellow-400 hover:text-yellow-500"
            : "text-gray-400 hover:text-gray-500",
        )}
        aria-label={
          contact.favorite ? "Remove from favorites" : "Add to favorites"
        }
      >
        <span className="absolute -inset-1.5" />
        <StarIcon className="size-5" />
      </button>
    </fetcher.Form>
  );
}
