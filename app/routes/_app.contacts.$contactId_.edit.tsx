import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { invariant, invariantResponse } from "@epic-web/invariant";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { z } from "zod";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { ErrorList } from "~/components/error-list";
import { prisma } from "~/utils/db.server";

const schema = z.object({
  first: z
    .string()
    .trim()
    .optional()
    .transform((arg) => arg || null),
  last: z
    .string()
    .trim()
    .optional()
    .transform((arg) => arg || null),
  avatar: z
    .string()
    .trim()
    .url("Avatar URL is invalid")
    .optional()
    .transform((arg) => arg || null),
});

export const meta: MetaFunction = () => {
  return [{ title: "Edit contact" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
    select: {
      first: true,
      last: true,
      avatar: true,
    },
    where: { id: params.contactId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  return json({ contact });
}

export async function action({ params, request }: ActionFunctionArgs) {
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

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }

  const updates = submission.value;
  await prisma.contact.update({
    select: { id: true },
    data: updates,
    where: { id: params.contactId },
  });

  return redirect(`/contacts/${params.contactId}`);
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    defaultValue: contact,
    constraint: getZodConstraint(schema),
    lastResult: actionData?.result,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema });
    },
  });

  const navigate = useNavigate();
  const cancelEdit = () => navigate(-1);

  return (
    <>
      <h1 className="sr-only">Edit Contact</h1>
      <Form method="post" {...getFormProps(form)}>
        <div className="space-y-6">
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
            <label
              htmlFor={fields.avatar.id}
              className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
            >
              Avatar URL
            </label>
            <div className="max-sm:mt-2 sm:col-span-2">
              <input
                className="block w-full rounded-md border-0 py-1.5 text-sm/6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 aria-[invalid]:text-red-900 aria-[invalid]:ring-red-300 aria-[invalid]:placeholder:text-red-300 aria-[invalid]:focus:ring-red-500"
                {...getInputProps(fields.avatar, { type: "url" })}
              />
            </div>
            <ErrorList
              id={fields.avatar.errorId}
              errors={fields.avatar.errors}
              className="mt-2"
            />
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
            <label
              htmlFor={fields.first.id}
              className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
            >
              First name
            </label>
            <div className="max-sm:mt-2 sm:col-span-2">
              <input
                className="block w-full rounded-md border-0 py-1.5 text-sm/6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 aria-[invalid]:text-red-900 aria-[invalid]:ring-red-300 aria-[invalid]:placeholder:text-red-300 aria-[invalid]:focus:ring-red-500 sm:max-w-xs"
                {...getInputProps(fields.first, { type: "text" })}
              />
            </div>
            <ErrorList
              id={fields.first.errorId}
              errors={fields.first.errors}
              className="mt-2"
            />
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
            <label
              htmlFor={fields.last.id}
              className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5"
            >
              Last name
            </label>
            <div className="max-sm:mt-2 sm:col-span-2">
              <input
                className="block w-full rounded-md border-0 py-1.5 text-sm/6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 aria-[invalid]:text-red-900 aria-[invalid]:ring-red-300 aria-[invalid]:placeholder:text-red-300 aria-[invalid]:focus:ring-red-500 sm:max-w-xs"
                {...getInputProps(fields.last, { type: "text" })}
              />
            </div>
            <ErrorList
              id={fields.last.errorId}
              errors={fields.last.errors}
              className="mt-2"
            />
          </div>
        </div>
        <div className="mt-6 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
          <div className="flex flex-row-reverse items-center justify-end gap-6 sm:col-span-2 sm:col-start-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm/6 font-semibold text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </Form>
    </>
  );
}
