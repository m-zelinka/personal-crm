import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import type { Contact } from "@prisma/client";
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import clsx from "clsx";
import { matchSorter } from "match-sorter";
import { useEffect, useRef, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import sortBy from "sort-by";
import { useSpinDelay } from "spin-delay";
import { LoadingOverlay } from "~/components/loading-overlay";
import { prisma } from "~/utils/db.server";

export const meta: MetaFunction = () => {
  return [{ title: "Contacts" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  let contacts = await prisma.contact.findMany({
    select: { id: true, first: true, last: true, favorite: true },
  });

  if (q) {
    contacts = matchSorter(contacts, q, { keys: ["first", "last"] });
  }

  contacts = contacts.sort(sortBy("last", "createdAt"));

  return json({ contacts });
}

export async function action() {
  const contact = await prisma.contact.create({
    select: { id: true },
    data: {},
  });

  return redirect(`/contacts/${contact.id}/edit`);
}

export default function Component() {
  const { contacts } = useLoaderData<typeof loader>();

  return (
    <>
      <main className="py-6 pl-96">
        <LoadingOverlay>
          <div className="mx-auto max-w-4xl px-8">
            <Outlet />
          </div>
        </LoadingOverlay>
      </main>
      <aside className="fixed inset-y-0 flex w-96 flex-col overflow-y-auto border-r border-gray-200">
        <div className="sticky top-0 z-40 flex w-full gap-4 bg-white/90 px-8 py-4 ring-1 ring-gray-200 backdrop-blur-sm">
          <search role="search" className="flex-1">
            <Form>
              <SearchBar />
            </Form>
          </search>
          <Form method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              aria-label="New contact"
            >
              <PlusIcon className="-ml-0.5 size-5" />
              New
            </button>
          </Form>
        </div>
        <nav className="flex-1 px-8 py-4">
          {contacts.length ? (
            <ul className="-mx-2">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={contact.id}
                    prefetch="intent"
                    className={({ isActive, isPending }) =>
                      clsx(
                        "group flex items-center gap-3 rounded-md p-2 text-sm",
                        isActive
                          ? "bg-blue-600 text-white"
                          : isPending
                            ? "bg-gray-100 text-blue-600"
                            : contact.first || contact.last
                              ? "text-gray-700"
                              : "text-gray-500",
                        !isActive && !isPending
                          ? "hover:bg-gray-100 hover:text-gray-900"
                          : "",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex-auto truncate">
                          {contact.first || contact.last ? (
                            <>
                              {contact.first} {contact.last}
                            </>
                          ) : (
                            "No Name"
                          )}
                        </span>
                        <Favorite contact={contact}>
                          <StarIcon
                            className={clsx(
                              "size-5 flex-none",
                              isActive
                                ? ""
                                : "text-yellow-400 group-hover:text-yellow-500",
                            )}
                          />
                        </Favorite>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No contacts</p>
          )}
        </nav>
      </aside>
    </>
  );
}

function SearchBar() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");

  const navigation = useNavigation();
  const searching = new URLSearchParams(navigation.location?.search).has("q");
  const showSpinner = useSpinDelay(searching);

  // Used to submit the form for every keystroke
  const submit = useSubmit();

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync search input value with the URL Search Params
  useEffect(() => {
    const searchField = inputRef.current;
    if (searchField) {
      searchField.value = q ?? "";
    }
  }, [q]);

  // Focus input on key press
  const keyShortcut = "/";
  useHotkeys(
    keyShortcut,
    () => {
      const searchField = inputRef.current;
      if (searchField) {
        searchField.focus();
        searchField.select();
      }
    },
    { preventDefault: true },
  );

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
        aria-hidden
      >
        {showSpinner ? (
          <ArrowPathIcon className="size-5 animate-spin text-gray-400" />
        ) : (
          <MagnifyingGlassIcon className="size-5 text-gray-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="search"
        name="q"
        id="q"
        defaultValue={q ?? undefined}
        onChange={(event) => {
          const isFirstSearch = q === null;
          submit(event.currentTarget.form, {
            replace: !isFirstSearch,
          });
        }}
        className="block w-full rounded-md border-0 py-1.5 pl-10 pr-8 text-sm/6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
        placeholder="Search"
        aria-label="Search contacts"
        aria-keyshortcuts={keyShortcut}
      />
      <div
        className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5"
        aria-hidden
      >
        <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
          {keyShortcut}
        </kbd>
      </div>
    </div>
  );
}

function Favorite({
  contact,
  children,
}: {
  contact: Pick<Contact, "id" | "favorite">;
  children: ReactNode;
}) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` });
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  if (!favorite) {
    return null;
  }

  return children;
}
