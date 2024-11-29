"use client";

import {
  addTransactionsByBudgetId,
  deleteBudget,
  deleteTransaction,
  getTransactionsByBudgetId,
} from "@/app/action";
import BudgetItem from "@/app/components/BudgetItem";
import Notification from "@/app/components/Notification";
import Wrapper from "@/app/components/Wrapper";
import { Budget, Transaction } from "@prisma/client";
import { Send, Trash } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

type BudgetWithTransactions = Budget & {
  transactions: Transaction[];
};

const Page = ({ params }: { params: Promise<{ budgetId: string }> }) => {
  // const resolvedParams = await params;

  const [budgetId, setBudgetId] = useState<string>("");
  const [budget, setBudget] = useState<BudgetWithTransactions>();
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const [notification, setNotification] = useState<string>("");

  const closeNotification = () => {
    setNotification("");
  };
  async function fetchBudgetData(budgetId: string) {
    try {
      if (budgetId) {
        const budgetData = await getTransactionsByBudgetId(budgetId);
        setBudget(budgetData);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du budget et des transactions:",
        error
      );
    }
  }

  useEffect(() => {
    const getId = async () => {
      const resolvedParams = await params;
      setBudgetId(resolvedParams.budgetId);
      fetchBudgetData(resolvedParams.budgetId);
    };
    getId();
  }, [params]);

  async function handleAddTransaction() {
    if (!description || !amount) {
      setNotification("Veuillez remplir tous les champs");
      return;
    }
    try {
      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Le montant doit être un nombre positif.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newTransaction = await addTransactionsByBudgetId(
        budgetId,
        amountNumber,
        description
      );
      setNotification("Transaction ajoutée avec succès");
      fetchBudgetData(budgetId);
      setDescription("");
      setAmount("");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setNotification("Vous avez dépassé votre budget");
    }
  }

  // async function handleDeleteBudget() {
  //   await deleteBudget(budgetId);
  //   // router.push("/budgets");
  //   window.location.href = "/budgets";
  // }
  const handleDeleteBudget = async () => {
    const comfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce budget et toutes ses transactions associées ?"
    );
    if (comfirmed) {
      try {
        await deleteBudget(budgetId);
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
      redirect("/budjets");
    }
  };

  // async function handleDeleteTransaction(transactionId: string) {
  //   await deleteTransaction(transactionId);
  //   fetchBudgetData(budgetId);
  // }
  const handleDeleteTransaction = async (transactionId: string) => {
    const comfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette transaction ?"
    );
    if (comfirmed) {
      try {
        await deleteTransaction(transactionId);
        fetchBudgetData(budgetId);
        setNotification("Dépense supprimée");
      } catch (error) {
        console.error("Erreur lors de la suppression du budget:", error);
      }
    }
  };

  return (
    <Wrapper>
      {notification && (
        <Notification
          message={notification}
          onclose={closeNotification}
        ></Notification>
      )}
      {budget && (
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <BudgetItem budget={budget} enableHover={0} />
            <button onClick={handleDeleteBudget} className="btn mt-4">
              Supprimer le budget
            </button>
            <div className="space-y-4 mt-4 flex flex-col">
              <input
                type="text"
                id="description"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input input-bordered"
                required
              />
              <input
                type="number"
                id="amount"
                placeholder="Montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input input-bordered"
                required
              />
              <button className="btn" onClick={handleAddTransaction}>
                Ajouter votre dépense
              </button>
            </div>
          </div>
          {budget?.transactions && budget.transactions.length > 0 ? (
            <div className="overflow-x-auto md:mt-0 mt-4 md:w-2/3 ml-4">
              <table className="table table-zebra">
                {/* head */}
                <thead>
                  <tr>
                    <th>1</th>
                    <th>Description</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budget?.transactions?.map((transaction: Transaction) => (
                    <tr key={transaction.id}>
                      <td className="text-lg md:text-3xl">
                        {transaction.emoji}
                      </td>
                      <td>
                        <div className="badge badge-accent badge-xs md:badge-sm">
                          -{transaction.amount}$
                        </div>
                      </td>
                      <td className=" ">{transaction.description}</td>
                      <td>
                        {transaction.createdAt.toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        {transaction.createdAt.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          className="btn btn-sm btn-error"
                        >
                          <Trash className="w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="md:w-2/3 mt-10 md:ml-4 flex items-center justify-center">
              <Send strokeWidth={1.5} className="w-8 h-8 text-accent" />
              <span className="text-gray-500 ml-2">
                Aucune transaction trouvée
              </span>
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
};

export default Page;
