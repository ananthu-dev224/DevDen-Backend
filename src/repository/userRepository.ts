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
      console.log("DB error at User findOneAndUpdate", error.message);
      throw new Error(`DB error at User findOneAndUpdate : ${error.message}`);
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

  async activeUsers() {
    try {
      const users = await userModel.find({isActive:true})
      return users;
    } catch (error: any) {
      console.log("DB error at User activeUsers", error.message);
      throw new Error(`DB error at User activeUsers : ${error.message}`);
    }
  }

  async getUsersJoinedMonthly () {
    try {
      const result = await userModel.aggregate([
        {
          $addFields: {
            createdAtDate: {
              $toDate: { $toLong: "$createdAt" }
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAtDate" },
              month: { $month: "$createdAtDate" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);
  
      // Fill missing months with 0 
      const monthlyData = Array(12).fill(0);
      result.forEach((item: { _id: { month: number; }; count: any; }) => {
        const monthIndex = item._id.month - 1;
        monthlyData[monthIndex] = item.count;
      });
  
      return monthlyData;
    } catch (error: any) {
      console.log("DB error at User getUsersJoinedMonthly", error.message);
      throw new Error(`DB error at User getUsersJoinedMonthly : ${error.message}`);
    }
  }

  async searchUsers(query:string) {
    try {
      const users = await userModel.aggregate([
        {
          $match: {
              $or: [
                  { username: { $regex: `^${query}`, $options: 'i' } },
                  { name: { $regex: `^${query}`, $options: 'i' } }
              ]
          }
      },
      {
          $limit: 10  
      }
      ]);
  
      return users;
    } catch (error: any) {
      console.log("DB error at User searchUsers", error.message);
      throw new Error(`DB error at User searchUsers : ${error.message}`);
    }
  }
}