import type { Article, Filters } from "@/types/database"
import * as XLSX from "xlsx"

export async function exportToExcel(articles: Article[], filters: Filters) {
  const data = articles.map((article) => ({
    Score: article.lead_score,
    Title: article.title,
    Company: article.company,
    Buyer: article.buyer || "",
    Sectors: (article.sector || []).join(", "),
    Signals: (article.trigger_signal || []).join(", "),
    Summary: article.ai_summary || "",
    Amount: article.amount || "",
    Source: article.source,
    URL: article.url,
    Date: new Date(article.date).toLocaleDateString(),
    Region: article.location_region || "",
    Country: article.location_country || "",
    Tags: (article.tags || []).map((t) => t.name).join(", "),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads")

  const filename = `leads-export-${new Date().toISOString().split("T")[0]}.xlsx`
  XLSX.writeFile(workbook, filename)
}
