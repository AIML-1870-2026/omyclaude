import Link from "next/link";

const events = [
  { date: '2026-03-28', title: 'Founding Meeting', type: 'founding', location: 'UNO - Peter Kiewit Institute' },
  { date: '2026-04-01', title: 'Fiscal Year Begins', type: 'deadline', location: 'Virtual' },
  { date: '2026-04-05', title: 'Kickoff Meeting: Club Vision & Bylaws Review', type: 'meeting', location: 'UNO - CEC' },
  { date: '2026-04-19', title: 'Workshop: Brokerage Accounts 101', type: 'workshop', location: 'UNO - Peter Kiewit Institute' },
  { date: '2026-05-03', title: 'Meeting: Index Funds & ETFs Deep Dive', type: 'meeting', location: 'UNO - CEC' },
  { date: '2026-05-17', title: 'Speaker: Local Financial Advisor or CFA', type: 'speaker', location: 'UNO - College of Business' },
  { date: '2026-05-31', title: 'Deadline: Initial Capital Contributions Due', type: 'deadline', location: 'Virtual' }
];

export default function CalendarPage() {
  return (
    <main className="container">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <p className="text-[var(--text-secondary)] mb-4">All events are seeded and can be fetched from `/api/events` once Supabase is connected.</p>
      <div className="space-y-3 mb-4">
        {events.map((eventItem) => (
          <article key={eventItem.date} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
            <div className="flex justify-between gap-4">
              <h3 className="font-semibold">{eventItem.title}</h3>
              <span className="text-sm text-[var(--text-tertiary)]">{eventItem.date}</span>
            </div>
            <p className="text-[var(--text-tertiary)]">{eventItem.type.toUpperCase()} • {eventItem.location}</p>
          </article>
        ))}
      </div>
      <Link href="/dashboard" className="text-[var(--accent-primary)] underline">Back to dashboard</Link>
    </main>
  );
}
