import Link from "next/link"

export const Header = () => {
    return (
        <header className="sticky top-0 z-10 px-6 py-4 w-full flex items-center justify-between bg-slate-700">
            <Link href="/">Home</Link>
            <section className="flex gap-10 *:cursor-pointer *:hover:underline *:hover:underline-offset-4">
                <button>Dashboard</button>
                <Link href="todo-list">Tasks</Link>
                <button>Tracker</button>
                <button>Login</button>
            </section>
        </header>
    );
}
    