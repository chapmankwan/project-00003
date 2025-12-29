
interface PageHeaderModel {
    title: string;
}

export const PageHeader = ({title}: PageHeaderModel) => {
    return (
        <h3 className="w-full text-2xl px-7 py-5 cursor-default select-none">
            {title}
        </h3>)
    ;
}