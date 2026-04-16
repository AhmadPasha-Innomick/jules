import ViewPostpaidClient from "@/components/pages/product_catalog/ViewPostpaidClient";

interface PageProps {
    params: Promise<{ Id: string }>;
}

export default async function ViewPostpaidPage({ params }: PageProps) {

    const resolvedParams = await params;



    return <ViewPostpaidClient id={resolvedParams.Id} />;
}
