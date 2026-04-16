import ViewUserClient from "@/app/(admin)/(others-pages)/incident_management/ViewIncidentClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ViewUserPage({ params }: PageProps) {
    const { id } = await params;

    return <ViewUserClient id={id} />;
}
