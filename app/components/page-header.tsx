
interface PageHeaderModel {
    title: string;
    onClick?: () => void;
}

export const PageHeader = ({
    title, 
    onClick
}: PageHeaderModel) => {
    return (
        <h3 className="w-full text-2xl px-7 py-5 cursor-default select-none" onClick={onClick}>
            {title}
        </h3>)
    ;
}