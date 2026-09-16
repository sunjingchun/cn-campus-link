import { z } from "zod";
import { roomExists } from "@/data";
import { currentMember } from "@/lib/auth";
import {
  DEGREE_LEVELS,
  MEMBER_STATUSES,
  parseRoom,
  POST_CATEGORIES,
  roomId,
  type RoomId,
} from "@/lib/domain";
import type { Member } from "@/lib/store";

/**
 * The one place untrusted input becomes typed domain data. Route handlers stay
 * mechanical: parse, check the session, call the store.
 */

const username = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "用户名至少 3 个字符")
  .max(20, "用户名最多 20 个字符")
  .regex(/^[a-z0-9_]+$/, "用户名只能用小写字母、数字和下划线");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable();

/** An empty campus selection means "still deciding", not a broken record. */
const campusField = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable();

export const registerSchema = z.object({
  username,
  email: z.string().trim().toLowerCase().email("邮箱格式不对"),
  password: z.string().min(8, "密码至少 8 位"),
  displayName: z.string().trim().min(1, "填个名字吧").max(40),
  country: z.string().trim().length(2, "选择你的国家"),
  campus: campusField,
  status: z.enum(MEMBER_STATUSES),
});

export const loginSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, "填邮箱或用户名"),
  password: z.string().min(1, "填密码"),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(40),
  country: z.string().trim().length(2),
  campus: campusField,
  status: z.enum(MEMBER_STATUSES),
  arrivalYear: z.coerce.number().int().min(2000).max(2100).nullable(),
  program: z.string().trim().max(80),
  level: z.enum(DEGREE_LEVELS).nullable(),
  languages: z.array(z.string().trim().min(1).max(24)).max(8),
  interests: z.array(z.string().trim().min(1).max(24)).max(10),
  bio: z.string().trim().max(600),
  links: z.object({
    wechat: optionalText(40),
    instagram: optionalText(40),
    email: optionalText(80),
  }),
});

export const postSchema = z.object({
  room: z.string().min(3),
  category: z.enum(POST_CATEGORIES),
  title: z.string().trim().min(2, "标题太短").max(90),
  body: z.string().trim().min(2, "说点什么").max(4000),
});

export const replySchema = z.object({
  body: z.string().trim().min(1, "说点什么").max(2000),
});

/** Turns an untrusted room string into one that names content that exists. */
export function knownRoom(raw: string): RoomId | null {
  const room = parseRoom(raw);
  if (!room || !roomExists(room)) return null;
  return roomId(room);
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export function fail(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "输入有问题";
}

type Guarded = { member: Member } | { response: Response };

/** Every write endpoint starts here. Signed-out callers get a 401 the dialog understands. */
export async function requireMember(): Promise<Guarded> {
  const member = await currentMember();
  if (!member) return { response: fail("请先登录", 401) };
  return { member };
}
