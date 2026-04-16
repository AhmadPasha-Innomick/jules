import ViewPrepaidBroadbandClient from "@/components/pages/product_catalog/ViewPrepaidBroadbandClient";

interface PageProps {
    params: Promise<{ Id: string }>;
}

export default async function ViewPrepaidVoicePage({ params }: PageProps) {
    const { Id } = await params;

    return <ViewPrepaidBroadbandClient id={Id} />;
}
