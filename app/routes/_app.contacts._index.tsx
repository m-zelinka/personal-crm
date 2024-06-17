import { PlusIcon } from "@heroicons/react/20/solid";
import { CursorArrowRaysIcon } from "@heroicons/react/24/outline";
import { Form } from "@remix-run/react";
import { Empty } from "~/components/empty";

export default function Component() {
  return (
    <Empty
      icon={<CursorArrowRaysIcon />}
      title="No contact selected"
      description="Select a contact on the left, or create a new contact."
    >
      <Form method="post" action="/contacts">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 size-5" />
          New contact
        </button>
      </Form>
    </Empty>
  );
}
