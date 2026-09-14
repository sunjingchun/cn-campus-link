import type { Room } from "@/lib/domain";

/**
 * The board, the chat room, and the people who are actually there. One seam
 * between the discovery pages and everything members create.
 */
export async function CampusSocial({ room }: { room: Room }) {
  return (
    <section id="community" className="text-sm text-muted-foreground">
      正在加载 {room.kind === "city" ? room.city : room.campus} 的社区内容。
    </section>
  );
}
