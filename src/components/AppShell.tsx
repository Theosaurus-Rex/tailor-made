import { Link, NavLink, Outlet } from "react-router";

const NAV_ITEMS = [
  { to: "/", label: "Generate", end: true },
  { to: "/daily", label: "Daily", end: false },
  { to: "/about", label: "About", end: false },
];

function Mark() {
  return (
    <span className="m-1 flex h-[30px] w-[42px] items-center justify-center rounded-[50%] border border-rose font-serif text-[17px] leading-none text-ink italic outline outline-1 outline-offset-[3px] outline-rose">
      TM
    </span>
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-[76px] items-center justify-between border-b border-line px-[18px] md:px-14">
        <Link
          to="/"

          className="flex items-center gap-3.5 text-ink hover:text-ink"
        >
          <Mark />
          <span
            data-testid="wordmark"
            className="hidden font-serif text-[28px] leading-none md:inline"
          >
            Tailor-Made
          </span>
          <span className="sr-only md:hidden">Tailor-Made</span>
        </Link>
        <nav aria-label="Main" className="flex gap-[18px] md:gap-9">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `label-caps border-b-[1.5px] pt-3 pb-2.5 text-xs ${
                  isActive
                    ? "border-rose font-semibold text-ink"
                    : "border-transparent font-medium text-subtle"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 px-[18px] py-8 md:px-14">
        <Outlet />
      </main>
      <footer className="border-t border-line px-[18px] py-6 text-sm leading-[1.6] text-subtle md:px-14">
        <p>
          Tailor-Made is an unofficial fan project. It is not made by, endorsed by or affiliated
          with the developers or publisher of Dressmaker.
        </p>
      </footer>
    </div>
  );
}
