import ViewNotificationClient from "./ViewNotificationClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewNotificationPage({ params }: PageProps) {
  const { id } = await params; 

  return <ViewNotificationClient id={id} />;
}