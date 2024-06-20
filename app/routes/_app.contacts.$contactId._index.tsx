import { PencilIcon } from "@heroicons/react/16/solid";
import { Form } from "@remix-run/react";
import { format } from "date-fns";
import { Empty } from "~/components/empty";
import { Button } from "~/components/ui/button";

const data = {
  // contact: {
  //   email: "mzelinka@gmail.com",
  //   phone: null,
  //   linkedin: "m-zelinka",
  //   twitter: "m_zelinka",
  //   website: "marekzelinka.dev",
  //   location: "Presov, Slovakia, EU",
  //   company: "Vercel",
  //   birthday: null,
  //   bio: "Web Developer",
  // },
  contact: {
    email: null,
    phone: null,
    linkedin: null,
    twitter: null,
    website: null,
    location: null,
    company: null,
    birthday: null,
    bio: null,
  },
};

export default function Component() {
  const { contact } = data;
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
      <div className="py-10">
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
      </div>
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
