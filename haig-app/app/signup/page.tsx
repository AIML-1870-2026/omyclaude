import Link from "next/link";

export default function Signup() {
  return (
    <main className="container">
      <h1 className="text-3xl font-bold mb-4">Sign Up</h1>
      <p className="mb-6 text-[var(--text-secondary)]">(placeholder UI — connect Supabase Auth in next step)</p>
      <form className="grid gap-3 max-w-md">
        <input type="text" placeholder="Full Name" className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3" />
        <input type="email" placeholder="Email" className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3" />
        <input type="password" placeholder="Password" className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3" />
        <button type="submit" className="rounded-lg bg-[var(--accent-primary)] px-4 py-2 font-semibold">Create Account</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link href="/login" className="text-[var(--accent-primary)]">Login</Link></p>
    </main>
  );
}
