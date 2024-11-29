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

