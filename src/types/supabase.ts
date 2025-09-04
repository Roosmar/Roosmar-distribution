export type Commande = {
  id?: string;
  client_name: string;
  total_amount: number;
  status?: "pending" | "completed" | "cancelled";
  created_at?: string;
  updated_at?: string;
};

export type Database = {
  commandes: Commande;
  // Ajoute d’autres tables ici si besoin
};
