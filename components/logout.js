import { GoogleLogin } from "@react-oauth/google";

const clientId = "908477634192-mv06384k41gang5gornra202b6d22nfh.apps.googleusercontent.com";

function Logout() {
    return (
        <div id="signOutButton">
            <GoogleLogout
                clientId={clientId}
                buttonText={"Logout"}
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}

export default Logout;