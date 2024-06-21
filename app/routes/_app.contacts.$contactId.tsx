import { invariant, invariantResponse } from '@epic-web/invariant'
import { PencilIcon, StarIcon, TrashIcon } from '@heroicons/react/16/solid'
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
  type NavLinkProps,
} from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Toggle } from '~/components/ui/toggle'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { cx } from '~/utils/misc'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.contact
        ? data.contact.first || data.contact.last
          ? `${data.contact.first} ${data.contact.last}`
          : 'No Name'
        : 'No contact found',
    },
  ]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)

  invariant(params.contactId, 'Missing contactId param')
  const contact = await prisma.contact.findUnique({
    select: { id: true, first: true, last: true, avatar: true, favorite: true },
    where: { id: params.contactId, userId },
  })
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  )

  return json({ contact })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request)

  invariant(params.contactId, 'Missing contactId param')
  const contact = await prisma.contact.findUnique({
    select: { id: true },
    where: { id: params.contactId, userId },
  })
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  )

  const formData = await request.formData()

  if (formData.get('intent') === 'favorite') {
    const favorite = formData.get('favorite')

    await prisma.contact.update({
      select: { id: true },
      data: { favorite: favorite === 'true' },
      where: { id: params.contactId, userId },
    })

    return json({ ok: true })
  }

  if (formData.get('intent') === 'delete') {
    await prisma.contact.delete({
      select: { id: true },
      where: { id: contact.id, userId },
    })

    return redirect('/contacts')
  }

  invariantResponse(
    false,
    `Invalid intent: ${formData.get('intent') ?? 'Missing'}`,
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>()

  return (
    <>
      <div className="flex items-end">
        <div className="flex flex-none">
          <Avatar key={contact.avatar} className="size-32">
            <AvatarImage src={contact.avatar ?? undefined} alt="" />
            <AvatarFallback>
              <span className="bg-muted" aria-hidden>
                <svg
                  className="h-full w-full text-muted-foreground"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="ml-5 flex w-full min-w-0 items-baseline gap-3 pb-1">
          <h1
            className={cx(
              'text-2xl font-semibold leading-none tracking-tight',
              contact.first || contact.last ? '' : 'text-muted-foreground',
            )}
          >
            {contact.first || contact.last ? (
              <>
                {contact.first} {contact.last}
              </>
            ) : (
              'No Name'
            )}
          </h1>
          <Favorite contact={contact} />
        </div>
        <div className="ml-6 flex gap-4 pb-1">
          <Form action="edit">
            <Button type="submit" variant="outline">
              <PencilIcon className="mr-1.5 size-4" />
              Edit
            </Button>
          </Form>
          <Form
            method="post"
            onSubmit={(event) => {
              const shouldDelete = confirm(
                'Please confirm you want to delete this record.',
              )

              if (!shouldDelete) {
                event.preventDefault()
              }
            }}
          >
            <input type="hidden" name="intent" value="delete" />
            <Button type="submit" variant="outline">
              <TrashIcon className="mr-1.5 size-4" />
              Delete
            </Button>
          </Form>
        </div>
      </div>
      <div className="mt-8">
        <TabNav />
      </div>
      <div className="mt-4">
        <Outlet />
      </div>
    </>
  )
}

function Favorite({ contact }: { contact: Pick<Contact, 'id' | 'favorite'> }) {
  const fetcher = useFetcher({ key: `contact:${contact.id}` })
  const favorite = fetcher.formData
    ? fetcher.formData.get('favorite') === 'true'
    : contact.favorite

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="intent" value="favorite" />
      <input
        type="hidden"
        name="favorite"
        value={favorite ? 'false' : 'true'}
      />
      <Toggle
        type="submit"
        aria-label={
          contact.favorite ? 'Remove from favorites' : 'Add to favorites'
        }
      >
        <StarIcon className="size-4" />
      </Toggle>
    </fetcher.Form>
  )
}

function TabNav() {
  const tabs: Array<{ name: string; to: NavLinkProps['to'] }> = [
    { name: 'Profile', to: '.' },
    { name: 'Notes', to: 'notes' },
  ]

  return (
    <nav
      className="flex h-9 w-full items-center border-b text-muted-foreground"
      aria-label="Tabs"
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.to}
          end
          prefetch="intent"
          preventScrollReset
          className={({ isActive }) =>
            cx(
              'inline-flex h-9 items-center justify-center whitespace-nowrap border-b-2 px-4 pb-3 pt-2 text-sm font-semibold text-muted-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              isActive
                ? 'border-b-primary text-foreground'
                : 'border-b-transparent',
            )
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </nav>
  )
}
