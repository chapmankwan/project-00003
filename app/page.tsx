import Link from "next/link";
import Image from "next/image";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
	const session = await getServerSession(authOptions);

  	return (
		<div className="overflow-hidden flex flex-col justify-center items-center h-[calc(100dvh-56px)] p-2 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
								href="/account/signup" 
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
								sign up here
							</Link>
							<Link
								href="/account/login"
								className="
									mt-4
									text-xs
									transition-colors
									hover:underline
									text-mint-300
								"
							>
								or login in here
							</Link>
						</>
				}
			</main>

			<footer className="pt-4 px-4 flex gap-[24px] text-xs">
				&#169; ck 2025
			</footer>
		</div>
  );
}
