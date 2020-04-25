import React, { useState } from 'react';
import './log-in.css'
import {GoogleLogin} from 'react-google-login';
import axios from 'axios';

const Login = ({ setUser }) => {
    const [ name, setName] = useState("");
    const [ url, setUrl] = useState("");

    const responseGoogle = (response) => {
        setName(response.profileObj.name);
        setUrl(response.profileObj.imageUrl);
        axios.post('/api/users', response.profileObj)
            .then(id => axios.get(`/api/users/${id.data}`))
            .then((user) => {
                setUser(user.data);
            })
            .catch(err => console.error(err));
    }

    return (
    <div className="login" >
        <h1>Doodle Society</h1>
        <div className="log-form">
        <h2>Login to continue</h2>
        <h3>{ name }</h3>
        <img src={url} alt={name}/>
            <div>
            <GoogleLogin
                clientId="847322546124-r3jf05c1p89vlk3g6jbrbsv0632mh4go.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={responseGoogle}
                onFailure={() => console.log('failed to login')}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
                />       
            </div>
        </div>
    </div>
    )
};

export default Login
