/**
 * Group 4
    Derryck Dowuona - GraphQL API for fetching Employee Data
    Christina Tresa Abraham - Employee Components (jsx)
    Dipkumar Gunvantkumar Rakholiya - Validation for EmployeeCreateForm & UserModel
    Harsh Rameshkumar Patel - EmployeeCreateForm & API for Inserting Employee
 */

import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { readFile } from "node:fs/promises"; //to read file in dir
import { GraphQLScalarType } from "graphql";
import { connectToDb, getDb } from "./db.js";

let db;

const app = express();

app.use(express.json());

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

const getNextItem = async () => {
  const count = await db.collection("employees").find({}).count();
  return count + 1;
};

const addEmployee = async (_root, { employee }) => {
  const eId = await getNextItem();
  const newEmployee = {
    id: eId,
    FirstName: employee.FirstName,
    LastName: employee.LastName,
    Age: employee.Age,
    DateOfJoining: new Date(employee.DateOfJoining),
    Title: employee.Title,
    Department: employee.Department,
    EmployeeType: employee.EmployeeType,
    CurrentStatus: 1,
  };
  const result = await db.collection("employees").insertOne(newEmployee);
  const savedEmp = await db
    .collection("employees")
    .findOne({ _id: result.insertedId });
  return savedEmp;
};

const getEmployeeDetails = async (_root, { id }) => {
  const employee = await db
    .collection("employees")
    .findOne({ id: parseInt(id) });
  // console.log("-----------");
  // console.log("employee", employee);
  return employee;
};

const deleteEmployee = async (_root, { id }) => {
  const result = await db
    .collection("employees")
    .deleteOne({ id: parseInt(id) });
  return result.deletedCount;
};

const resolvers = {
  Query: {
    employees: employeeList,
    employee: getEmployeeDetails,
  },
  Mutation: {
    addEmployee: addEmployee,
    deleteEmployee: deleteEmployee,
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
