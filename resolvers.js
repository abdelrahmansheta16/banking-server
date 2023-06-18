import { ApolloServer } from '@apollo/server';
import { PrismaClient } from '@prisma/client'
import { ApolloError } from 'apollo-server';
import { PubSub, withFilter } from 'graphql-subscriptions';

const prisma = new PrismaClient()


const resolvers = {
    Query: {
        transactions: async (parent, args, context) => {
            const transactions = await prisma.transaction.findMany({
                include:{
                    from:true,
                    to:true
                }
            })
            return transactions
        },
        users: async (parent, args, context) => {
            const users = await prisma.user.findMany({
                include:{
                    recievedTransactions:true,
                    sentTransactions:true
                }
            })
            return users
        },
        user: async (parent, { id }, context) => {
            const user = await prisma.user.findFirst({
                where: {
                    id: id
                },
                include: {
                    recievedTransactions: true,
                    sentTransactions: true
                }
            })
            return user
        },

    },
    Mutation: {
        addUser: async (_, { user }) => {
            console.log(user)
            const newUser = await prisma.user.create({
                data: {
                    name:user.name,
                    email:user.email,
                    currentBalance:user.currentBalance,
                    recievedTransactions:{},
                    sentTransactions:{}
                }
            })
            console.log(newUser)
            return newUser
        },
        addTransaction: async (_, { transaction }) => {
            const sender = await prisma.user.findFirst({
                where: {
                    id: transaction.senderId
                }
            })
            if(sender.currentBalance > transaction.amount){
                const newTransaction = await prisma.transaction.create({
                    data: {
                        amount: transaction.amount,
                        from: {
                            connect: {
                                id: transaction.senderId
                            }
                        },
                        to: {
                            connect: {
                                id: transaction.recieverId
                            }
                        }
                    }
                })
                const sender = await prisma.user.update({
                    where:{
                        id:transaction.senderId
                    },
                    data: {
                        currentBalance: {
                            decrement: transaction.amount,
                        }
                    },
                })
                const reciever = await prisma.user.update({
                    where: {
                        id: transaction.recieverId
                    },
                    data: {
                        currentBalance: {
                            increment: transaction.amount,
                        }
                    },
                })
                console.log(newTransaction)
                return newTransaction
            } else {
                throw new Error("Insufficient funds")
            }
            
        }
    }
}

export default resolvers