export interface Task {
    completed: boolean;
    date: string;
    dateCompleted: string | boolean;
    edited: boolean;
    id: string;
    text: string;
}

export interface TodoListModel {
  id: string;         // unique ID (UUID or nanoid)
  title: string;      // editable title
  slug: string;       // generated from title
  dateCreated: string;
  tasks: Task[];
}