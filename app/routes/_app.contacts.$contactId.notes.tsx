import { invariant } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { NoteEditor } from './resources.note-editor'

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, 'Missing contactId param')

  return json({ contactId: params.contactId })
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

export default function Component() {
  const { contactId } = useLoaderData<typeof loader>()

  return <NoteEditor contactId={contactId} />
}
