import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
} from '@heroicons/react/16/solid'
import type { Contact } from '@prisma/client'
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'
import {
  Form,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigation,
  useResolvedPath,
  useSearchParams,
  useSubmit,
} from '@remix-run/react'
import { matchSorter } from 'match-sorter'
import { useEffect, useRef, type ReactNode } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import sortBy from 'sort-by'
import { useSpinDelay } from 'spin-delay'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { cx } from '~/utils/misc'

export const meta: MetaFunction = () => {
  return [{ title: 'Contacts' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  let contacts = await prisma.contact.findMany({
    select: { id: true, first: true, last: true, favorite: true },
    where: { userId },
  })

  if (q) {
    contacts = matchSorter(contacts, q, { keys: ['first', 'last'] })
  }

  contacts = contacts.sort(sortBy('last', 'createdAt'))

  return json({ contacts })
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)

  const contact = await prisma.contact.create({
    select: { id: true },
    data: { user: { connect: { id: userId } } },
  })

  return redirect(`/contacts/${contact.id}/edit`)
}

export default function Component() {
  const { contacts } = useLoaderData<typeof loader>()

  return (
    <>
      <main className="pl-96">
        <DetailLoadingOverlay>
          <div className="mx-auto max-w-3xl p-6">
            <Outlet />
          </div>
        </DetailLoadingOverlay>
      </main>
      <aside className="fixed inset-y-0 flex w-96 flex-col border-r">
        <div className="sticky top-0 z-40 flex w-full gap-4 border-b border-border bg-background/90 p-4 backdrop-blur-sm">
          <search role="search" className="flex-1">
            <Form>
              <SearchBar />
            </Form>
          </search>
          <Form method="post">
            <Button type="submit" aria-label="New contact">
              <PlusIcon className="mr-1.5 size-4" />
              New
            </Button>
          </Form>
        </div>
        <ScrollArea className="flex-1 p-4">
          {contacts.length ? (
            <ul className="grid gap-2">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={contact.id}
                    prefetch="intent"
                    className={({ isActive, isPending }) =>
                      cx(
                        'group flex items-center gap-2 rounded-md border p-2 text-sm transition-all',
                        isActive
                          ? 'bg-muted'
                          : isPending
                            ? 'bg-muted text-primary'
                            : contact.first || contact.last
                              ? ''
                              : 'text-muted-foreground',
                        !isActive && !isPending ? 'hover:bg-muted' : '',
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
                            'No Name'
                          )}
                        </span>
                        <Favorite contact={contact}>
                          <StarIcon
                            className={cx(
                              'size-4 flex-none',
                              isActive
                                ? ''
                                : 'text-muted-foreground group-hover:text-foreground',
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
            <p className="text-sm text-muted-foreground">No contacts</p>
          )}
        </ScrollArea>
      </aside>
    </>
  )
}

function DetailLoadingOverlay({ children }: { children?: ReactNode }) {
  const navigation = useNavigation()
  const loading = navigation.state === 'loading'
  const searchingContacts = useIsSearchingContacts()
  const showOverlay = useSpinDelay(loading && !searchingContacts)

  if (showOverlay) {
    return <div className="opacity-50 transition-opacity">{children}</div>
  }

  return children
}

function SearchBar() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q')

  const searching = useIsSearchingContacts()
  const showSpinner = useSpinDelay(searching)

  // Used to submit the form for every keystroke
  const submit = useSubmit()

  const inputRef = useRef<HTMLInputElement>(null)

  // Sync search input value with the URL Search Params
  useEffect(() => {
    const searchField = inputRef.current
    if (searchField) {
      searchField.value = q ?? ''
    }
  }, [q])

  // Focus input on key press
  const keyShortcut = '/'
  useHotkeys(
    keyShortcut,
    () => {
      const searchField = inputRef.current
      if (searchField) {
        searchField.focus()
        searchField.select()
      }
    },
    { preventDefault: true },
  )

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5"
        aria-hidden
      >
        {showSpinner ? (
          <ArrowPathIcon className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <Input
        ref={inputRef}
        type="search"
        name="q"
        id="q"
        defaultValue={q ?? undefined}
        onChange={(event) => {
          const isFirstSearch = q === null
          submit(event.currentTarget.form, {
            replace: !isFirstSearch,
          })
        }}
        className="pl-8 pr-10"
        placeholder="Search"
        aria-label="Search contacts"
        aria-keyshortcuts={keyShortcut}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 flex py-1.5 pr-1.5"
        aria-hidden
      >
        <kbd className="inline-flex items-center rounded border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
          {keyShortcut}
        </kbd>
      </div>
    </div>
  )
}

function useIsSearchingContacts() {
  const navigation = useNavigation()
  const contactsRoute = useResolvedPath('/contacts')
  const searching =
    navigation.location?.pathname === contactsRoute.pathname &&
    new URLSearchParams(navigation.location?.search).has('q')

  return searching
}

function Favorite({
  contact,
  children,
}: {
  contact: Pick<Contact, 'id' | 'favorite'>
  children: ReactNode
}) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` })
  const favorite = fetcher.formData
    ? fetcher.formData.get('favorite') === 'true'
    : Boolean(contact.favorite)

  if (!favorite) {
    return null
  }

  return children
}
