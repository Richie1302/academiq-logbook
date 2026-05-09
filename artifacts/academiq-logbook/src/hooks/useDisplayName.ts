import { useAuth } from "@/lib/auth-context";
import { useGetProfile, getGetProfileQueryKey } from "@workspace/api-client-react";

export function useDisplayName(): string {
  const { user } = useAuth();
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey(), retry: false } });

  const profileFirst = profile?.fullName?.trim()?.split(" ")[0];
  if (profileFirst) return profileFirst;

  const email = user?.email;
  if (email) return email.split("@")[0];

  return "Student";
}
