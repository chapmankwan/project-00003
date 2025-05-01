"use client";

import Form from "next/form";

export default function LoginPage () {

    return (
        <section className="flex flex-col items-center min-h-[calc(100vh-56px)]">
            <h3 className="w-full text-2xl p-7 cursor-default select-none">Login!</h3>

            <Form action="/account" className="flex flex-col my-auto w-sm gap-2 *:p-3">
                <input className="border-2 border-solid border-blue-400" type="text" placeholder="username" required/>
                <input className="border-2 border-solid border-blue-400" type="text" placeholder="password" required/>
                <button className="cursor-pointer hover:bg-slate-600">Login!</button>
            </Form>
        </section>
    )
}