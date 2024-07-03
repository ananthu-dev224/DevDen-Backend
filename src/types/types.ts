
export interface userData {
    username:String,
    email:String,
    password:String,
}

export interface userPayload {
    userId:String,
    role:String
}

export interface adminPayload {
    adminId?: string,
    role?: string
}