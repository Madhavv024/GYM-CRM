import {
  addDays,
  format,
  startOfDay,
  subMonths,
} from "date-fns";
import type {
  Attendance,
  Expense,
  GymSettings,
  Lead,
  MembershipPlan,
  Member,
  Payment,
  Trainer,
} from "@/types";

const today = startOfDay(new Date());

const dateOffset = (days: number) => format(addDays(today, days), "yyyy-MM-dd");

const dateMonthsAgo = (months: number, days = 0) =>
  format(addDays(subMonths(today, months), days), "yyyy-MM-dd");

export const seedGymSettings: GymSettings = {
  gymName: "Iron District Fitness",
  gymPhone: "+91 98765 43210",
  gymEmail: "hello@irondistrictfitness.in",
  gymAddress: "Vijay Nagar, Indore, Madhya Pradesh",
  currency: "INR",
  attendanceBlockingEnabled: true,
  renewalAlertDays: 7,
};

export const seedPlans: MembershipPlan[] = [
  {
    id: "plan-monthly",
    name: "Monthly Strength",
    durationInDays: 30,
    price: 1100,
    joiningFee: 300,
    description: "Full gym access with standard equipment access.",
    isActive: true,
    createdAt: dateMonthsAgo(12),
  },
  {
    id: "plan-quarterly",
    name: "Quarterly Performance",
    durationInDays: 90,
    price: 2500,
    joiningFee: 300,
    description: "Three-month plan for consistent training.",
    isActive: true,
    createdAt: dateMonthsAgo(12),
  },
  {
    id: "plan-half-yearly",
    name: "Half-Year Transformation",
    durationInDays: 180,
    price: 8500,
    joiningFee: 0,
    description: "Six-month membership with fitness assessment.",
    isActive: true,
    createdAt: dateMonthsAgo(12),
  },
  {
    id: "plan-annual",
    name: "Annual Elite",
    durationInDays: 365,
    price: 14500,
    joiningFee: 0,
    description: "Annual full-access membership with priority support.",
    isActive: true,
    createdAt: dateMonthsAgo(12),
  },
  {
    id: "plan-student",
    name: "Student Flex",
    durationInDays: 90,
    price: 3600,
    joiningFee: 200,
    description: "Quarterly student plan with valid ID required.",
    isActive: true,
    createdAt: dateMonthsAgo(12),
  }

];


  

export const seedTrainers: Trainer[] = [
  {
    id: "trainer-1",
    fullName: "Rohit Verma",
    mobile: "9876543211",
    email: "rohit@irondistrictfitness.in",
    specialization: ["Strength Training", "Hypertrophy"],
    joiningDate: dateMonthsAgo(18),
    isActive: true,
    createdAt: dateMonthsAgo(18),
  },
  {
    id: "trainer-2",
    fullName: "Aditi Sharma",
    mobile: "9876543212",
    email: "aditi@irondistrictfitness.in",
    specialization: ["Weight Loss", "Functional Training"],
    joiningDate: dateMonthsAgo(14),
    isActive: true,
    createdAt: dateMonthsAgo(14),
  },
  {
    id: "trainer-3",
    fullName: "Karan Malhotra",
    mobile: "9876543213",
    email: "karan@irondistrictfitness.in",
    specialization: ["Powerlifting", "Mobility"],
    joiningDate: dateMonthsAgo(10),
    isActive: true,
    createdAt: dateMonthsAgo(10),
  },
  {
    id: "trainer-4",
    fullName: "Neha Joshi",
    mobile: "9876543214",
    email: "neha@irondistrictfitness.in",
    specialization: ["Yoga", "Women’s Fitness"],
    joiningDate: dateMonthsAgo(8),
    isActive: true,
    createdAt: dateMonthsAgo(8),
  },
  {
    id: "trainer-5",
    fullName: "Siddharth Rao",
    mobile: "9876543215",
    email: "siddharth@irondistrictfitness.in",
    specialization: ["CrossFit", "Athletic Conditioning"],
    joiningDate: dateMonthsAgo(6),
    isActive: true,
    createdAt: dateMonthsAgo(6),
  },
];

