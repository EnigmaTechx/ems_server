import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { readFile } from "node:fs/promises"; //to read file in dir
import { GraphQLScalarType } from "graphql";
import { connectToDb, getDb } from "./db.js";

let db;

const app = express();

app.use(express.json());

// testing
// const employees = [
//   {
//     FirstName: "John",
//     LastName: "Doe",
//     Age: 30,
//     DateOfJoining: new Date(),
//     Title: "Software Engineer",
//     Department: "IT",
//     EmployeeType: "Permanent",
//     CurrentStatus: 1,
//   },
//   {
//     FirstName: "Jane",
//     LastName: "Doe",
//     Age: 25,
//     DateOfJoining: new Date(),
//     Title: "Software Engineer",
//     Department: "IT",
//     EmployeeType: "Permanent",
//     CurrentStatus: 1,
//   },
// ];

const typeDefs = await readFile("./employee_schema.graphql", "utf-8");

const GraphQlDateResolver = new GraphQLScalarType({
  name: "GraphQlDate",
  description: "A GraphQL Date Type",
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const newDate = new Date(value);
    return isNaN(newDate) ? undefined : newDate;
  },
});

const employeeList = async () => {
  const employees = await db.collection("employees").find({}).toArray();
  return employees;
};

const addEmployee = async (_root, { newEmp }) => {
  const newEmployee = {
    FirstName: newEmp.FirstName,
    LastName: newEmp.LastName,
    Age: newEmp.Age,
    DateOfJoining: newEmp.DateOfJoining,
    Title: newEmp.Title,
    Department: newEmps.Department,
    EmployeeType: newEmp.EmployeeType,
    CurrentStatus: newEmp.CurrentStatus,
  };
  const result = await db.collection("employees").insertOne(newEmployee);
  const savedEmp = await db
    .collection("employees")
    .findOne({ _id: result.insertedId });
  return savedEmp;
};

const resolvers = {
  Query: {
    employees: employeeList,
  },
  Mutation: {
    addEmployee: addEmployee,
  },
  GraphQlDate: GraphQlDateResolver,
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

await apolloServer.start();

app.use("/graphql", expressMiddleware(apolloServer));

connectToDb((url, err) => {
  if (!err) {
    app.listen(5003, () => {
      console.log("Server started on port 5003");
      console.log("GraphQl Server started on http://localhost:5003/graphql");
      console.log("Connected to MongoDb at ", url);
    });
    db = getDb();
  }
});