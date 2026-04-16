import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Ecommerce Dashboard",
  description: "View your ecommerce metrics, sales, and orders.",
};

export default async function Ecommerce() {
  return (

    <div className="flex items-center justify-center h-[calc(100vh-120px)]">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-700">
        Welcome to the Dashboard
      </h1>
    </div>
  );
}