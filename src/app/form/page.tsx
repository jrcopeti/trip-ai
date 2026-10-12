import Form from "@/components/form/Form";

/**
 * `/form`, in the sorbet system: one white surface on canvas. No footer — the
 * form is a task, not a page to browse.
 */
function FormPage() {
  return (
    <div
      className="min-h-[calc(100dvh-4rem)] bg-sorbet-canvas px-5 py-10 font-sorbet text-sorbet-ink antialiased sm:px-8 md:py-16"
    >
      <div className="mx-auto max-w-3xl">
        <Form />
      </div>
    </div>
  );
}

export default FormPage;
