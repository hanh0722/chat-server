declare namespace Express {
  export interface UserMetaData {
    username?: string;
    _id?: string;
  }

  export interface Request {
    token?: string;
    metaData?: UserMetaData
  }
} 
