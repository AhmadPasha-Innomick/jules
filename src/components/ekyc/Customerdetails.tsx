"use client";

import React from "react";
import { SmartCardData } from "@/types/types";
import { User, CreditCard } from "lucide-react";
import Button from "@/components/ui/button/Button";

interface Props {
  cardData: SmartCardData;
  onConfirm: () => void;
  onBack: () => void;
}

const CustomerDetails: React.FC<Props> = ({ cardData, onConfirm, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow border">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-brand-500" />
        Customer Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <Detail label="Full Name" value={cardData.fullName} />
        <Detail label="CPR Number" value={cardData.cprNumber} />
        <Detail label="Nationality" value={cardData.nationality} />
        <Detail label="Gender" value={cardData.gender} />
        <Detail label="Date of Birth" value={cardData.dateOfBirth} />
        {/* <Detail label="Card Expiry" value={cardData.cardExpiryDate} /> */}
      </div>

      <div className="flex justify-end gap-4 mt-10">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm}>
          Confirm & Submit EKYC
        </Button>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-900">
      {value || "-"}
    </p>
  </div>
);

export default CustomerDetails;
