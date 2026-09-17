import { ProfileEditor } from "@/components/member/profile-editor";
import { campusOptions } from "@/data";
import { copy } from "@/lib/copy";
import { t } from "@/lib/locale";
import { currentMember } from "@/lib/auth";
import { readLocale } from "@/lib/read-locale";

export async function generateMetadata() {
  const locale = await readLocale();
  return {
    title: t(copy.settingsTitle, locale),
    description: t(copy.editProfile, locale),
  };
}

export default async function SettingsPage() {
  const member = await currentMember();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <ProfileEditor member={member} campuses={campusOptions()} />
    </div>
  );
}
