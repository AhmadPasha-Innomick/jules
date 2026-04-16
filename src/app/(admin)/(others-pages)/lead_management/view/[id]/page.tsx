import ViewLeadClient from "@/app/(admin)/(others-pages)/lead_management/ViewLeadClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewLeadPage({ params }: PageProps) {
    const { id } = await params;

    return <ViewLeadClient id={id} />;
}