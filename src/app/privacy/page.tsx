import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-fg-faint">
        Draft policy for the Debates.ch prototype. In the current demo build,
        everything below is enforced in the strongest possible way: your data
        never leaves your device.
      </p>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-fg-muted">
        <section>
          <h2 className="font-bold text-fg">What we collect</h2>
          <p>
            Account details you provide (email, display name, country), your
            debate transcripts and notes, lesson and puzzle progress, and — only
            when you upload one — debate recordings. In demo mode all of this is
            stored in your browser&apos;s local storage only.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-fg">What we never do</h2>
          <p>
            We never sell personal data, never train AI models on your
            recordings without explicit opt-in, never profile you politically
            using sensitive traits, and never put personal data in analytics
            events.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-fg">Recording consent</h2>
          <p>
            Uploading a recording requires confirming everyone in it consents.
            A visible indicator accompanies any live capture. You choose
            retention and can delete any upload at any time.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-fg">Your controls</h2>
          <p>
            Settings lets you download all your data as JSON, control replay
            visibility, leave the matchmaking waitlist, and delete your account
            with everything attached to it.
          </p>
        </section>
      </div>
    </div>
  );
}
