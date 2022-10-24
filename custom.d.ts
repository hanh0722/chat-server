declare namespace Express {
  export interface Request {
    token?: string;
    metaData?: {
      username?: string;
      _id?: string
    }
  }
} 
