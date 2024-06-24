import { invariant, invariantResponse } from '@epic-web/invariant'
import { CloudIcon, PencilIcon, TrashIcon } from '@heroicons/react/16/solid'
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type SerializeFrom,
} from '@remix-run/node'
import { Form, useFetcher, useFetchers, useLoaderData } from '@remix-run/react'
import { compareDesc, format, isEqual, isThisYear } from 'date-fns'
import { useSpinDelay } from 'spin-delay'
import { Empty } from '~/components/empty'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Button } from '~/components/ui/button'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { NoteEditor } from './resources.note-editor'

type LoaderData = SerializeFrom<typeof loader>
export type Note = LoaderData['notes'][number]

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param')
  const notes = await prisma.note.findMany({
    select: { id: true, text: true, createdAt: true, updatedAt: true },
    where: { contactId: params.contactId },
  })

  return json({ contactId: params.contactId, notes })
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
    const noteId = formData.get('noteId')
    invariantResponse(
      typeof noteId === 'string',
      `Invalid noteId: ${noteId ?? 'Missing'}`,
      { status: 400 },
    )

    const note = await prisma.note.findUnique({
      select: { id: true },
      where: { id: noteId, contactId: params.contactId },
    })
    invariantResponse(note, `No note with the id "${noteId}" exists`, {
      status: 404,
    })

    await prisma.note.delete({
      select: { id: true },
      where: { id: note.id, contactId: params.contactId },
    })

    return json({ ok: true })
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
  const { contactId, notes } = useLoaderData<typeof loader>()

  return (
    <>
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold leading-none tracking-tight">
            New note
          </h3>
          <NoteSavingIndicator />
        </div>
        <NoteEditor contactId={contactId} />
      </section>
      <section className="mt-8">
        <h3 className="sr-only">Recent notes</h3>
        {notes.length ? (
          <NoteList notes={notes} />
        ) : (
          <Empty
            title="No notes"
            description="You haven’t saved any notes yet."
          />
        )}
      </section>
    </>
  )
}

function NoteSavingIndicator() {
  const pendingEntries = usePendingNotes()
  const showSavingIndicator = useSpinDelay(pendingEntries.length > 0)

  if (!showSavingIndicator) {
    return null
  }

  return <CloudIcon className="size-4 animate-pulse text-gray-400" />
}

function usePendingNotes() {
  type CreateNoteFetcher = ReturnType<typeof useFetchers>[number] & {
    formData: FormData
  }

  return useFetchers()
    .filter(
      (fetcher): fetcher is CreateNoteFetcher =>
        fetcher.formData?.get('intent') === 'createNote',
    )
    .map((fetcher) => {
      const id = String(fetcher.formData.get('id'))
      const text = String(fetcher.formData.get('text'))
      const createdAt = String(fetcher.formData.get('createdAt'))
      const updatedAt = String(fetcher.formData.get('updatedAt'))
      const note: Note = { id, text, createdAt, updatedAt }

      return note
    })
}

function NoteList({ notes }: { notes: Array<Note> }) {
  const notesById = new Map(notes.map((note) => [note.id, note]))

  // Merge pending and existing notes
  const pendingNotes = usePendingNotes()
  for (const pendingNote of pendingNotes) {
    const note = notesById.get(pendingNote.id)
    const merged = note ? { ...note, ...pendingNote } : pendingNote
    notesById.set(pendingNote.id, merged)
  }

  const notesToShow = [...notesById.values()].sort((a, b) =>
    compareDesc(a.createdAt, b.createdAt),
  )

  return (
    <ul className="grid gap-6">
      {notesToShow.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  )
}

function NoteItem({ note }: { note: Note }) {
  const deleteFetcher = useFetcher()
  const deleting = deleteFetcher.state !== 'idle'

  const createdLabel = format(
    note.createdAt,
    isThisYear(note.createdAt) ? 'MMM dd' : 'PP',
  )
  const updatedLabel = format(
    note.updatedAt,
    isThisYear(note.updatedAt) ? 'MMM dd, p' : 'PP, p',
  )
  const updatedAfterCreated = !isEqual(note.createdAt, note.updatedAt)

  return deleting ? null : (
    <li className="group relative flex gap-4">
      <div
        className="absolute -bottom-6 left-0 top-0 flex w-6 justify-center group-last-of-type:h-0"
        aria-hidden
      >
        <div className="w-px bg-border" />
      </div>
      <div
        className="relative flex size-6 flex-none items-center justify-center bg-background"
        aria-hidden
      >
        <div className="size-1.5 rounded-full border border-muted-foreground" />
      </div>
      <div className="grid flex-auto gap-1 py-0.5">
        <div className="flex items-center gap-2 text-[0.8rem] text-muted-foreground">
          <p className="whitespace-nowrap">
            Added on <time dateTime={note.createdAt}>{createdLabel}</time>
          </p>
          {updatedAfterCreated ? (
            <>
              <svg
                viewBox="0 0 2 2"
                className="size-0.5 fill-current"
                aria-hidden
              >
                <circle cx={1} cy={1} r={1} />
              </svg>
              <p className="truncate">
                Updated on <time dateTime={note.updatedAt}>{updatedLabel}</time>
              </p>
            </>
          ) : null}
        </div>
        <div className="group overflow-hidden rounded-lg border bg-muted/40 focus-within:bg-white hover:bg-white">
          <div className="min-h-12 p-3">
            <p className="text-sm text-foreground">{note.text}</p>
          </div>
          <div className="flex items-center justify-end p-3 pt-0 opacity-0 focus-within:opacity-100 group-hover:opacity-100">
            <Form action={`${note.id}/edit`}>
              <Button variant="ghost" size="icon">
                <PencilIcon className="size-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </Form>
            <deleteFetcher.Form method="POST">
              <input type="hidden" name="intent" value="deleteNote" />
              <input type="hidden" name="noteId" value={note.id} />
              <Button type="submit" variant="ghost" size="icon">
                <TrashIcon className="size-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </deleteFetcher.Form>
          </div>
        </div>
      </div>
    </li>
  )
}
