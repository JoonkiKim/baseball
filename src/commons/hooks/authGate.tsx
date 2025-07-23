import { useRecoilValue } from "recoil";
import { authCheckedState } from "../stores";

function AuthGate({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const checked = useRecoilValue(authCheckedState);
  if (!checked) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
export default AuthGate;
