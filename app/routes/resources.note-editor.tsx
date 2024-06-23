import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import type { Contact } from '@prisma/client'
import { json, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useSubmit } from '@remix-run/react'
import { useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { z } from 'zod'
import { Description, ErrorList } from '~/components/forms'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

const schema = z.object({
  contactId: z
    .string({ required_error: 'Contact ID is required' })
    .trim()
    .uuid('Contact ID is invalid'),
  text: z
    .string({ required_error: 'Note is required' })
    .trim()
    .min(1, 'Note is too short')
    .max(255, 'Note is too long'),
})

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  const submission = await parseWithZod(formData, {
    schema: schema.superRefine(async (arg, ctx) => {
      const existingContact = await prisma.contact.findUnique({
        select: { id: true },
        where: { id: arg.contactId, userId },
      })

      if (!existingContact) {
        ctx.addIssue({
          path: ['contactId'],
          code: z.ZodIssueCode.custom,
          message: 'No contact exists with this ID',
        })
      }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { contactId, text } = submission.value

  if (formData.get('intent') === 'createNote') {
    await prisma.note.create({
      select: { id: true },
      data: { text, contact: { connect: { id: contactId } } },
    })

    return json({ result: submission.reply() })
  }

  invariantResponse(
    false,
    `Invalid intent: ${formData.get('intent') ?? 'Missing'}`,
  )
}

export function NoteEditor({ contactId }: { contactId: Contact['id'] }) {
  const actionData = useActionData<typeof action>()

  // Used to optimistically submit the form
  const submit = useSubmit()

  const [form, fields] = useForm({
    defaultValue: { contactId },
    constraint: getZodConstraint(schema),
    lastResult: actionData?.result,
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    onSubmit: (event, context) => {
      event.preventDefault()

      const submission = parseWithZod(context.formData, { schema })

      if (submission.status !== 'success') {
        return
      }

      const { contactId, text } = submission.value
      submit(
        {
          intent: 'createNote',
          contactId,
          text,
          id: window.crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          method: context.method,
          action: context.action,
          navigate: false,
          unstable_flushSync: true,
        },
      )

      resetFormValues()
    },
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resetFormValues = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.value = ''
      textarea.focus()
    }
  }

  // Focus input on key press
  const keyShortcut = 'r'
  useHotkeys(
    keyShortcut,
    () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.focus()
        textarea.select()
      }
    },
    { preventDefault: true },
  )

  return (
    <Form method="post" action="/resources/note-editor" {...getFormProps(form)}>
      <input type="hidden" name="intent" value="createNote" />
      <input {...getInputProps(fields.contactId, { type: 'hidden' })} />
      <div className="grid gap-1">
        <div className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
          <Label id={fields.text.id} className="sr-only">
            Note
          </Label>
          <Textarea
            ref={textareaRef}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                // Submit form on enter
                event.preventDefault()
                event.currentTarget.form?.dispatchEvent(
                  new Event('submit', { bubbles: true, cancelable: true }),
                )
              }
            }}
            className="min-h-12 resize-none scroll-py-3 border-0 p-3 shadow-none focus-visible:ring-0"
            placeholder="Add a note…"
            aria-keyshortcuts={keyShortcut}
            {...getTextareaProps(fields.text, {
              ariaDescribedBy: `${fields.text.id}-description`,
            })}
          />
          <div className="flex items-center p-3 pt-0">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="ml-auto"
            >
              Save
            </Button>
          </div>
        </div>
        <Description id={`${fields.text.id}-description`}>
          Press (r) to focus.
        </Description>
        <ErrorList id={fields.text.errorId} errors={fields.text.errors} />
        <ErrorList id={form.errorId} errors={form.errors} />
      </div>
    </Form>
  )
}
