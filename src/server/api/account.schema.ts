import { z } from 'zod';

export type GetUsernameParams = void;
export type GetUsernameResponse = {
  username: string;
}

export const UpdateUsernameParams = z.object({
  username: z.string(),
})
export type UpdateUsernameParams = z.infer<typeof UpdateUsernameParams>
export type UpdateUsernameResponse = void;

export const UpdateEmailParams = z.object({
  email: z.string(),
})
export type UpdateEmailParams = z.infer<typeof UpdateEmailParams>
export type UpdateEmailResponse = void;
