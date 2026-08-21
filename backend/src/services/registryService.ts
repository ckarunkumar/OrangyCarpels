import { prisma } from '../lib/prisma';

export interface EmployeeProfile {
  id: number;
  employeeId: string;
  fullName: string;
  dob?: string;
  designation: string;
  department: string;
  email: string;
  personalEmail?: string;
  phone: string;
  secondaryPhone?: string;
  permanentAddress?: string;
  guardianName?: string;
  motherName?: string;
  bloodGroup?: string;
  linkedInUrl?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  costRate: string; // Gated financial data
  capacity: string;
  status: 'Active' | 'Inactive';
  role: 'Super Admin' | 'Project Manager' | 'Employee';
  location?: string;
  avatar?: string | null;
  education: Array<{ degree: string; school: string; year: string }>;
  experience: Array<{ company: string; role: string; period: string }>;
}

export interface ProjectDetail {
  id: string;
  name: string;
  billingType: 'Hourly Rate (T&M)' | 'Monthly Resource Cost (Fixed)' | 'Project Cost (Fixed)';
  rate: string; // Gated financial data
  budgetHours: number;
  loggedHours: number;
  status: 'Active' | 'Inactive';
}

export interface ProjectWithClient extends ProjectDetail {
  clientId: string;
  clientName: string;
  clientCurrency: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billingCurrency: string;
  defaultBillingType: 'Hourly Rate (T&M)' | 'Monthly Resource Cost (Fixed)' | 'Project Cost (Fixed)';
  status: 'Active' | 'Inactive';
  projects: ProjectDetail[];
}

export class RegistryService {
  /**
   * Returns employees list from database, masking costRate if role is not Super Admin.
   */
  static async getEmployees(role: string): Promise<EmployeeProfile[]> {
    if (role === 'Employee') {
      throw new Error('Access Denied: Employees cannot view the full registry.');
    }

    const employees = await prisma.employee.findMany({
      include: { education: true, experience: true },
    });

    return employees.map((emp) => ({
      id: emp.id,
      employeeId: emp.employeeId || `EMP-00${emp.id}`,
      fullName: emp.fullName,
      dob: emp.dob || '',
      designation: emp.designation,
      department: emp.department,
      email: emp.email,
      personalEmail: emp.personalEmail || '',
      phone: emp.phone,
      secondaryPhone: emp.secondaryPhone || '',
      permanentAddress: emp.permanentAddress || '',
      guardianName: emp.guardianName || '',
      motherName: emp.motherName || '',
      bloodGroup: emp.bloodGroup || '',
      linkedInUrl: emp.linkedInUrl || '',
      aadhaarNumber: emp.aadhaarNumber || '',
      panNumber: emp.panNumber || '',
      costRate: role === 'Super Admin' ? emp.costRate : 'RESTRICTED',
      capacity: emp.capacity,
      status: emp.status as 'Active' | 'Inactive',
      role: emp.role as EmployeeProfile['role'],
      location: emp.location,
      avatar: emp.avatar,
      education: emp.education.map((edu) => ({
        degree: edu.degree,
        school: edu.school,
        year: edu.year,
      })),
      experience: emp.experience.map((exp) => ({
        company: exp.company,
        role: exp.role,
        period: exp.period,
      })),
    }));
  }

  /**
   * Creates a new employee in database. Super Admin only.
   */
  static async createEmployee(
    role: string,
    data: Omit<EmployeeProfile, 'id' | 'education' | 'experience'>
  ): Promise<EmployeeProfile> {
    if (role !== 'Super Admin') {
      throw new Error('Access Denied: Only Super Admins can create employee profiles.');
    }

    const count = await prisma.employee.count();
    const emp = await prisma.employee.create({
      data: {
        employeeId: data.employeeId || `EMP-00${count + 1}`,
        fullName: data.fullName.trim(),
        dob: data.dob?.trim() || '',
        designation: data.designation?.trim() || 'Team Member',
        department: data.department?.trim() || 'General',
        email: data.email.trim(),
        personalEmail: data.personalEmail?.trim() || '',
        phone: data.phone.trim(),
        secondaryPhone: data.secondaryPhone?.trim() || '',
        permanentAddress: data.permanentAddress?.trim() || '',
        guardianName: data.guardianName?.trim() || '',
        motherName: data.motherName?.trim() || '',
        bloodGroup: data.bloodGroup?.trim() || '',
        linkedInUrl: data.linkedInUrl?.trim() || '',
        aadhaarNumber: data.aadhaarNumber?.trim() || '',
        panNumber: data.panNumber?.trim() || '',
        costRate: data.costRate || '₹0/hr',
        capacity: data.capacity || '40 hrs/week',
        status: data.status || 'Active',
        role: data.role || 'Employee',
        location: data.location || 'Delhi, India',
      },
    });

    return {
      id: emp.id,
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      dob: emp.dob || '',
      designation: emp.designation,
      department: emp.department,
      email: emp.email,
      personalEmail: emp.personalEmail || '',
      phone: emp.phone,
      secondaryPhone: emp.secondaryPhone || '',
      permanentAddress: emp.permanentAddress || '',
      guardianName: emp.guardianName || '',
      motherName: emp.motherName || '',
      bloodGroup: emp.bloodGroup || '',
      linkedInUrl: emp.linkedInUrl || '',
      aadhaarNumber: emp.aadhaarNumber || '',
      panNumber: emp.panNumber || '',
      costRate: emp.costRate,
      capacity: emp.capacity,
      status: emp.status as 'Active' | 'Inactive',
      role: emp.role as EmployeeProfile['role'],
      location: emp.location,
      avatar: emp.avatar,
      education: [],
      experience: [],
    };
  }

