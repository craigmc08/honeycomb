import { z } from 'zod';

export type GetNameParams = void;
export type GetNameResponse = {
  name: string;
}

export const UpdateNameParams = z.object({
  name: z.string(),
})
export type UpdateNameParams = z.infer<typeof UpdateNameParams>
export type UpdateNameResponse = void;
