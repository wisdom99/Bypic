import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-charcoal-100 bg-cream-100/60">
      <div className="container-page py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-2xl font-semibold text-charcoal-900">
              Threadline
            </p>
            <p className="mt-2 text-sm text-charcoal-400">
              Source African fabric in 24 hours, not 24 days. Built for the
              creative professionals shaping Africa&apos;s style economy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm md:grid-cols-3">
            <div>
              <p className="label">Designers</p>
              <ul className="space-y-2 text-charcoal-700">
                <li>
                  <Link href="/marketplace" className="hover:text-indigo-700">
                    Browse fabrics
                  </Link>
                </li>
                <li>
                  <Link href="/match" className="hover:text-indigo-700">
                    Match by mood
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="label">Producers</p>
              <ul className="space-y-2 text-charcoal-700">
                <li>
                  <Link href="/about" className="hover:text-indigo-700">
                    Become a supplier
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-indigo-700">
                    Verification
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="label">Hubs</p>
              <ul className="space-y-2 text-charcoal-700">
                <li>Lagos · Aba</li>
                <li>Kano · Onitsha</li>
                <li>Abeokuta · Ibadan</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-charcoal-100 pt-6 text-xs text-charcoal-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Threadline. A hackathon prototype.</p>
          <p>Built in Lagos with Cursor AI.</p>
        </div>
      </div>
    </footer>
  );
}
