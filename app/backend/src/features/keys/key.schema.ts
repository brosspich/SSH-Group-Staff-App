import { z } from "zod";

export const uploadKeySchema = z.object({
  name: z.string().min(2, "Key name must be at least 2 characters"),
  publicKey: z.string().refine((val) => {
    const valid = ["ssh-rsa", "ssh-ed25519", "ecdsa-sha2"];
    return valid.some((prefix) => val.trim().startsWith(prefix));
  }, "Invalid SSH Public Key format. Must start with ssh-rsa, ssh-ed25519, or ecdsa-sha2"),
  keyType: z.enum(["ED25519", "RSA", "ECDSA"]).default("ED25519"),
  expiresInDays: z.number().int().positive().optional(),
});

export type UploadKeyInput = z.infer<typeof uploadKeySchema>;
