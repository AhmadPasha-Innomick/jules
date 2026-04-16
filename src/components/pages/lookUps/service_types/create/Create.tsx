"use client";

import React from "react";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

const GroupManagement: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };

  return (
    <>
      <div className="w-full rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:w-1/2">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
            <div>
              <InputField label="Service Type ID" name="ServiceTypeID" />
            </div>
            <div>
              <InputField label="Service Type" name="ServiceType" />
            </div>
          </div>


          <div className="mt-7 flex justify-end gap-5">
            <Button type="submit">Save</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default GroupManagement;
