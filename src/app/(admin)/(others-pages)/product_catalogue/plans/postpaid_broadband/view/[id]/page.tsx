import ViewPostpaidBroadbandClient from "@/components/pages/product_catalog/ViewPostpaidBroadbandClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewPrepaidVoicePage({ params }: PageProps) {
    const { id } = await params;

    return <ViewPostpaidBroadbandClient id={id} />;
}
