import ViewPrepaidVoiceClient from "@/components/pages/product_catalog/ViewPrepaidVoiceClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewPrepaidVoicePage({ params }: PageProps) {

    const resolvedParams = await params;



    return <ViewPrepaidVoiceClient id={resolvedParams.id} />;
}
