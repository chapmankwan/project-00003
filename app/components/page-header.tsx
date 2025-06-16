
interface PageHeaderModel {
    title: string;
}

export const PageHeader = ({title}: PageHeaderModel) => {
    return (
        <h3 className="w-full text-2xl p-7 cursor-default select-none">
            {title}
        </h3>)
    ;
}