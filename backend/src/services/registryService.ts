import { prisma } from '../lib/prisma';
import { NotificationService } from './notificationService';

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
  billingType: 'T&M' | 'Fixed RC' | 'Fixed PC' | 'Hourly Rate (T&M)' | 'Monthly Resource Cost (Fixed)' | 'Monthly Res Cost (Fixed)' | 'Project Cost (Fixed)';
  rate: string; // Gated financial data
  startDate?: string;
  endDate?: string;
  budgetHours: number;
  loggedHours: number;
  status: 'Active' | 'Inactive';
  managerId?: string;
  managerName?: string;
  assignedEmployees?: string[];
}

export interface ProjectWithClient extends ProjectDetail {
  clientId: string;
  clientName: string;
  clientCurrency: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  legalName?: string;
  displayName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  accountsPerson?: string;
  accountsEmail?: string;
  accountsPhone?: string;
  address?: string;
  country?: string;
  cinNumber?: string;
  gstNumber?: string;
  panNumber?: string;
  msmeNumber?: string;
  billingCurrency: string;
  defaultBillingType: 'T&M' | 'Fixed RC' | 'Fixed PC' | 'Hourly Rate (T&M)' | 'Monthly Resource Cost (Fixed)' | 'Project Cost (Fixed)';
  dueTime?: string;
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
      employeeId: emp.employeeId || `AODE${String(emp.id).padStart(4, '0')}`,
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
    let targetEmpId = data.employeeId?.trim();
    if (!targetEmpId) {
      let nextNum = count + 1;
      targetEmpId = `AODE${String(nextNum).padStart(4, '0')}`;
      while (await prisma.employee.findUnique({ where: { employeeId: targetEmpId } })) {
        nextNum++;
        targetEmpId = `AODE${String(nextNum).padStart(4, '0')}`;
      }
    }
    const cleanEmail = data.email.trim().toLowerCase();

    // Check duplicate Emp ID
    const existingEmpId = await prisma.employee.findUnique({ where: { employeeId: targetEmpId } });
    if (existingEmpId) {
      throw new Error(`Emp ID "${targetEmpId}" already exists. Please enter a unique Emp ID.`);
    }