const memberSeed = [
  ["member-001", "GF-1001", "Arjun", "Mehta", "9876501001", "male", "plan-annual", -220, 145, false, "trainer-1"],
  ["member-002", "GF-1002", "Priya", "Nair", "9876501002", "female", "plan-quarterly", -84, 6, false, "trainer-2"],
  ["member-003", "GF-1003", "Rohan", "Kapoor", "9876501003", "male", "plan-monthly", -38, -8, false, "trainer-1"],
  ["member-004", "GF-1004", "Sneha", "Iyer", "9876501004", "female", "plan-half-yearly", -130, 50, false, "trainer-4"],
  ["member-005", "GF-1005", "Vikram", "Singh", "9876501005", "male", "plan-quarterly", -82, 8, false, "trainer-3"],
  ["member-006", "GF-1006", "Kavya", "Reddy", "9876501006", "female", "plan-student", -88, 2, false, "trainer-2"],
  ["member-007", "GF-1007", "Aditya", "Bansal", "9876501007", "male", "plan-monthly", -22, 8, false, "trainer-5"],
  ["member-008", "GF-1008", "Ishita", "Gupta", "9876501008", "female", "plan-annual", -310, 55, false, "trainer-4"],
  ["member-009", "GF-1009", "Manav", "Saxena", "9876501009", "male", "plan-quarterly", -95, -5, false, "trainer-1"],
  ["member-010", "GF-1010", "Riya", "Chauhan", "9876501010", "female", "plan-half-yearly", -155, 25, true, "trainer-2"],
  ["member-011", "GF-1011", "Harsh", "Agarwal", "9876501011", "male", "plan-monthly", -12, 18, false, "trainer-3"],
  ["member-012", "GF-1012", "Meera", "Sethi", "9876501012", "female", "plan-student", -92, -2, false, "trainer-4"],
  ["member-013", "GF-1013", "Yash", "Patel", "9876501013", "male", "plan-quarterly", -70, 20, false, "trainer-5"],
  ["member-014", "GF-1014", "Ananya", "Mishra", "9876501014", "female", "plan-annual", -360, 5, false, "trainer-2"],
  ["member-015", "GF-1015", "Dev", "Khanna", "9876501015", "male", "plan-monthly", -45, -15, false, "trainer-1"],
  ["member-016", "GF-1016", "Pooja", "Arora", "9876501016", "female", "plan-half-yearly", -115, 65, false, "trainer-4"],
  ["member-017", "GF-1017", "Nikhil", "Jain", "9876501017", "male", "plan-quarterly", -87, 3, false, "trainer-3"],
  ["member-018", "GF-1018", "Simran", "Kaur", "9876501018", "female", "plan-student", -80, 10, false, "trainer-2"],
  ["member-019", "GF-1019", "Rahul", "Tiwari", "9876501019", "male", "plan-annual", -120, 245, false, "trainer-5"],
  ["member-020", "GF-1020", "Tanya", "Bhatia", "9876501020", "female", "plan-monthly", -25, 5, false, "trainer-4"],
] as const;

export const seedMembers: Member[] = memberSeed.map(
  ([
    id,
    memberCode,
    firstName,
    lastName,
    mobile,
    gender,
    planId,
    startOffset,
    endOffset,
    isPaused,
    assignedTrainerId,
  ]) => {
    const plan = seedPlans.find((item) => item.id === planId);

    if (!plan) {
      throw new Error(`Missing seed plan: ${planId}`);
    }

    const membershipStartDate = dateOffset(startOffset);
    const membershipEndDate = dateOffset(endOffset);

    return {
      id,
      memberCode,
      firstName,
      lastName,
      mobile,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      gender,
      planId,
      membershipStartDate,
      membershipEndDate,
      isPaused,
      pauseReason: isPaused ? "Medical recovery period" : undefined,
      joinedAt: membershipStartDate,
      assignedTrainerId,
      notes: "Seed profile for SK-Fitness CRM.",
      membershipHistory: [
        {
          id: `${id}-history-1`,
          planId,
          planName: plan.name,
          startDate: membershipStartDate,
          endDate: membershipEndDate,
          price: plan.price,
          renewedAt: membershipStartDate,
        },
      ],
      createdAt: membershipStartDate,
      updatedAt: dateOffset(-1),
    };
  },
);

