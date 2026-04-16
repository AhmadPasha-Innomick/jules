import Link from "next/link";
import React from "react";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

interface DynamicCrumb {
    label: string;
    href?: string;
}

interface DynamicBreadcrumbProps {
    items: DynamicCrumb[];
}

const PageBreadcrumbDynamic: React.FC<DynamicBreadcrumbProps> = ({ items }) => {
    return (
        <div className="mb-6">

          
            <h2 className="text-xl font-stc-bold text-gray-800 mb-3">
                {items[items.length - 1].label}
            </h2>

           
            <nav>
                <ol className="flex items-center gap-1.5">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;

                        return (
                            <li key={index} className="flex items-center gap-1 text-sm">
                                {item.href && !isLast ? (
                                    <>
                                        <Link
                                            href={item.href}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            {item.label}
                                        </Link>

                              
                                        <NavigateNextIcon
                                            fontSize="small"
                                            className="text-gray-400"
                                        />
                                    </>
                                ) : (
                                   
                                    <span className="text-gray-800 font-medium">{item.label}</span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};

export default PageBreadcrumbDynamic;
