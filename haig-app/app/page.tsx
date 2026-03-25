import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-glass)] backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-8">
        <h1 className="text-4xl font-bold mb-4">High Agency Investment Group</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-6">Learn. Invest. Build.</p>
        <div className="flex gap-3">
          <Link href="/signup" className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 font-semibold hover:scale-[1.02] transition">Join Us</Link>
          <Link href="/login" className="rounded-lg border border-[var(--border)] px-4 py-2 hover:bg-[var(--bg-tertiary)] transition">Member Login</Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {[
          {title: 'Learn Together', body: 'Financial literacy, research, and attendance based rewards.'},
          {title: 'Invest Together', body: 'Pitch, vote, and execute trades as a general partnership.'},
          {title: 'Build Together', body: 'Track performance, portfolio, and progress over time.'}
        ].map((item) => (
          <article key={item.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-[var(--text-tertiary)]">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
        <h2 className="text-2xl mb-4">How It Works</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {['Sign Up', 'Attend Meetings', 'Pitch Ideas', 'Vote & Invest'].map(step => (
            <li key={step} className="rounded-lg bg-[var(--bg-tertiary)] p-4">{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
