import Login from "./login.js";
import Logout from "./logout.js";
import { useAuth } from "./AuthProvider";

type HeaderProps = {
};

export function Header(_: HeaderProps) {
  const { user, loading, error } = useAuth();
  const profileName = user?.user_metadata?.name || user?.email || "Owner";
  const avatar = user?.user_metadata?.picture;
  const isLoggedIn = Boolean(user);

  return (
    <header className="app__bar app__bar--sticky">
      <div className="app__barInner">
        <div className="app__brand">
          <div className="app__brandMark" aria-hidden="true" />
          <div className="app__productText">
            <div className="app__productName">BobaBiz</div>
            <div className="app__productSub">AI-assisted storefront builder for tea shops</div>
          </div>
        </div>

        <div className="app__barActions">
          {loading ? <span className="app__welcomeBadge">Checking session...</span> : null}
          {error ? <span className="app__welcomeBadge app__welcomeBadge--error">{error}</span> : null}
          {isLoggedIn ? (
            <>
              <span className="app__welcomeBadge">
                {avatar ? <img className="app__avatar" src={avatar} alt="" /> : null}
                <span>Welcome, {profileName}</span>
              </span>
              <Logout />
            </>
          ) : (
            <Login />
          )}
        </div>
      </div>
    </header>
  );
}
