import { ProfileEditor } from "@/components/member/profile-editor";
import { campusOptions } from "@/data";
import { currentMember } from "@/lib/auth";

export const metadata = {
  title: "编辑资料",
  description: "填写你的校区、专业和联系方式，出现在你好校园的成员墙上。",
};

export default async function SettingsPage() {
  const member = await currentMember();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <ProfileEditor member={member} campuses={campusOptions()} />
    </div>
  );
}
