"use client";

import React, { useState } from "react";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

import Switch from "@/components/form/switch/Switch";
import FormLabel from "@mui/material/FormLabel";
import TextArea from "@/components/form/input/TextArea";

const GroupManagement: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

  };

  return (
    <>
      <div className="w-full rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md md:w-1/2">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
            <div>
              <InputField label="Occupation Code" name="Nationality_Code" />
            </div>
            <div>
              <InputField label="Category" name="category" />
            </div>
            <div>
              <TextArea
                label="Description"
                fullWidth
                minRows={3}
                maxRows={10}
              />
            </div>
            <div className="flex flex-col">
              <FormLabel className="text-sm font-stc-medium text-gray-700">
                Status
              </FormLabel>
              <Switch
                checked={isActive}
                onChange={(val) => setIsActive(val)}
                activeLabel="Active"
                inactiveLabel="Inactive"
                color="primary"
              />
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