const createPayment = (
  id: string,
  memberId: string,
  amount: number,
  daysAgo: number,
  method: Payment["method"] = "upi",
  status: Payment["status"] = "successful",
): Payment => {
  const member = seedMembers.find((item) => item.id === memberId);

  if (!member) {
    throw new Error(`Missing seed member: ${memberId}`);
  }

  return {
    id,
    memberId,
    memberCode: member.memberCode,
    amount,
    paymentDate: dateOffset(-daysAgo),
    method,
    status,
    receiptNumber: `RCPT-${id.replace("payment-", "").padStart(4, "0")}`,
    createdAt: dateOffset(-daysAgo),
  };
};

export const seedPayments: Payment[] = [
  createPayment("payment-1", "member-001", 14500, 145, "card"),
  createPayment("payment-2", "member-002", 3000, 84, "upi"),
  createPayment("payment-3", "member-002", 1800, 10, "cash"),
  createPayment("payment-4", "member-004", 8500, 130, "bank_transfer"),
  createPayment("payment-5", "member-005", 4800, 82, "upi"),
  createPayment("payment-6", "member-006", 2500, 88, "cash"),
  createPayment("payment-7", "member-007", 1800, 22, "upi"),
  createPayment("payment-8", "member-008", 14500, 310, "card"),
  createPayment("payment-9", "member-010", 8500, 155, "bank_transfer"),
  createPayment("payment-10", "member-011", 1800, 12, "upi"),
  createPayment("payment-11", "member-013", 4800, 70, "cash"),
  createPayment("payment-12", "member-014", 14500, 360, "card"),
  createPayment("payment-13", "member-016", 8500, 115, "upi"),
  createPayment("payment-14", "member-017", 3500, 87, "upi"),
  createPayment("payment-15", "member-018", 3600, 80, "cash"),
  createPayment("payment-16", "member-019", 14500, 120, "bank_transfer"),
  createPayment("payment-17", "member-020", 1800, 25, "upi"),
  createPayment("payment-18", "member-003", 1000, 38, "cash", "partial"),
  createPayment("payment-19", "member-012", 2000, 92, "upi", "partial"),
  createPayment("payment-20", "member-015", 1200, 45, "cash", "partial"),
  createPayment("payment-21", "member-006", 500, 14, "upi"),
  createPayment("payment-22", "member-017", 1000, 18, "cash"),
  createPayment("payment-23", "member-011", 300, 5, "upi"),
  createPayment("payment-24", "member-020", 300, 8, "cash"),
  createPayment("payment-25", "member-002", 300, 3, "upi"),
];

export const seedAttendance: Attendance[] = Array.from(
  { length: 20 },
  (_, index) => {
    const member = seedMembers[index % seedMembers.length];
    const dayOffset = index < 9 ? 0 : -(Math.floor(index / 4) + 1);

    return {
      id: `attendance-${index + 1}`,
      memberId: member.id,
      memberCode: member.memberCode,
      checkedInAt: `${dateOffset(dayOffset)}T${String(6 + (index % 12)).padStart(2, "0")}:${String(10 + index).padStart(2, "0")}:00`,
      source: index % 3 === 0 ? "manual" : "member_lookup",
      checkedInBy: "Gym Administrator",
    };
  },
);

