import { invariant, invariantResponse } from "@epic-web/invariant";
import { PencilIcon } from "@heroicons/react/16/solid";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import { Empty } from "~/components/empty";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  invariant(params.contactId, "Missing contactId param");
  const contact = await prisma.contact.findUnique({
    select: {
      email: true,
      phone: true,
      linkedin: true,
      twitter: true,
      website: true,
      location: true,
      company: true,
      birthday: true,
      bio: true,
    },
    where: { id: params.contactId, userId },
  });
  invariantResponse(
    contact,
    `No contact with the id "${params.contactId}" exists.`,
    { status: 404 },
  );

  return json({ contact });
}

export default function Component() {
  const { contact } = useLoaderData<typeof loader>();

  const fields = [
    { label: "Email address", value: contact.email },
    { label: "Phone number", value: contact.phone },
    {
      label: "LinkedIn",
      value: contact.linkedin
        ? `https://www.linkedin.com/in/${contact.linkedin}`
        : null,
    },
    {
      label: "Twitter",
      value: contact.twitter ? `https://twitter.com/${contact.twitter}` : null,
    },
    { label: "Website", value: contact.website },
    { label: "Location", value: contact.location },
    { label: "Company", value: contact.company },
    {
      label: "Birthday",
      value: contact.birthday ? format(contact.birthday, "PP") : null,
    },
    { label: "Bio", value: contact.bio },
  ];
  const fieldsToShow = fields.filter((field) => field.value);

  if (!fieldsToShow.length) {
    return (
      <Empty
        title="No details"
        description="You haven’t added any details yet."
      >
        <Form action="edit">
          <Button type="submit" variant="secondary">
            <PencilIcon className="mr-1.5 size-4" />
            Edit contact details
          </Button>
        </Form>
      </Empty>
    );
  }

  return (
    <div className="flow-root">
      <dl className="-my-4 divide-y">
        {fieldsToShow.map((field) => (
          <div key={field.label} className="grid grid-cols-3 gap-4 py-4">
            <dt className="text-sm text-muted-foreground">{field.label}</dt>
            <dd className="col-span-2 text-sm">{field.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
