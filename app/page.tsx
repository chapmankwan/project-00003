import Link from "next/link";

export default function Home() {

	const footerCss = "flex items-center gap-2 hover:underline hover:underline-offset-4"

  return (
	<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
		<main className="flex flex-col row-start-2 items-center justify-center gap-6">
			<Link
				className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
				href="/pages/todo-list"
				rel="noopener noreferrer"
			>
				Get started
			</Link>
			<a className="hover:underline hover:underline-offset-4">login here</a>
		</main>

		<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
			<a className={footerCss} href="#">footer1</a>
			<a className={footerCss} href="#">footer2</a>
			<a className={footerCss} href="#">footer3</a>
			<a className={footerCss} href="#">footer4</a>
		</footer>
	</div>
  );
}
