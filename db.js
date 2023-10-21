import { mongoose } from "mongoose";
import { MongoClient } from "mongodb";
const url =
  "mongodb+srv://admin:ems23@cluster0.1kx86v1.mongodb.net/ems?retryWrites=true&w=majority";

let db;

const connectToDb = (callback) => {
  MongoClient.connect(url)
    .then((client) => {
      db = client.db();
      return callback(url);
    })
    .catch((err) => {
      console.log(err);
      return callback(url, err);
    });
};

const getDb = () => {
  return db;
};

const EmployeeSchema = mongoose.Schema({
  FirstName: { type: String, required: true },
  LastName: { type: String, required: true },
  Age: { type: Number, required: true },
  DateOfJoining: { type: Date, required: true },
  Title: { type: String, required: true },
  Department: { type: String, required: true },
  EmployeeType: { type: String, required: true },
  CurrentStatus: { type: Number, required: true, default: 1 },
});

const EmployeeModel = mongoose.model("employees", EmployeeSchema);

export default EmployeeModel;
export { connectToDb, getDb };
