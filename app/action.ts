"use server";

import prisma from "@/lib/prisma";

export const checkAndAddUser = async (email: string | undefined) => {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      await prisma.user.create({
        data: { email },
      });
      console.log("Utilisateur créé avec succes");
    } else {
      console.log("Utilisateur deja existant");
    }
  } catch (error) {
    console.log("Erreur lors de la verification de l'utilisateur", error);
  }
};


export const addBudget = async (
  email: string,
  name: string,
  amount: number,
  selectedEmoji: string
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    await prisma.budget.create({
      data: {
        name,
        amount,
        emoji: selectedEmoji,
        userId: user.id,
      },
    });
  } catch (error) {
    console.log("Erreur lors de l'ajout du budget", error);
    throw error;
  }
};

export const getBudgetsByUser = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email },
      include: {
        budgets:  {
         include:{
          transactions:true
          
        }
        },
      },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user.budgets;
  } catch (error) {
    console.log("Erreur lors de la recuperation des budgets", error);
    throw error;
  }
};

export const getTransactionsByBudgetId = async (budgetId: string) => {
  try {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        transactions: true,
      },
    });
    if (!budget) {
      throw new Error("Budget non trouvé");
    }
    return budget;
  } catch (error) {
    console.log("Erreur lors de la recuperation des transactions", error);
    throw error;
  }
};

export const addTransactionsByBudgetId = async (budgetId: string ,amount: number, description: string) => {
   try {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        transactions: true,
      },
    });
    if (!budget) {
      throw new Error("Budget non trouvé");
    }
    const totalTransactions = budget.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalTransactionsWithNewTransaction = totalTransactions + amount;
    if (totalTransactionsWithNewTransaction > budget.amount) {
      throw new Error("Le montant de la transaction dépasse le budget");
    } 
     const newTransaction = await prisma.transaction.create({
      data: {
        amount,
        description, 
        emoji: budget.emoji,
        budget:{
          connect:{ 
            id: budgetId,
          },
        },
      },
     });
     return newTransaction;
   } catch (error) {
    console.log("Erreur lors de l'ajout de la transaction", error);
    throw error; 
    
   }
  
}

export const deleteBudget= async (budgetId: string) => {
  try {
    await prisma.transaction.deleteMany({
      where: { id: budgetId },
    });

    await prisma.budget.delete({
      where: { id: budgetId },
    });

  } catch (error) {
    console.log("Erreur lors de la suppression du budget", error);
    throw error;
  }
}

 export const deleteTransaction= async (transactionId: string) => {
  try {
    const transaction = await prisma.transaction.findUnique ({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new Error("Transaction non trouvé");
    }
    await prisma.transaction.delete({
      where: { id: transactionId },
    });
  } catch (error) {
    console.log("Erreur lors de la suppression de la transaction", error);
    throw error;
  }
}

export const getTransactionsByEmailAndPeriod = async (email: string, period: string) => {
  try {
    const now = new Date();
    let dateLimit 
    switch (period) {
      case "last30days":
        dateLimit = new Date()
        dateLimit.setDate(now.getDate() - 30)
        break;

      case "last90days":
        dateLimit = new Date()
        dateLimit.setDate(now.getDate() - 90)
        break;

      case "last7days":
        dateLimit = new Date()
        dateLimit.setDate(now.getDate() - 7)
        break;
      case "last365days":
        dateLimit = new Date()
        dateLimit.setFullYear(now.getFullYear() - 1)
        break;

      default:
        throw new Error("Periode invalide");
    }

     const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          include: {
            transactions: {
              where: {
                createdAt: {
                  gte: dateLimit,
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
     });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    const transactions = user.budgets.flatMap((budget) => budget.transactions.map((transaction) => ({
      ...transaction,
      budgetName: budget.name,
      budgetId: budget.id,
    })));
    return transactions;
  } catch (error) {
    console.log("Erreur lors de la recuperation des transactions", error);
    throw error;
  }
}

//dashbord

export async function getTotalTransactionAmount(email: string) {
  try {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      budgets: {
        include: {
          transactions: true,
        },
      },
    },
  });
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  const totalAmount = user.budgets.reduce((sum, budgets) => {
    return sum + budgets.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, 0);
  return totalAmount;

  } catch (error) {
    console.log("Erreur lors de la recuperation du montant total des transactions", error);
    throw error;
  }

}

export async function getTotalTransactionCount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets: {
          include: {
            transactions: true, 
          },
        },
      },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    const totalCount = user.budgets.reduce((count, budget) => count + budget.transactions.length, 0);
    return totalCount;
  } catch (error) {
    console.log("Erreur lors de la recuperation du nombre total des transactions", error);
    throw error;
    
  }
}

export async function getReachedBudgets(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        budgets:{
          include: {
            transactions: true,
          },
        }
      },
    }); 
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    const totalBudgets=user.budgets.length
    const reachedBudgets = user.budgets.filter((budget) => {
      const totalTransactionsAmount = budget.transactions?.reduce((sum: number, transaction: { amount: number }) => sum + transaction.amount, 0);
      return totalTransactionsAmount >= budget.amount;
    }).length
    return `${reachedBudgets}/${totalBudgets}`;
  } catch (error) {
    console.log("Erreur lors de la recuperation des budgets atteints", error);
    throw error;
  }
}
  
  export async function getUserBudgetsData(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          budgets: {
            include: {
              transactions: true,
            },
          },
        },
      });
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }
      const data = user.budgets.map((budget) => {
        const totalTransactionsAmount = budget.transactions.reduce((sum, transaction) => sum + transaction.amount, 0); 
        return {
         budgetName: budget.name,
         budgetAmount: budget.amount,
         totalTransactionsAmount,
        };
      });
      return data;
    } catch (error) {
      console.log("Erreur lors de la recuperation des données des budgets", error);
      throw error;
      
    }
  }

  export async function getLastTransaction(email: string) {
    try {
    const transactions = await prisma.transaction.findMany({
      where: {
        budget: {
          user: {
            email: email,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        budget: {
          select: {
            name: true,
          },
        },
      },
    });
   
    const transactionsWithBudgetName = transactions.map(transaction =>({
      ...transaction,  budgetName:transaction.budget?.name || 'N/A',
    }))
    return transactionsWithBudgetName;
  } catch (error) {
    console.log("Erreur lors de la recuperation de la dernière transaction", error);
    throw error;
  }
}

export async function getLastBudget(email: string) {
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        user: {
          email
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        transactions: true,
      },
    });
    return budgets;
  } catch (error) {
    console.log("Erreur lors de la recuperation du dernier budget", error);
    throw error;
  }
}

