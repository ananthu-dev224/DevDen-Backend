import adminModel from "../model/adminSchema";
import userModel from "../model/userSchema";


export class AdminRepository {
  async findByEmail(email: string) {
    try {
      const admin = await adminModel.findOne({ email });
      return admin;
    } catch (error: any) {
      console.log("DB error at Admin findByEmail", error.message);
      throw new Error(`DB error at Admin findByEmail : ${error.message}`);
    }
  }

  async allUsers() {
    try {
      const users = await userModel.aggregate([
        {
          $project: {
            _id:0,
            username: 1,
            email: 1,
            isActive: 1,
            createdAt: 1,
            image: 1
          }
        }
      ]);
  
      return users;
    } catch (error: any) {
      console.log("DB error at Admin allUsers", error.message);
      throw new Error(`DB error at Admin allUsers : ${error.message}`);
    }
  }
}