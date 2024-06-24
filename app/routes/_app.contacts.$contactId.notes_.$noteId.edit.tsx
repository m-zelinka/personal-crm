import { invariant, invariantResponse } from '@epic-web/invariant'
import { ChevronLeftIcon, TrashIcon } from '@heroicons/react/16/solid'
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { NoteEditor } from './resources.note-editor'

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.noteId, 'Missing noteId param')
  invariant(params.contactId, 'Missing contactId param')
  const note = await prisma.note.findUnique({
    select: { id: true, text: true, createdAt: true, updatedAt: true },
    where: { id: params.noteId, contactId: params.contactId },
  })
  invariantResponse(note, `No note with the id "${params.noteId}" exists.`, {
    status: 404,
  })

  return json({ contactId: params.contactId, note })
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

  if (formData.get('intent') === 'deleteNote') {
    invariant(params.noteId, 'Missing noteId param')
    const note = await prisma.note.findUnique({
      select: { id: true },
      where: { id: params.noteId, contactId: params.contactId },
    })
    invariantResponse(note, `No note with the id "${params.noteId}" exists`, {
      status: 404,
    })

    await prisma.note.delete({
      select: { id: true },
      where: { id: params.noteId, contactId: params.contactId },
    })

    return redirect(`/contacts/${params.contactId}/notes`)
  }

  invariantResponse(
    false,
    `Invalid intent: ${formData.get('intent') ?? 'Missing'}`,
  )
}

export function ErrorBoundary() {
  return (
    <div className="grid gap-3">
      <Breadcrumbs />
      <GeneralErrorBoundary />
    </div>
  )
}

export default function Component() {
  const { contactId, note } = useLoaderData<typeof loader>()

  return (
    <div className="grid gap-3">
      <Breadcrumbs />
      <section className="grid gap-3">
        <h3 className="font-semibold leading-none tracking-tight">Edit note</h3>
        <NoteEditor contactId={contactId} note={note} />
      </section>
      <Form
        method="POST"
        onSubmit={(event) => {
          const shouldDelete = confirm(
            'Please confirm you want to delete this record.',
          )

          if (!shouldDelete) {
            event.preventDefault()
          }
        }}
        className="mt-6"
      >
        <input type="hidden" name="intent" value="deleteNote" />
        <Button type="submit" variant="destructive" size="sm">
          <TrashIcon className="mr-1.5 size-4" />
          Delete this note…
        </Button>
      </Form>
    </div>
  )
}

function Breadcrumbs() {
  return (
    <Breadcrumb aria-label="Back">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="../.."
              relative="path"
              className="flex items-center gap-3"
            >
              <ChevronLeftIcon className="size-4" /> Go back
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
