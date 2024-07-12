import userModel from "../model/userSchema";

import { userData } from "../types/types";

export class UserRepository {
  async addUser(userData: userData) {
    try {
      const newUser = new userModel({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name:userData.name,
        googleId:userData.googleId,
        createdAt: Date.now(),
      });
      const data = await newUser.save();
      return data;
    } catch (error: any) {
      console.log("DB error at addUser", error.message);
      throw new Error(`DB error at addUser : ${error.message}`);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await userModel.findOne({ email });
      return user;
    } catch (error: any) {
      console.log("DB error at User findByEmail", error.message);
      throw new Error(`DB error at User findByEmail : ${error.message}`);
    }
  }

  async findByUsername(username: string) {
    try {
      const user = await userModel.findOne({ username });
      return user;
    } catch (error: any) {
      console.log("DB error at User findByUsername", error.message);
      throw new Error(`DB error at User findByUsername : ${error.message}`);
    }
  }

  async findById(id: any) {
    try {
      const user = await userModel.findById(id);
      return user;
    } catch (error: any) {
      console.log("DB error at User findById", error.message);
      throw new Error(`DB error at User findById : ${error.message}`);
    }
  }

  async findOneAndUpdate(query: any, update: any) {
    try {
      const updatedUser = await userModel.findOneAndUpdate(query,update,{new:true});
      return updatedUser;
    } catch (error: any) {
      console.log("DB error at User findById", error.message);
      throw new Error(`DB error at User findById : ${error.message}`);
    }
  }

  async allUsers() {
    try {
      const users = await userModel.aggregate([
        {
          $project: {
            username: 1,
            email: 1,
            isActive: 1,
            createdAt: 1,
          }
        }
      ]);
  
      return users;
    } catch (error: any) {
      console.log("DB error at User allUsers", error.message);
      throw new Error(`DB error at User allUsers : ${error.message}`);
    }
  }
}