export const seedLeads: Lead[] = [
  {
    id: "lead-1",
    fullName: "Aman Dubey",
    mobile: "9893010001",
    email: "aman.dubey@example.com",
    interestedPlanId: "plan-quarterly",
    source: "instagram",
    status: "new",
    followUpDate: dateOffset(1),
    notes: "Asked about evening crowd and trainer availability.",
    createdAt: dateOffset(-1),
    updatedAt: dateOffset(-1),
  },
  {
    id: "lead-2",
    fullName: "Nisha Yadav",
    mobile: "9893010002",
    interestedPlanId: "plan-student",
    source: "walk_in",
    status: "trial_booked",
    followUpDate: dateOffset(0),
    notes: "Trial scheduled for 7 PM.",
    createdAt: dateOffset(-3),
    updatedAt: dateOffset(-1),
  },
  {
    id: "lead-3",
    fullName: "Saurabh Jain",
    mobile: "9893010003",
    interestedPlanId: "plan-annual",
    source: "google",
    status: "follow_up",
    followUpDate: dateOffset(2),
    notes: "Wants family discount details.",
    createdAt: dateOffset(-5),
    updatedAt: dateOffset(-2),
  },
  {
    id: "lead-4",
    fullName: "Kritika Soni",
    mobile: "9893010004",
    source: "referral",
    status: "contacted",
    followUpDate: dateOffset(1),
    createdAt: dateOffset(-4),
    updatedAt: dateOffset(-1),
  },
  {
    id: "lead-5",
    fullName: "Mohit Chawla",
    mobile: "9893010005",
    interestedPlanId: "plan-monthly",
    source: "phone",
    status: "lost",
    notes: "Budget mismatch.",
    createdAt: dateOffset(-9),
    updatedAt: dateOffset(-4),
  },
  {
    id: "lead-6",
    fullName: "Shreya Kulkarni",
    mobile: "9893010006",
    interestedPlanId: "plan-half-yearly",
    source: "website",
    status: "new",
    followUpDate: dateOffset(3),
    createdAt: dateOffset(-1),
    updatedAt: dateOffset(-1),
  },
  {
    id: "lead-7",
    fullName: "Ritesh Sharma",
    mobile: "9893010007",
    source: "walk_in",
    status: "contacted",
    followUpDate: dateOffset(0),
    createdAt: dateOffset(-2),
    updatedAt: dateOffset(-1),
  },
  {
    id: "lead-8",
    fullName: "Palak Bhatnagar",
    mobile: "9893010008",
    interestedPlanId: "plan-student",
    source: "instagram",
    status: "follow_up",
    followUpDate: dateOffset(2),
    createdAt: dateOffset(-6),
    updatedAt: dateOffset(-2),
  },
  {
    id: "lead-9",
    fullName: "Dhruv Goyal",
    mobile: "9893010009",
    interestedPlanId: "plan-quarterly",
    source: "google",
    status: "trial_booked",
    followUpDate: dateOffset(1),
    createdAt: dateOffset(-3),
    updatedAt: dateOffset(-1),
  },
  {
    id: "lead-10",
    fullName: "Rhea Kapoor",
    mobile: "9893010010",
    source: "referral",
    status: "new",
    followUpDate: dateOffset(4),
    createdAt: dateOffset(-1),
    updatedAt: dateOffset(-1),
  },
  {
    id: "lead-11",
    fullName: "Tarun Arora",
    mobile: "9893010011",
    interestedPlanId: "plan-annual",
    source: "phone",
    status: "converted",
    convertedMemberId: "member-020",
    createdAt: dateOffset(-20),
    updatedAt: dateOffset(-5),
  },
  {
    id: "lead-12",
    fullName: "Sakshi Bansal",
    mobile: "9893010012",
    interestedPlanId: "plan-monthly",
    source: "website",
    status: "contacted",
    followUpDate: dateOffset(1),
    createdAt: dateOffset(-2),
    updatedAt: dateOffset(-1),
  },
];

export const seedExpenses: Expense[] = [
  {
    id: "expense-1",
    title: "Monthly rent",
    category: "rent",
    amount: 45000,
    expenseDate: dateOffset(-1),
    paymentMethod: "bank_transfer",
    createdAt: dateOffset(-1),
  },
  {
    id: "expense-2",
    title: "Electricity bill",
    category: "utilities",
    amount: 8200,
    expenseDate: dateOffset(-4),
    paymentMethod: "upi",
    createdAt: dateOffset(-4),
  },
  {
    id: "expense-3",
    title: "Treadmill servicing",
    category: "maintenance",
    amount: 5400,
    expenseDate: dateOffset(-8),
    paymentMethod: "cash",
    createdAt: dateOffset(-8),
  },
];