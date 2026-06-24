import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || "";

function Login() {
  const { signInWithGoogleCredential } = useAuth();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  if (!googleClientId) {
    return <p className="app__authError">Set `VITE_GOOGLE_CLIENT_ID` in your environment to enable Google sign-in.</p>;
  }

  return (
    <div className="authButtonWrap">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const credential = credentialResponse.credential;
          if (!credential) {
            setLocalError("Google did not return an ID token.");
            return;
          }

          setBusy(true);
          setLocalError("");
          try {
            await signInWithGoogleCredential(credential);
          } catch (error) {
            setLocalError(error instanceof Error ? error.message : "Unable to sign in.");
          } finally {
            setBusy(false);
          }
        }}
        onError={() => setLocalError("Google sign-in failed.")}
        type="standard"
        size="large"
        shape="pill"
        theme="filled_black"
        text={busy ? "Signing in..." : "Sign in with Google"}
        width="100%"
        useOneTap={false}
      />
      {localError ? <p className="app__authError">{localError}</p> : null}
    </div>
  );
}

export default Login;