    // Check duplicate Email
    const existingEmail = await prisma.employee.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      throw new Error(`Email address "${cleanEmail}" is already registered to another employee.`);
    }

    const emp = await prisma.employee.create({
      data: {
        employeeId: targetEmpId,
        fullName: data.fullName.trim(),
        dob: data.dob?.trim() || '',
        designation: data.designation?.trim() || 'Team Member',
        department: data.department?.trim() || 'General',
        email: cleanEmail,
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
        avatar: data.avatar || null,
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

    if (data.employeeId) {
      const cleanEmpId = data.employeeId.trim();
      const duplicateEmpId = await prisma.employee.findFirst({ where: { employeeId: cleanEmpId, NOT: { id } } });
      if (duplicateEmpId) {
        throw new Error(`Emp ID "${cleanEmpId}" already exists. Please enter a unique Emp ID.`);
      }
    }

    if (data.email) {
      const cleanEmail = data.email.trim().toLowerCase();
      const duplicateEmail = await prisma.employee.findFirst({ where: { email: cleanEmail, NOT: { id } } });
      if (duplicateEmail) {
        throw new Error(`Email address "${cleanEmail}" is already registered to another employee.`);
      }
    }

    const emp = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.employeeId !== undefined && { employeeId: data.employeeId.trim() }),
        ...(data.fullName !== undefined && { fullName: data.fullName.trim() }),
        ...(data.dob !== undefined && { dob: data.dob.trim() }),
        ...(data.designation !== undefined && { designation: data.designation.trim() }),
        ...(data.department !== undefined && { department: data.department.trim() }),
        ...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
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
        ...(data.avatar !== undefined && { avatar: data.avatar }),
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
      name: client.displayName || client.name,
      legalName: client.legalName || client.name,
      displayName: client.displayName || client.name,
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      phone: client.phone || '',
      accountsPerson: client.accountsPerson || '',
      accountsEmail: client.accountsEmail || '',
      accountsPhone: client.accountsPhone || '',
      address: client.address || '',
      country: client.country || 'India',
      cinNumber: client.cinNumber || '',
      gstNumber: client.gstNumber || '',
      panNumber: client.panNumber || '',
      msmeNumber: client.msmeNumber || '',
      billingCurrency: client.billingCurrency,
      defaultBillingType: (client.defaultBillingType as ClientProfile['defaultBillingType']) || 'T&M',
      dueTime: client.dueTime || '30 days',
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
      legalName?: string;
      displayName?: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      accountsPerson?: string;
      accountsEmail?: string;
      accountsPhone?: string;
      address?: string;
      country?: string;
      cinNumber?: string;
      gstNumber?: string;
      panNumber?: string;
      msmeNumber?: string;
      billingCurrency: string;
      defaultBillingType?: string;
      dueTime?: string;
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
      let nextNum = count + 1;
      targetId = `AODC${String(nextNum).padStart(4, '0')}`;
      while (await prisma.client.findUnique({ where: { id: targetId } })) {
        nextNum++;
        targetId = `AODC${String(nextNum).padStart(4, '0')}`;
      }
    }

    const displayName = data.displayName?.trim() || data.name?.trim() || '';
    const legalName = data.legalName?.trim() || data.name?.trim() || '';
    const name = displayName || legalName;

    const client = await prisma.client.create({
      data: {
        id: targetId,
        name,
        legalName,
        displayName,
        contactPerson: data.contactPerson?.trim() || '',
        email: data.email?.trim() || '',
        phone: data.phone?.trim() || '',
        accountsPerson: data.accountsPerson?.trim() || '',
        accountsEmail: data.accountsEmail?.trim() || '',
        accountsPhone: data.accountsPhone?.trim() || '',
        address: data.address?.trim() || '',
        country: data.country?.trim() || 'India',
        cinNumber: data.cinNumber?.trim().toUpperCase() || '',
        gstNumber: data.gstNumber?.trim().toUpperCase() || '',
        panNumber: data.panNumber?.trim().toUpperCase() || '',
        msmeNumber: data.msmeNumber?.trim().toUpperCase() || '',
        billingCurrency: data.billingCurrency || 'USD ($)',
        defaultBillingType: data.defaultBillingType || 'T&M',
        dueTime: data.dueTime || '30 days',
        status: data.status || 'Active',
      },
    });

    return {
      id: client.id,
      name: client.displayName || client.name,
      legalName: client.legalName || client.name,
      displayName: client.displayName || client.name,
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      phone: client.phone || '',
      accountsPerson: client.accountsPerson || '',
      accountsEmail: client.accountsEmail || '',
      accountsPhone: client.accountsPhone || '',
      address: client.address || '',
      country: client.country || 'India',
      cinNumber: client.cinNumber || '',
      gstNumber: client.gstNumber || '',
      panNumber: client.panNumber || '',
      msmeNumber: client.msmeNumber || '',
      billingCurrency: client.billingCurrency,
      defaultBillingType: (client.defaultBillingType as ClientProfile['defaultBillingType']) || 'T&M',
      dueTime: client.dueTime || '30 days',
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
      legalName?: string;
      displayName?: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      accountsPerson?: string;
      accountsEmail?: string;
      accountsPhone?: string;
      address?: string;
      country?: string;
      cinNumber?: string;
      gstNumber?: string;
      panNumber?: string;
      msmeNumber?: string;
      billingCurrency?: string;
      defaultBillingType?: string;
      dueTime?: string;
      status?: 'Active' | 'Inactive';
    }
  ): Promise<ClientProfile> {
    if (role !== 'Super Admin') {
      throw new Error('Access Denied: Only Super Admins can edit client entities.');
    }

    const displayName = data.displayName !== undefined ? data.displayName.trim() : undefined;
    const legalName = data.legalName !== undefined ? data.legalName.trim() : undefined;
    const name = displayName !== undefined ? displayName : (data.name !== undefined ? data.name.trim() : undefined);

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(legalName !== undefined && { legalName }),
        ...(displayName !== undefined && { displayName }),
        ...(data.contactPerson !== undefined && { contactPerson: data.contactPerson.trim() }),
        ...(data.email !== undefined && { email: data.email.trim() }),
        ...(data.phone !== undefined && { phone: data.phone.trim() }),
        ...(data.accountsPerson !== undefined && { accountsPerson: data.accountsPerson.trim() }),
        ...(data.accountsEmail !== undefined && { accountsEmail: data.accountsEmail.trim() }),
        ...(data.accountsPhone !== undefined && { accountsPhone: data.accountsPhone.trim() }),
        ...(data.address !== undefined && { address: data.address.trim() }),
        ...(data.country !== undefined && { country: data.country.trim() }),
        ...(data.cinNumber !== undefined && { cinNumber: data.cinNumber.trim().toUpperCase() }),
        ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber.trim().toUpperCase() }),
        ...(data.panNumber !== undefined && { panNumber: data.panNumber.trim().toUpperCase() }),
        ...(data.msmeNumber !== undefined && { msmeNumber: data.msmeNumber.trim().toUpperCase() }),
        ...(data.billingCurrency !== undefined && { billingCurrency: data.billingCurrency }),
        ...(data.defaultBillingType !== undefined && { defaultBillingType: data.defaultBillingType }),
        ...(data.dueTime !== undefined && { dueTime: data.dueTime }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: { projects: true },
    });

    return {
      id: updated.id,
      name: updated.displayName || updated.name,
      legalName: updated.legalName || updated.name,
      displayName: updated.displayName || updated.name,
      contactPerson: updated.contactPerson || '',
      email: updated.email || '',
      phone: updated.phone || '',
      accountsPerson: updated.accountsPerson || '',
      accountsEmail: updated.accountsEmail || '',
      accountsPhone: updated.accountsPhone || '',
      address: updated.address || '',
      country: updated.country || 'India',
      cinNumber: updated.cinNumber || '',
      gstNumber: updated.gstNumber || '',
      panNumber: updated.panNumber || '',
      msmeNumber: updated.msmeNumber || '',
      billingCurrency: updated.billingCurrency,
      defaultBillingType: (updated.defaultBillingType as ClientProfile['defaultBillingType']) || 'T&M',
      dueTime: updated.dueTime || '30 days',
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
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      budgetHours: proj.budgetHours,
      loggedHours: proj.loggedHours,
      status: proj.status as 'Active' | 'Inactive',
      clientId: proj.clientId,
      clientName: proj.client.displayName || proj.client.name,
      clientCurrency: proj.client.billingCurrency,
      managerId: proj.managerId || '',
      managerName: proj.managerName || '',
      assignedEmployees: proj.assignedEmployees ? proj.assignedEmployees.split(',').filter(Boolean) : [],
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
    budgetHours: number,
    startDate?: string,
    endDate?: string,
    id?: string,
    managerId?: string,
    managerName?: string,
    assignedEmployees?: string[] | string
  ): Promise<ProjectDetail> {
    if (role === 'Employee') {
      throw new Error('Access Denied: Employees cannot create projects.');
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) throw new Error('Client not found.');

    let projId = id?.trim();
    if (!projId) {
      const count = await prisma.project.count();
      let nextNum = count + 1;
      projId = `AODP${String(nextNum).padStart(4, '0')}`;
      while (await prisma.project.findUnique({ where: { id: projId } })) {
        nextNum++;
        projId = `AODP${String(nextNum).padStart(4, '0')}`;
      }
    } else {
      const existing = await prisma.project.findUnique({ where: { id: projId } });
      if (existing) {
        throw new Error(`Project ID "${projId}" already exists. Please enter a unique Project ID.`);
      }
    }

    const empStr = Array.isArray(assignedEmployees) ? assignedEmployees.join(',') : (assignedEmployees || '');

    const proj = await prisma.project.create({
      data: {
        id: projId,
        name: name.trim(),
        billingType,
        rate,
        startDate: startDate || '',
        endDate: endDate || '',
        budgetHours: budgetHours || 0,
        status: 'Active',
        clientId,
        managerId: managerId || '',
        managerName: managerName || '',
        assignedEmployees: empStr,
      },
    });

    await NotificationService.createNotification({
      role: 'Employee',
      title: 'New Project Assigned',
      message: `You have been assigned to project "${proj.name}" (${proj.id}).`,
      type: 'project_assign',
    });

    return {
      id: proj.id,
      name: proj.name,
      billingType: proj.billingType as ProjectDetail['billingType'],
      rate: proj.rate,
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      budgetHours: proj.budgetHours,
      loggedHours: proj.loggedHours,
      status: proj.status as 'Active' | 'Inactive',
      managerId: proj.managerId || '',
      managerName: proj.managerName || '',
      assignedEmployees: proj.assignedEmployees ? proj.assignedEmployees.split(',').filter(Boolean) : [],
    };
  }

  /**
   * Updates a project. PM or Admin.
   */
  static async updateProject(
    role: string,
    id: string,
    data: {
      name?: string;
      billingType?: ProjectDetail['billingType'];
      rate?: string;
      startDate?: string;
      endDate?: string;
      budgetHours?: number;
      status?: 'Active' | 'Inactive';
      clientId?: string;
      managerId?: string;
      managerName?: string;
      assignedEmployees?: string[] | string;
    }
  ): Promise<ProjectDetail> {
    if (role === 'Employee') {
      throw new Error('Access Denied: Employees cannot edit projects.');
    }

    const empStr = data.assignedEmployees !== undefined
      ? (Array.isArray(data.assignedEmployees) ? data.assignedEmployees.join(',') : data.assignedEmployees)
      : undefined;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.billingType !== undefined && { billingType: data.billingType }),
        ...(data.rate !== undefined && { rate: data.rate }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.budgetHours !== undefined && { budgetHours: data.budgetHours }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.managerId !== undefined && { managerId: data.managerId }),
        ...(data.managerName !== undefined && { managerName: data.managerName }),
        ...(empStr !== undefined && { assignedEmployees: empStr }),
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      billingType: updated.billingType as ProjectDetail['billingType'],
      rate: role === 'Super Admin' ? updated.rate : 'RESTRICTED',
      startDate: updated.startDate || '',
      endDate: updated.endDate || '',
      budgetHours: updated.budgetHours,
      loggedHours: updated.loggedHours,
      status: updated.status as 'Active' | 'Inactive',
      managerId: updated.managerId || '',
      managerName: updated.managerName || '',
      assignedEmployees: updated.assignedEmployees ? updated.assignedEmployees.split(',').filter(Boolean) : [],
    };
  }
}