  /**
   * Updates an existing employee record. Super Admin only.
   */
  static async updateEmployee(
    role: string,
    id: number,
    data: Partial<Omit<EmployeeProfile, 'id' | 'education' | 'experience'>>
  ): Promise<EmployeeProfile> {
    if (role !== 'Super Admin') {
      throw new Error('Access Denied: Only Super Admins can edit employee profiles.');
    }

    const existing = await prisma.employee.findUnique({ where: { id }, include: { education: true, experience: true } });
    if (!existing) throw new Error('Employee not found.');

    const emp = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.employeeId !== undefined && { employeeId: data.employeeId }),
        ...(data.fullName !== undefined && { fullName: data.fullName.trim() }),
        ...(data.dob !== undefined && { dob: data.dob.trim() }),
        ...(data.designation !== undefined && { designation: data.designation.trim() }),
        ...(data.department !== undefined && { department: data.department.trim() }),
        ...(data.email !== undefined && { email: data.email.trim() }),
        ...(data.personalEmail !== undefined && { personalEmail: data.personalEmail.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() }),
        ...(data.secondaryPhone !== undefined && { secondaryPhone: data.secondaryPhone.trim() }),
        ...(data.permanentAddress !== undefined && { permanentAddress: data.permanentAddress.trim() }),
        ...(data.guardianName !== undefined && { guardianName: data.guardianName.trim() }),
        ...(data.motherName !== undefined && { motherName: data.motherName.trim() }),
        ...(data.bloodGroup !== undefined && { bloodGroup: data.bloodGroup.trim() }),
        ...(data.linkedInUrl !== undefined && { linkedInUrl: data.linkedInUrl.trim() }),
        ...(data.aadhaarNumber !== undefined && { aadhaarNumber: data.aadhaarNumber.trim() }),
        ...(data.panNumber !== undefined && { panNumber: data.panNumber.trim() }),
        ...(data.costRate !== undefined && { costRate: data.costRate }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.location !== undefined && { location: data.location }),
      },
      include: { education: true, experience: true },
    });

    return {
      id: emp.id,
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      dob: emp.dob || '',
      designation: emp.designation,
      department: emp.department,
      email: emp.email,
      personalEmail: emp.personalEmail || '',
      phone: emp.phone,
      secondaryPhone: emp.secondaryPhone || '',
      permanentAddress: emp.permanentAddress || '',
      guardianName: emp.guardianName || '',
      motherName: emp.motherName || '',
      bloodGroup: emp.bloodGroup || '',
      linkedInUrl: emp.linkedInUrl || '',
      aadhaarNumber: emp.aadhaarNumber || '',
      panNumber: emp.panNumber || '',
      costRate: emp.costRate,
      capacity: emp.capacity,
      status: emp.status as 'Active' | 'Inactive',
      role: emp.role as EmployeeProfile['role'],
      location: emp.location,
      avatar: emp.avatar,
      education: emp.education.map((e) => ({ degree: e.degree, school: e.school, year: e.year })),
      experience: emp.experience.map((e) => ({ company: e.company, role: e.role, period: e.period })),
    };
  }

  /**
   * Returns clients list from database.
   */
  static async getClients(role: string): Promise<ClientProfile[]> {
    if (role === 'Employee') {
      throw new Error('Access Denied: Employees cannot view client registries.');
    }

    const clients = await prisma.client.findMany({
      include: { projects: true },
    });

    return clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      billingCurrency: client.billingCurrency,
      defaultBillingType: (client.defaultBillingType as ClientProfile['defaultBillingType']) || 'Hourly Rate (T&M)',
      status: client.status as 'Active' | 'Inactive',
      projects: client.projects.map((proj) => ({
        id: proj.id,
        name: proj.name,
        billingType: proj.billingType as ProjectDetail['billingType'],
        rate: role === 'Super Admin' ? proj.rate : 'RESTRICTED',
        budgetHours: proj.budgetHours,
        loggedHours: proj.loggedHours,
        status: proj.status as 'Active' | 'Inactive',
      })),
    }));
  }

  /**
   * Creates a client with unique ID validation. Super Admin only.
   */
  static async createClient(
    role: string,
    data: {
      id?: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
      billingCurrency: string;
      defaultBillingType?: string;
      status?: 'Active' | 'Inactive';
    }
  ): Promise<ClientProfile> {
    if (role !== 'Super Admin') {
      throw new Error('Access Denied: Only Super Admins can create client entities.');
    }

    let targetId = data.id?.trim();
    if (targetId) {
      const existing = await prisma.client.findUnique({ where: { id: targetId } });
      if (existing) {
        throw new Error(`Client ID "${targetId}" already exists. Please choose a unique Client ID.`);
      }
    } else {
      const count = await prisma.client.count();
      targetId = `CL-00${count + 1}`;
      let attempt = 1;
      while (await prisma.client.findUnique({ where: { id: targetId } })) {
        attempt++;
        targetId = `CL-00${count + attempt}`;
      }
    }

    const client = await prisma.client.create({
      data: {
        id: targetId,
        name: data.name.trim(),
        email: data.email?.trim() || '',
        phone: data.phone?.trim() || '',
        address: data.address?.trim() || '',
        billingCurrency: data.billingCurrency || 'USD ($)',
        defaultBillingType: data.defaultBillingType || 'Hourly Rate (T&M)',
        status: data.status || 'Active',
      },
    });

    return {
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      billingCurrency: client.billingCurrency,
      defaultBillingType: (client.defaultBillingType as ClientProfile['defaultBillingType']) || 'Hourly Rate (T&M)',
      status: client.status as 'Active' | 'Inactive',
      projects: [],
    };
  }

  /**
   * Updates a client. Super Admin only.
   */
  static async updateClient(
    role: string,
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      billingCurrency?: string;
      defaultBillingType?: string;
      status?: 'Active' | 'Inactive';
    }
  ): Promise<ClientProfile> {
    if (role !== 'Super Admin') {
      throw new Error('Access Denied: Only Super Admins can edit client entities.');
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.email !== undefined && { email: data.email.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() }),
        ...(data.address !== undefined && { address: data.address.trim() }),
        ...(data.billingCurrency !== undefined && { billingCurrency: data.billingCurrency }),
        ...(data.defaultBillingType !== undefined && { defaultBillingType: data.defaultBillingType }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: { projects: true },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email || '',
      phone: updated.phone || '',
      address: updated.address || '',
      billingCurrency: updated.billingCurrency,
      defaultBillingType: (updated.defaultBillingType as ClientProfile['defaultBillingType']) || 'Hourly Rate (T&M)',
      status: updated.status as 'Active' | 'Inactive',
      projects: updated.projects.map((p) => ({
        id: p.id,
        name: p.name,
        billingType: p.billingType as ProjectDetail['billingType'],
        rate: role === 'Super Admin' ? p.rate : 'RESTRICTED',
        budgetHours: p.budgetHours,
        loggedHours: p.loggedHours,
        status: p.status as 'Active' | 'Inactive',
      })),
    };
  }

  /**
   * Returns all projects with client details.
   */
  static async getAllProjects(role: string): Promise<ProjectWithClient[]> {
    if (role === 'Employee') {
      throw new Error('Access Denied: Employees cannot view project registries.');
    }

    const projects = await prisma.project.findMany({
      include: { client: true },
    });

    return projects.map((proj) => ({
      id: proj.id,
      name: proj.name,
      billingType: proj.billingType as ProjectDetail['billingType'],
      rate: role === 'Super Admin' ? proj.rate : 'RESTRICTED',
      budgetHours: proj.budgetHours,
      loggedHours: proj.loggedHours,
      status: proj.status as 'Active' | 'Inactive',
      clientId: proj.clientId,
      clientName: proj.client.name,
      clientCurrency: proj.client.billingCurrency,
    }));
  }

  /**
   * Creates a project under a client. PM or Admin.
   */
  static async createProject(
    role: string,
    clientId: string,
    name: string,
    billingType: ProjectDetail['billingType'],
    rate: string,
    budgetHours: number
  ): Promise<ProjectDetail> {
    if (role === 'Employee') {
      throw new Error('Access Denied: Employees cannot create projects.');
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new Error('Client not found.');

    const projId = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    const proj = await prisma.project.create({
      data: {
        id: projId,
        name,
        billingType,
        rate,
        budgetHours,
        status: 'Active',
        clientId,
      },
    });

    return {
      id: proj.id,
      name: proj.name,
      billingType: proj.billingType as ProjectDetail['billingType'],
      rate: proj.rate,
      budgetHours: proj.budgetHours,
      loggedHours: proj.loggedHours,
      status: proj.status as 'Active' | 'Inactive',
    };
  }

  /**
   * Updates a project. PM or Admin.
   */
  static async updateProject(
    role: string,
    id: string,
    data: { name?: string; billingType?: ProjectDetail['billingType']; rate?: string; budgetHours?: number; status?: 'Active' | 'Inactive'; clientId?: string }
  ): Promise<ProjectDetail> {
    if (role === 'Employee') {
      throw new Error('Access Denied: Employees cannot edit projects.');
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.billingType !== undefined && { billingType: data.billingType }),
        ...(data.rate !== undefined && { rate: data.rate }),
        ...(data.budgetHours !== undefined && { budgetHours: data.budgetHours }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      billingType: updated.billingType as ProjectDetail['billingType'],
      rate: role === 'Super Admin' ? updated.rate : 'RESTRICTED',
      budgetHours: updated.budgetHours,
      loggedHours: updated.loggedHours,
      status: updated.status as 'Active' | 'Inactive',
    };
  }
}
