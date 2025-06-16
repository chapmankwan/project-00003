"use client"
import { useEffect, useState } from "react";

import { Card, PageHeader, Loader } from "@/app/components";
import type { TodoListModel } from "@/app/models";

export default function Workspaces () {
    const [allTaskLists, setAllTaskLists] = useState<TodoListModel[]>([])
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        const timer = setTimeout( () => {
            const data = localStorage.getItem("todoLists");
            const parsedData: TodoListModel[] = data ? JSON.parse(data) : {}

            const taskList:TodoListModel[] = parsedData.sort( (a: TodoListModel,b: TodoListModel) => 
                new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
            );

            setAllTaskLists(taskList);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    },[]);


    return (
        <section className="flex flex-1 flex-col items-center h-[calc(100vh-56px)]">
            <PageHeader title="Workspaces"/>
            {
                loading ? 
                <Loader /> :
                <ul className="space-y-2 w-[90%] lg:w-2/3 mx-3 rounded-md flex-grow h-full overflow-y-auto">
                    {
                        allTaskLists.length > 0 &&
                        allTaskLists.map( (taskList, index) => {
                            return (
                                <Card key={index} taskList={taskList} />
                            )
                        })
                    }
                </ul>
            }
        </section>
    )
}