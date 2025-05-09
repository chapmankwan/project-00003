import Link from "next/link";
import Image from "next/image";

import { todaysDate } from "@/app/constants";

export default function Home() {

	const footerCss = "flex items-center gap-2 hover:underline hover:underline-offset-4"

  return (
	<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-56px)] p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
		{todaysDate}
		<main className="flex flex-col row-start-2 items-center justify-center">
			<Image 
				src="/monorail-logo.png"
				alt="logo"
				width={200}
				height={200}
			/>
			{/* <Link
				className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
				href="#"
				rel="noopener noreferrer"
			>
				Get started
			</Link> */}
			<Link 
				href="#" 
				className="
					rounded-full 
					border border-solid border-transparent 
					transition-colors 
					flex items-center justify-center 
					bg-foreground hover:bg-[#383838] dark:hover:bg-[#ccc] 
					text-background text-sm h-12 px-5 
					sm:w-auto cursor-pointer
				"
			>
				login here
			</Link>
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
