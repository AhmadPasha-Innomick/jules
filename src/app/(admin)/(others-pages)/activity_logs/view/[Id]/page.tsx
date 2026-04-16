import ViewLogClient from "./ViewLogClient";

interface PageProps {
    params: Promise<{ Id: string }>;
}

export default async function ViewUserPage({ params }: PageProps) {
    const { Id } = await params;

    return <ViewLogClient id={Id} />;
}


