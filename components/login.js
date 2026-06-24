import { GoogleLogin } from "@react-oauth/google";

const clientId = "908477634192-mv06384k41gang5gornra202b6d22nfh.apps.googleusercontent.com"

function Login() {
    return (
        <div id="signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
                />
        </div>
    )
}

export default Login;