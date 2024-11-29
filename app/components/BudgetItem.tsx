import { Budget } from "@/type";
import React from "react";

interface BudgetItemProps {
  budget: Budget;
  enableHover?: number;
}

const BudgetItem: React.FC<BudgetItemProps> = ({ budget, enableHover }) => {
  const transactionCount = budget.transactions ? budget.transactions.length : 0;
  const totalTransactionAmount = budget.transactions
    ? budget.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      )
    : 0;
  const remainingAmount = budget.amount - totalTransactionAmount;

  const progressValue =
    totalTransactionAmount > budget.amount
      ? 100
      : (totalTransactionAmount / budget.amount) * 100;

  const hoverClasse =
    enableHover === 1 ? "hover:shadow-xl hover:border-accent" : "";
  return (
    <li
      key={budget.id}
      className={`p-4 rounded-xl border-2 border-base-300 list-none mt-4 ${hoverClasse}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-accent/20 rounded-full text-xl h-10 w-10 flex items-center justify-center">
            {budget.emoji}
          </div>
          <div className="flex flex-col ml-3">
            <span className="text-xl font-bold">{budget.name}</span>
            <span className="text-sm text-gray-500">
              {transactionCount} transaction(s)
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-xl font-bold text-accent">
            {remainingAmount}$
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span className="text-sm text-gray-500">
          {totalTransactionAmount}$ dépensés
        </span>
        <span className="text-sm text-gray-500">
          {remainingAmount}$ restant
        </span>
      </div>
      <div className="">
        <progress
          className="progress progress-warning w-full mt-4"
          value={progressValue}
          max="100"
        ></progress>
      </div>
    </li>
  );
};

export default BudgetItem;
