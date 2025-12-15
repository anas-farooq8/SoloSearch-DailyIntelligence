import type { Article, Filters } from "@/types/database"
import ExcelJS from "exceljs"

export async function exportToExcel(articles: Article[], filters: Filters) {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Leads")

  // Define columns with styling
  worksheet.columns = [
    { header: "Score", key: "score", width: 10 },
    { header: "Title", key: "title", width: 50 },
    { header: "Company", key: "company", width: 25 },
    { header: "Group", key: "group", width: 25 },
    { header: "Buyer", key: "buyer", width: 22 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Solution", key: "solution", width: 25 },
    { header: "Sectors", key: "sectors", width: 30 },
    { header: "Signals", key: "signals", width: 30 },
    { header: "Why This Matters", key: "why", width: 60 },
    { header: "Outreach Angle", key: "outreach", width: 50 },
    { header: "Additional Details", key: "details", width: 60 },
    { header: "Source", key: "source", width: 20 },
    { header: "URL", key: "url", width: 45 },
    { header: "Processed (Updated)", key: "processed", width: 22 },
    { header: "Publication Date", key: "date", width: 18 },
    { header: "Region", key: "region", width: 18 },
    { header: "Country", key: "country", width: 12 },
    { header: "Tags", key: "tags", width: 28 },
  ]

  // Style the header row
  worksheet.getRow(1).font = { bold: true, size: 12 }
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" }, // Slate-800
  }
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" }
  worksheet.getRow(1).height = 20

  // Add data rows
  articles.forEach((article) => {
    const row = worksheet.addRow({
      score: article.lead_score,
      title: article.title,
      company: article.company,
      group: article.group_name || "",
      buyer: article.buyer || "",
      amount: article.amount || "",
      solution: article.solution || "",
      sectors: (article.sector || []).join(", "),
      signals: (article.trigger_signal || []).join(", "),
      why: article.why_this_matters || "",
      outreach: article.outreach_angle || "",
      details: article.additional_details || "",
      source: article.source,
      url: article.url,
      processed: article.updated_at ? new Date(article.updated_at).toLocaleString() : "",
      date: article.date ? new Date(article.date).toLocaleDateString() : "",
      region: article.location_region || "",
      country: article.location_country || "",
      tags: (article.tags || []).map((t) => t.name).join(", "),
    })

    // Color code rows based on lead score
    const score = article.lead_score
    if (score >= 8) {
      // High priority - light red
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFECACA" }, // Red-200
      }
    } else if (score >= 6) {
      // High interest - light green
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9F99D" }, // Lime-200
      }
    } else if (score >= 4) {
      // Monitor - light blue
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFBAE6FD" }, // Sky-200
      }
    }

    // Make URL clickable
    const urlCell = row.getCell("url")
    urlCell.value = {
      text: article.url,
      hyperlink: article.url,
    }
    urlCell.font = { color: { argb: "FF2563EB" }, underline: true }
  })

  // Auto-filter on all columns
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 14 },
  }

  // Generate filename and download
  const filename = `leads-export-${new Date().toISOString().split("T")[0]}.xlsx`
  
  // Write to browser (client-side download)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}
