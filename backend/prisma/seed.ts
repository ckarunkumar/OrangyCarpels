import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  // Clear any existing values to ensure idempotence
  await prisma.education.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.timesheetRow.deleteMany({});
  await prisma.timesheet.deleteMany({});

  // 1. Create employees
  const arun = await prisma.employee.create({
    data: {
      fullName: 'ckArunkumar',
      designation: 'Studio Director',
      department: 'Leadership',
      email: 'arun@orangy.design',
      phone: '+91 9008152920',
      costRate: '₹8,000/hr',
      capacity: '40 hrs/week',
      status: 'Active',
      role: 'Super Admin',
      location: 'Delhi, India',
      education: {
        create: [
          { degree: 'MBA', school: 'IIM Ahmedabad', year: '2012' },
        ],
      },
      experience: {
        create: [
          { company: 'Orangy Design Studio', role: 'Founder & Director', period: '2015 - Present' },
        ],
      },
    },
  });

  const navaneetha = await prisma.employee.create({
    data: {
      fullName: 'Navaneetha S',
      designation: 'Senior Project Manager',
      department: 'Project Management',
      email: 'navaneetha@orangy.design',
      phone: '+91 9597101210',
      costRate: '₹4,500/hr',
      capacity: '40 hrs/week',
      status: 'Active',
      role: 'Project Manager',
      location: 'Delhi, India',
      education: {
        create: [
          { degree: 'B.E. in Computer Science', school: 'NIT Trichy', year: '2014' },
        ],
      },
      experience: {
        create: [
          { company: 'Infosys', role: 'Project Coordinator', period: '2014 - 2018' },
        ],
      },
    },
  });

  const alex = await prisma.employee.create({
    data: {
      fullName: 'Alex Carter',
      designation: 'Senior Product Designer',
      department: 'Product Design',
      email: 'alex.carter@orangy.studio',
      phone: '+91 98765 43210',
      costRate: '₹3,500/hr',
      capacity: '40 hrs/week',
      status: 'Active',
      role: 'Employee',
      education: {
        create: [
          { degree: 'Master of Design (M.Des)', school: 'IDC, IIT Bombay', year: '2018' },
          { degree: 'Bachelor of Fine Arts', school: 'Delhi College of Art', year: '2016' },
        ],
      },
      experience: {
        create: [
          { company: 'Studio Karta', role: 'UI/UX Designer', period: '2018 - 2021' },
        ],
      },
    },
  });

  const emma = await prisma.employee.create({
    data: {
      fullName: 'Emma Watson',
      designation: 'UX Researcher',
      department: 'User Research',
      email: 'emma.watson@orangy.studio',
      phone: '+91 99999 88888',
      costRate: '₹2,800/hr',
      capacity: '35 hrs/week',
      status: 'Active',
      role: 'Employee',
      education: {
        create: [
          { degree: 'M.Sc in HCI', school: 'Georgia Tech', year: '2021' },
        ],
      },
      experience: {
        create: [
          { company: 'Google Inc.', role: 'Associate Researcher', period: '2021 - 2023' },
        ],
      },
    },
  });

  console.log(`Seeded ${arun.fullName}, ${navaneetha.fullName}, ${alex.fullName}, and ${emma.fullName}`);

  // 2. Create clients & projects
  await prisma.client.create({
    data: {
      id: 'CL-001',
      name: 'Acme Corp',
      billingCurrency: 'USD ($)',
      status: 'Active',
      projects: {
        create: [
          { id: 'PRJ-101', name: 'Website Redesign', billingType: 'Hourly Rate (T&M)', rate: '$150/hr', budgetHours: 100, loggedHours: 78, status: 'Active' },
          { id: 'PRJ-102', name: 'CMS Integration', billingType: 'Project Cost (Fixed)', rate: '$12,000', budgetHours: 80, loggedHours: 15, status: 'Active' },
        ],
      },
    },
  });

  await prisma.client.create({
    data: {
      id: 'CL-002',
      name: 'Hooli Inc',
      billingCurrency: 'INR (₹)',
      status: 'Active',
      projects: {
        create: [
          { id: 'PRJ-201', name: 'Mobile App V2', billingType: 'Monthly Resource Cost (Fixed)', rate: '₹3,50,000/mo', budgetHours: 200, loggedHours: 195, status: 'Active' },
        ],
      },
    },
  });

  console.log('Seeded Clients and Projects.');

  // 3. Create a starting timesheet
  const ts = await prisma.timesheet.create({
    data: {
      weekStart: '2026-08-17',
      status: 'Draft',
      rows: {
        create: [
          { client: 'Acme Corp', project: 'Website Redesign', task: 'Development', billable: true, mon: 8, tue: 8, wed: 8, thu: 4, fri: 0, sat: 0, sun: 0 },
          { client: 'Stark Ind', project: 'Brand Strategy', task: 'Visual Identity', billable: true, mon: 0, tue: 0, wed: 0, thu: 4, fri: 8, sat: 0, sun: 0 },
        ],
      },
    },
  });

  console.log(`Seeded Timesheet: ${ts.weekStart}`);
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
