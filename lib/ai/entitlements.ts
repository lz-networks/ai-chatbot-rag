import type { UserType } from "@/app/(auth)/auth";

type Entitlements = {
  maxMessagesPerDay: number;
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 50,
  },

  /*
   * For admin users who can manage the knowledge base
   */
  admin: {
    maxMessagesPerDay: 100,
  },
};
