import { useState } from "react"
import { Heading } from "../components/Heading"
import InputBox from "../components/InputBox"
import { Button } from "../components/Button";

export const ResetPassword = () => {

    const [EmailSent, SetEmailSent] = useState<string>(" ");

    return <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Heading label={"Reset your account"} />
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <InputBox label={"Email address"} id={"email"} type={"email"} value={EmailSent} onChange={(e) => {
                SetEmailSent(e.target.value);
            }} />

            <div className="py-2">
                <Button onClick={async () => {

                }} type={"submit"} label={"Submit"} />
            </div>
        </div>
    </div>
}