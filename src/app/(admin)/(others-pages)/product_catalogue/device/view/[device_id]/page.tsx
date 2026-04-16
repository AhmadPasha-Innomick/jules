import ViewDeviceClient from "@/components/pages/product_catalog/ViewDeviceClient";

interface PageProps {
  params: Promise<{ device_id: string }>;
}

export default async function ViewDevicePage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ViewDeviceClient id={resolvedParams.device_id} />;
}
