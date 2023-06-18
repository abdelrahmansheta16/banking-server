import { gql } from 'apollo-server';

const typeDefs = gql`
    type User{
        id:String
        name:String
        email:String
        currentBalance:Int
        recievedTransactions:[Transaction]
        sentTransactions:[Transaction]
    }
    scalar Date
    type Transaction{
        id:String
        date:Date
        from:User
        senderId:String
        to:User
        recieverId:String
        amount:Int
        status:String
    }
    input UserInput{
        name:String!
        email:String!
        currentBalance:Int!
    }
    input TransactionInput{
        senderId:String!
        recieverId:String!
        amount:Int!
    }
    type Query{
        users:[User]
        user(id:ID!):User
        transactions:[Transaction]
    }
    type Mutation{
        addUser(user:UserInput!):User
        addTransaction(transaction:TransactionInput!):Transaction
    }
`;

export default typeDefs