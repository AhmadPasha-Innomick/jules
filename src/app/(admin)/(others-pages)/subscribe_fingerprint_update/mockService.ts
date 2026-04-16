import { SmartCardData, Transaction } from "@/types/types";

// Mock Database - Fully type-safe
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-987261",
    cprNumber: "890112345",
    customerName: "Ahmed Al-Farsi",
    serviceType: "New Postpaid Line",
    status: "PENDING",
    date: "2023-10-25",
    amount: "15.000 BHD",
  },
  {
    id: "TRX-987262",
    cprNumber: "890112345",
    customerName: "Ahmed Al-Farsi",
    serviceType: "Fiber Internet Upgrade",
    status: "PENDING",
    date: "2023-10-26",
    amount: "5.000 BHD",
  },
  {
    id: "TRX-112233",
    cprNumber: "950554321",
    customerName: "Sarah John",
    serviceType: "Prepaid Renewal",
    status: "PENDING",
    date: "2023-10-27",
    amount: "7.500 BHD",
  },
  {
    id: "TRX-554433",
    cprNumber: "780998877",
    customerName: "Mohamed Ebrahim",
    serviceType: "Device Installment",
    status: "PENDING",
    date: "2023-10-24",
    amount: "45.000 BHD",
  },
];

export const searchTransactions = async (
  query: string,
  type: "TRANSACTION_ID" | "CPR_NUMBER"
): Promise<Transaction[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!query) return [];

  const lowerQuery = query.toLowerCase();

  if (type === "TRANSACTION_ID") {
    return MOCK_TRANSACTIONS.filter((t) => t.id.toLowerCase() === lowerQuery);
  } else {
    return MOCK_TRANSACTIONS.filter((t) => t.cprNumber.includes(query));
  }
};

// export const simulateSmartCardRead = async (): Promise<SmartCardData> => {
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate hardware read time

//   return {
//     cardNumber: "368736387637",
//     cprNumber: "890112345",
//     fullName: "Ahmed Mohammed Al-Farsi",
//     FirstNameEnglish: "Ahmed",
//     LastNameEnglish: "Al-Farsi",
//     GovernorateNo: 0,

//     // OPTIONAL / COMMON FIELDS
//     dateOfBirth: "1990-01-12",
//     expiryDate: "2030-01-12",
//     gender: "Male",
//     nationality: "Bahraini",
//     photoUrl: "https://picsum.photos/200",
//   };
// };

export const simulateFingerprintScan = async (
  shouldFail = false
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate scanning and matching

  if (shouldFail) {
    throw new Error("Fingerprint mismatch");
  }

  return true;
};

export const submitEkycRequest = async (
  transactionIds: string[],
  smartCardData: SmartCardData
): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return `REQ-${Math.floor(Math.random() * 100000)}`;
};
