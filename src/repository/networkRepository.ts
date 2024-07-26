import networkModel from "../model/networkSchema";



export class NetworkRepository {
    async addNetwork(userId: string, followerId: string) {
        try {
          // Add follower to user's followers list
          await networkModel.updateOne(
            { userId },
            { $addToSet: { following: followerId } },
            { upsert: true }
          );
    
          // Add user to follower's following list
          await networkModel.updateOne(
            { userId: followerId },
            { $addToSet: { followers: userId } },
            { upsert: true }
          );
        } catch (error: any) {
          console.log("DB error at addNetwork", error.message);
          throw new Error(`DB error at addNetwork: ${error.message}`);
        }
      }
    
      async removeNetwork(userId: string, followerId: string) {
        try {
          // Remove follower from user's followers list
          await networkModel.updateOne(
            { userId },
            { $pull: { following: followerId } }
          );
    
          // Remove user from follower's following list
          await networkModel.updateOne(
            { userId: followerId },
            { $pull: { followers: userId } }
          );
        } catch (error: any) {
          console.log("DB error at removeNetwork", error.message);
          throw new Error(`DB error at removeNetwork: ${error.message}`);
        }
      }

      async getFollowers(userId: string) {
        try {
          const network = await networkModel.findOne({ userId }).populate({
            path: 'followers',
            select: 'username name dp'
          });
          return network ? network.followers : [];
        } catch (error: any) {
          console.log("DB error at getFollowers", error.message);
          throw new Error(`DB error at getFollowers: ${error.message}`);
        }
      }
    
      async getFollowing(userId: string) {
        try {
          const network = await networkModel.findOne({ userId }).populate({
            path: 'following',
            select: 'username name dp'
        });
          return network ? network.following : [];
        } catch (error: any) {
          console.log("DB error at getFollowing", error.message);
          throw new Error(`DB error at getFollowing: ${error.message}`);
        }
      }
}