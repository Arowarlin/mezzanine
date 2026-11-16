export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
