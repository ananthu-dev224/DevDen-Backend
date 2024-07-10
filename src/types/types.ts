
export interface userData {
    username:String,
    email:String,
    password?:String,
    name?:String,
    googleId?:String
}

export interface userPayload {
    userId:String,
    role:String
}

export interface adminPayload {
    adminId?: string,
    role?: string
}