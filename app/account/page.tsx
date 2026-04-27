import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAccountProfile } from "@/lib/services/account.service";
 
import Profile from "./components/profile";
import Email from "./components/email";
import Password from "./components/password";
 
export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/account/login");
 
  const profile = await getAccountProfile(session.user.id);
  if (!profile) redirect("/account/login");
 
  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-medium text-mono-900 dark:text-mono-100">
          Account
        </h1>
        <p className="text-sm text-mono-500 dark:text-mono-400 mt-1">
          Manage your profile and security settings.
        </p>
      </div>
 
      <div className="flex flex-col gap-8 divide-y divide-mono-100 dark:divide-mono-800">
        <Profile
          displayName={profile.displayName}
          username={profile.username}
        />
 
        <div className="pt-4">
          <Email currentEmail={profile.email} />
        </div>
 
        <div className="pt-4">
          <Password />
        </div>
      </div>
    </div>
  );
}
