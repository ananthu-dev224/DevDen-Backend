import adminModel from "../model/adminSchema";



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
}