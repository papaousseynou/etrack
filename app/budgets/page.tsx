"use client";

import { Budget } from "@/type";
import { useUser } from "@clerk/nextjs";
import EmojiPicker from "emoji-picker-react";
import { Landmark } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { addBudget, getBudgetsByUser } from "../action";
import BudgetItem from "../components/BudgetItem";
import Notification from "../components/Notification";
import Wrapper from "../components/Wrapper";

const Page = () => {
  const { user } = useUser();
  const [budgetName, setBudgetName] = useState<string>("");
  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [emojiSelected, setEmojiSelected] = useState<string>("");
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [notification, setNotification] = useState<string>("");

  const closeNotification = () => {
    setNotification("");
  };

  const handleEmojiSelect = (emojiObject: { emoji: string }) => {
    setEmojiSelected(emojiObject.emoji);
    setShowEmojiPicker(false);
  };
  const handleAddBudget = async () => {
    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Montant invalide");
        // return;
      }
      await addBudget(
        user?.primaryEmailAddress?.emailAddress as string,
        budgetName,
        amount,
        emojiSelected
      );
      fetchBudgets();
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      setNotification("Budget ajouté avec succès");
      setBudgetName("");
      setBudgetAmount("");
      setEmojiSelected("");
    } catch (error) {
      setNotification(`Erreur ${error}`);
    }
  };

  const fetchBudgets = async () => {
    if (user?.primaryEmailAddress?.emailAddress) {
      try {
        const userBudgets = await getBudgetsByUser(
          user?.primaryEmailAddress?.emailAddress
        );
        setBudgets(userBudgets);
      } catch (error) {
        setNotification(`Erreur lors de la recuperation des budgets ${error}`);
      }
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.primaryEmailAddress?.emailAddress]);
  return (
    <Wrapper>
      {notification && (
        <Notification
          message={notification}
          onclose={closeNotification}
        ></Notification>
      )}
      <button
        className="btn"
        onClick={() =>
          (
            document.getElementById("my_modal_3") as HTMLDialogElement
          ).showModal()
        }
      >
        Nouveau Budget
        <Landmark className="w-4" />
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Création d&apos;un Budget</h3>
          <p className="py-4">Permet de controler vos dépenses facilement</p>
          <div className="w-full flex flex-col">
            <input
              type="text"
              value={budgetName}
              placeholder="Nom du budget"
              onChange={(e) => setBudgetName(e.target.value)}
              className="input input-bordered mb-3"
              required
            />

            <input
              type="number"
              value={budgetAmount}
              placeholder="Montant du budget"
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="input input-bordered mb-3"
              required
            />
            {/* quand on click sur le button  le false devient true */}
            <button
              className="btn mb-4"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {emojiSelected || "Selectionner un emoji 👊"}
            </button>
            {showEmojiPicker && (
              <div className="flex justify-center items-center my-4">
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </div>
            )}

            <button onClick={handleAddBudget} className="btn">
              Ajouter un Budget
            </button>
          </div>
        </div>
      </dialog>
      <ul className="grid md:grid-cols-3 gap-4">
        {budgets.map((budget) => (
          <Link href={`/manage/${budget.id}`} key={budget.id}>
            {/* {budget.name} */}
            <BudgetItem budget={budget} enableHover={1} />
          </Link>
        ))}
      </ul>
    </Wrapper>
  );
};

export default Page;
