import ViewPostpaidFiberClient from "@/components/pages/product_catalog/ViewPostpaidFiberClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewPostpaidFiberPage({ params }: PageProps) {

    const resolvedParams = await params;

 

    return <ViewPostpaidFiberClient id={resolvedParams.id} />;
}
