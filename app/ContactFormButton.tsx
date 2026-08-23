"use client";

import { FormEvent, useId, useState } from "react";

type ContactFormButtonProps = {
  className: string;
  defaultReason?: string;
  label?: string;
  subject: string;
};

const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "ddhutchinson@gmail.com";

export function ContactFormButton({
  className,
  defaultReason = "General question",
  label = "Contact",
  subject,
}: ContactFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const reasonId = useId();
  const messageId = useId();

  function close() {
    setIsOpen(false);
  }

  function submitContactRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Reason: ${reason}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    close();
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setIsOpen(true)}>
        {label}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-form-title"
        >
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-zinc-200 bg-white p-5 text-black shadow-aureate sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-600">
                  Contact
                </p>
                <h2
                  id="contact-form-title"
                  className="mt-2 text-3xl font-extrabold leading-tight text-black"
                >
                  Send a request
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-zinc-600 transition hover:border-red-600/40 hover:text-red-600"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitContactRequest} className="mt-6 grid gap-4">
              <label
                htmlFor={nameId}
                className="grid gap-2 text-sm font-semibold text-black"
              >
                Name
                <input
                  id={nameId}
                  name="name"
                  className="h-11 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-black outline-none placeholder:text-zinc-500 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20"
                  placeholder="Your name"
                  required
                />
              </label>

              <label
                htmlFor={emailId}
                className="grid gap-2 text-sm font-semibold text-black"
              >
                Email
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  className="h-11 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-black outline-none placeholder:text-zinc-500 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label
                htmlFor={reasonId}
                className="grid gap-2 text-sm font-semibold text-black"
              >
                Reason
                <select
                  id={reasonId}
                  name="reason"
                  className="h-11 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-black outline-none focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20"
                  defaultValue={defaultReason}
                >
                  <option>General question</option>
                  <option>Privacy request</option>
                  <option>Watch data correction</option>
                </select>
              </label>

              <label
                htmlFor={messageId}
                className="grid gap-2 text-sm font-semibold text-black"
              >
                Message
                <textarea
                  id={messageId}
                  name="message"
                  rows={5}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-black outline-none placeholder:text-zinc-500 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/20"
                  placeholder="Tell us what you need help with, such as a watch data correction, comparison question, or privacy request."
                  required
                />
              </label>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-zinc-200 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-zinc-600 transition hover:border-red-600/40 hover:text-red-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-red-600 bg-red-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
