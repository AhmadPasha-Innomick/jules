import ViewUserClient from "./ViewUserClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewUserPage({ params }: PageProps) {
  const { id } = await params; 

  return <ViewUserClient id={id} />;
}
