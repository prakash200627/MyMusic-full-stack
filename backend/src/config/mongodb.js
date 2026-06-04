import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
        console.error("MongoDB error event:", err.message);
    });

    try {
        await mongoose.connect(process.env.MONGODB_URL);
    } catch (err) {
        console.error("\n❌ MongoDB Connection Failed!");
        console.error("Error Details:", err.message);
        console.error("\n💡 How to resolve this:");
        console.error("1. Check your internet connection (required for MongoDB Atlas cloud clusters).");
        console.error("2. If your network blocks MongoDB Atlas DNS, try switching to a public DNS (like Google 8.8.8.8 or Cloudflare 1.1.1.1).");
        console.error("3. Ensure your current IP is whitelisted in your MongoDB Atlas console.");
        console.error("4. To work offline, install MongoDB locally and update backend/.env to: MONGODB_URL=\"mongodb://localhost:27017\"\n");
    }
}

export default connectDB;
