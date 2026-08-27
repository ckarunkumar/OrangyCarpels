import { prisma } from '../lib/prisma';

export interface ServiceItem {
  id: number;
  name: string;
  businessLineId?: number | null;
  status: string;
}

export interface BusinessLineItem {
  id: number;
  name: string;
  description?: string | null;
  status: string;
  services: ServiceItem[];
}

const DEFAULT_INVENTORY = [
  {
    name: 'Brand & Identity',
    description: 'Visual identity, design systems, and packaging design',
    services: ['Brand Identity', 'Brand Guidelines', 'Design System', 'Packaging Design', 'Motion Branding'],
  },
  {
    name: 'Product & UX Design',
    description: 'Digital product design, user research, and UI/UX solutions',
    services: ['UI/UX Design', 'User Research & Testing', 'Design Audit', 'Interaction Design', 'Mobile App Design'],
  },
  {
    name: 'Engineering & Tech',
    description: 'Frontend, mobile, and web application development',
    services: ['Frontend Engineering', 'Full-Stack Web Apps', 'Mobile App Development', 'Design-to-Code QA'],
  },
  {
    name: 'Strategy & Growth',
    description: 'Digital transformation, go-to-market design, and consulting',
    services: ['Design Strategy', 'Product Discovery', 'Content Strategy'],
  },
];

export class BusinessLineService {
  /**
   * Initializes default business lines if none exist in the database.
   */
  static async ensureDefaults(): Promise<void> {
    const count = await prisma.businessLine.count();
    if (count === 0) {
      for (const item of DEFAULT_INVENTORY) {
        await prisma.businessLine.create({
          data: {
            name: item.name,
            description: item.description,
            status: 'Active',
            services: {
              create: item.services.map((name) => ({ name, status: 'Active' })),
            },
          },
        });
      }
    }
  }

  /**
   * Returns all business lines with their nested services.
   */
  static async getAll(): Promise<BusinessLineItem[]> {
    await this.ensureDefaults();
    const list = await prisma.businessLine.findMany({
      include: { services: true },
      orderBy: { id: 'asc' },
    });
    return list.map((bl) => ({
      id: bl.id,
      name: bl.name,
      description: bl.description || '',
      status: bl.status,
      services: bl.services.map((s) => ({
        id: s.id,
        name: s.name,
        businessLineId: s.businessLineId,
        status: s.status,
      })),
    }));
  }

  /**
   * Creates a new business line.
   */
  static async createBusinessLine(role: string, name: string, description?: string): Promise<BusinessLineItem> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can manage Business Lines.');
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Business Line name is required.');

    const existing = await prisma.businessLine.findUnique({ where: { name: cleanName } });
    if (existing) throw new Error(`Business Line "${cleanName}" already exists.`);

    const created = await prisma.businessLine.create({
      data: { name: cleanName, description: description?.trim() || '', status: 'Active' },
      include: { services: true },
    });
    return { id: created.id, name: created.name, description: created.description, status: created.status, services: [] };
  }

  /**
   * Updates an existing business line.
   */
  static async updateBusinessLine(role: string, id: number, name?: string, description?: string, status?: string): Promise<BusinessLineItem> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can edit Business Lines.');
    const updated = await prisma.businessLine.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(status !== undefined && { status }),
      },
      include: { services: true },
    });
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      services: updated.services.map((s) => ({ id: s.id, name: s.name, businessLineId: s.businessLineId, status: s.status })),
    };
  }

  /**
   * Deletes a business line.
   */
  static async deleteBusinessLine(role: string, id: number): Promise<{ success: boolean }> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can delete Business Lines.');
    await prisma.businessLine.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Creates a service under a business line.
   */
  static async createService(role: string, businessLineId: number, name: string): Promise<ServiceItem> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can add Services.');
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Service name is required.');

    const created = await prisma.service.create({
      data: { name: cleanName, businessLineId, status: 'Active' },
    });
    return { id: created.id, name: created.name, businessLineId: created.businessLineId, status: created.status };
  }

  /**
   * Updates an existing service.
   */
  static async updateService(role: string, id: number, name?: string, status?: string): Promise<ServiceItem> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can edit Services.');
    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(status !== undefined && { status }),
      },
    });
    return { id: updated.id, name: updated.name, businessLineId: updated.businessLineId, status: updated.status };
  }

  /**
   * Deletes a service.
   */
  static async deleteService(role: string, id: number): Promise<{ success: boolean }> {
    if (role !== 'Super Admin') throw new Error('Access Denied: Only Super Admins can delete Services.');
    await prisma.service.delete({ where: { id } });
    return { success: true };
  }
}
