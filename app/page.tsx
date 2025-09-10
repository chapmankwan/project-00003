import Link from "next/link";
import Image from "next/image";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
	const session = await getServerSession(authOptions);

  	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-56px)] p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col row-start-2 items-center justify-center">
				<Image 
					src="/monorail-logo.png"
					alt="logo"
					width={200}
					height={200}
				/>
				{
					session ?
						<Link
							href="/workspaces"
							className="
								rounded-full 
								border border-solid border-transparent 
								flex items-center justify-center
								transition-transform duration-300 ease-in-out active:scale-95 
								bg-foreground
								text-background text-sm h-12 px-5
							"
						>
							To workspaces
						</Link>
						:
						<>
							<Link 
								href="/account/login" 
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
							<Link
								href="/account/signup"
								className="
									mt-2
									text-xs
									transition-colors
									hover:underline
									text-mint-300
								"
							>
								or sign in here
							</Link>
						</>
				}
			</main>

			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-xs">
				&#169; ck 2025
			</footer>
		</div>
  );
}
