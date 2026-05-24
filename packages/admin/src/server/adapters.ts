export interface AdminDbAdapter {
  user: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    count: (args?: any) => Promise<number>;
  };
  role: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  userInvitation: {
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  $transaction?: (operations: any[]) => Promise<any>;
}

export function createPrismaAdapter(prisma: any): AdminDbAdapter {
  return {
    user: {
      findMany: (args) => prisma.user.findMany(args),
      findUnique: (args) => prisma.user.findUnique(args),
      create: (args) => prisma.user.create(args),
      update: (args) => prisma.user.update(args),
      delete: (args) => prisma.user.delete(args),
      count: (args) => prisma.user.count(args),
    },
    role: {
      findMany: (args) => prisma.role.findMany(args),
      findUnique: (args) => prisma.role.findUnique(args),
      create: (args) => prisma.role.create(args),
      update: (args) => prisma.role.update(args),
      delete: (args) => prisma.role.delete(args),
    },
    userInvitation: {
      findMany: (args) => prisma.userInvitation.findMany(args),
      findUnique: (args) => prisma.userInvitation.findUnique(args),
      create: (args) => prisma.userInvitation.create(args),
      update: (args) => prisma.userInvitation.update(args),
      delete: (args) => prisma.userInvitation.delete(args),
    },
    $transaction: (ops) => prisma.$transaction(ops),
  };
}
