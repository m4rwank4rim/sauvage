import React from "react";
import { dbStore } from "../../lib/db/store";
import { PortfolioGallery } from "../../components/PortfolioGallery";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const items = await dbStore.getAllPortfolio();
  return <PortfolioGallery items={items} />;
}
