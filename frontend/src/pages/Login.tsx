import React, { useState } from "react"
import { Heading } from "../components/Heading"
import InputBox from "../components/InputBox";
import { BottomWarning } from "../components/Warning";
import { Button } from "../components/Button";
export const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch('http://localhost:3000/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    
        const data = await response.json();
        if (data.token) {
            const token_expiration = Date.now() + 5 * 60 * 1000;
            localStorage.setItem("token", data.token);
            localStorage.setItem('token_expiration', token_expiration.toString());
            localStorage.setItem('timeLeft', '300');
            localStorage.setItem('timestamp', Date.now().toString());
            window.location = "/seatlayout";
        } else {
            alert("invalid credentials");
        }
    }
    return <div>
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Heading label={"Sign in to your account"} />
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                
                    <InputBox label={"Email address"} id={"email"} type={"email"} value={username} onChange={handleUsernameChange} />

                    <div>
                        <InputBox label={"Password"} id={"password"} type={"password"} value={password} onChange={handlePasswordChange} />
                    </div>

                    <div className="py-2">
                           <Button onClick={handleSubmit} label={"Login"}></Button>
                    </div>
            </div>
            <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/register"} />
            <div>
            <BottomWarning label={"Forgot your account?"} buttonText={"Reset Password"} to={"/resetpassword"} />
            </div>
        </div>
    </div>
}