import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbStore } from "../../../lib/db/store";
import { WorkDetailClient } from "./WorkDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await dbStore.getPortfolioItemById(params.id);
  if (!item) {
    return { title: "Project Not Found — SAUVAGE™" };
  }
  return {
    title: `${item.title} — SAUVAGE™ Portfolio`,
    description: item.description.slice(0, 155),
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const [item, all] = await Promise.all([
    dbStore.getPortfolioItemById(params.id),
    dbStore.getAllPortfolio(),
  ]);

  if (!item) notFound();

  const related =
    all.filter((i) => i.id !== item.id && i.category === item.category).slice(0, 3) ||
    [];

  return <WorkDetailClient item={item} related={related} />;
}