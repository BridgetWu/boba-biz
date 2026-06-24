import { useState } from "react";
import { useAuth } from "./AuthProvider";

function Logout() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  return (
    <div className="authButtonWrap">
      <button
        type="button"
        className="app__btn app__btn--logout"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setLocalError("");
          try {
            await signOut();
          } catch (error) {
            setLocalError(error instanceof Error ? error.message : "Unable to sign out.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Signing out..." : "Logout"}
      </button>
      {localError ? <p className="app__authError">{localError}</p> : null}
    </div>
  );
}

export default Logout;
