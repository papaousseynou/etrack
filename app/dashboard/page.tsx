"use client";
import { Budget, Transaction } from "@/type";
import { useUser } from "@clerk/nextjs";
import { CircleDollarSign, Landmark, PiggyBank } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  getLastBudget,
  getLastTransaction,
  getReachedBudgets,
  getTotalTransactionAmount,
  getTotalTransactionCount,
  getUserBudgetsData,
} from "../action";
import BudgetItem from "../components/BudgetItem";
import TransactionItem from "../components/TransactionItem";
import Wrapper from "../components/Wrapper";

const Page = () => {
  const { user, isSignedIn } = useUser(); // Utilisez destructuring pour simplifier.
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [reachedBudgets, setReachedBudgets] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const fetchData = useCallback(async () => {
    if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return; // Vérifiez que l'utilisateur est connecté.

    setIsLoading(true);
    try {
      const email = user.primaryEmailAddress.emailAddress;
      const amount = await getTotalTransactionAmount(email);
      const count = await getTotalTransactionCount(email);
      const reached = await getReachedBudgets(email);
      const budgetsData = await getUserBudgetsData(email);
      const lastTransaction = await getLastTransaction(email);
      const lastBudget = await getLastBudget(email);
      setTotalAmount(amount);
      setTotalCount(count);
      setReachedBudgets(reached);
      setBudgetData(budgetsData);
      setTransactions(lastTransaction);
      setBudgets(lastBudget);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du montant total des transactions",
        error
      );
    } finally {
      setIsLoading(false); // S'assure que le chargement est toujours terminé.
    }
  }, [isSignedIn, user]); // Dépend de isSignedIn et user pour éviter les boucles.

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData est stable grâce à useCallback.
  // useEffect(() => {
  //   console.log("Données pour le graphique :", budgetData);
  // }, [budgetData]);
  console.log("Données pour le graphique :", budgetData);

  return (
    <Wrapper>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-2 border-base-300 p-5 flex justify-between items-center rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">
                  Total des transactions
                </span>
                <span className="text-2xl font-bold text-accent">
                  {totalAmount !== null ? `${totalAmount}$` : "N/A"}
                </span>
              </div>
              <CircleDollarSign className="bg-accent w-9 h-9 rounded-full p-1 text-white" />
            </div>
            <div className="border-2 border-base-300 p-5 flex justify-between items-center rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">
                  Nombre de transactions
                </span>
                <span className="text-2xl font-bold text-accent">
                  {totalCount !== null ? `${totalCount}` : "N/A"}
                </span>
              </div>
              <PiggyBank className="bg-accent w-9 h-9 rounded-full p-1 text-white" />
            </div>
            <div className="border-2 border-base-300 p-5 flex justify-between items-center rounded-xl">
              <div className="flex flex-col">
                <span className="text-gray-500 text-sm">Budgets atteints</span>
                <span className="text-2xl font-bold text-accent">
                  {reachedBudgets !== null ? `${reachedBudgets}` : "N/A"}
                </span>
              </div>
              <Landmark className="bg-accent w-9 h-9 rounded-full p-1 text-white" />
            </div>
          </div>
          <div className="w-full md:flex mt-4">
            <div className="md:w-2/3 rounded-xl">
              <div className="border-2 border-base-300 p-5 rounded-xl">
                <h3 className=" text-lg font-semibold mb-3">
                  Statistiques (en $)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="budgetName" />

                    <Tooltip />
                    <Bar
                      dataKey="budgetAmount"
                      name="Budget"
                      fill="#EF9FBC"
                      radius={[10, 10, 0, 0]}
                    />
                    <Bar
                      dataKey="totalTransactionsAmount"
                      name="Dépensé"
                      fill="#EEAF3A"
                      radius={[10, 10, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 border-2 border-base-300 p-5 rounded-xl">
                <h3 className="text-lg font-semibold mb-3 ">
                  Dernières transactions
                </h3>
                <ul className="divide-y divide-base-300">
                  {transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      // enableHover={1}
                    ></TransactionItem>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:w-1/3 ml-4">
              <h3 className="text-lg font-semibold my-4 md:mb-4 md:mt-0">
                Derniers Budgets
              </h3>
              <ul className="grid grid-cols-1 gap-4">
                {budgets.map((budget) => (
                  <Link href={`/manage/${budget.id}`} key={budget.id}>
                    <BudgetItem budget={budget} enableHover={1}></BudgetItem>
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default Page;
