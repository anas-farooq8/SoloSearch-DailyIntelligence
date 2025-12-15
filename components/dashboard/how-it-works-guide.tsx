"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface HowItWorksGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HowItWorksGuide({ open, onOpenChange }: HowItWorksGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[98vw] sm:max-w-none lg:max-w-3xl xl:max-w-4xl 2xl:max-w-[1100px] w-[94vw] sm:w-[90vw] lg:w-[85vw] max-h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col p-0"
        showCloseButton={false}
      >
        <DialogHeader className="px-4 sm:px-6 md:px-8 pt-3 sm:pt-5 pb-1.5 sm:pb-2.5 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                Solo Search – Daily Intelligence Engine
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-600 mt-1">
                How It Works: Sources, Signals & Scoring (Client Guide)
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 pb-3 sm:pb-4">
          <div className="space-y-4 sm:space-y-4 md:space-y-5 text-xs sm:text-sm text-slate-700">
            {/* Section 1 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                1. What the Daily Intelligence Engine Does (In Plain English)
              </h2>
              <p className="mb-2 sm:mb-3">
                The Daily Intelligence Engine scans a curated set of trusted sources every day and looks for signals that a company is likely to need to hire.
              </p>
              <p className="mb-2 sm:mb-3">
                Instead of you manually reading newsletters, articles, and contract notices, the engine:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4 mb-2 sm:mb-3">
                <li>Finds relevant opportunities</li>
                <li>Filters out noise</li>
                <li>Classifies what type of opportunity it is</li>
                <li>Scores it by urgency and relevance</li>
                <li>Presents the best ones in a simple dashboard</li>
              </ul>
              <p className="font-medium text-slate-900 text-sm sm:text-base">
                The goal is simple: Show you the right companies, at the right time, in the right order.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                2. The Three Types of Opportunities We Track (Signal Groups)
              </h2>
              <p className="mb-3 sm:mb-4">
                All opportunities fall into one of three groups, based on how strong the hiring signal is.
              </p>

              <div className="space-y-2 sm:space-y-2 md:space-y-2.5">
                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base md:text-lg">
                      <span>Group 1 – NHS Contracts</span>
                      <Badge variant="destructive" className="text-[10px] sm:text-xs w-fit">Highest urgency</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2 md:space-y-2.5 p-2 sm:p-2 md:p-2 pt-0">
                    <p className="text-xs sm:text-sm">These are confirmed NHS digital contracts or supplier awards.</p>
                    <div>
                      <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Why this matters:</p>
                      <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                        <li>NHS contracts usually mean immediate delivery work</li>
                        <li>Delivery work usually means hiring</li>
                        <li>Being early gives you a big advantage</li>
                      </ul>
                    </div>
                    <div className="mt-2 sm:mt-2 md:mt-2">
                      <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Examples:</p>
                      <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                        <li>NHS Trust awards a digital platform contract</li>
                        <li>Supplier announced for an NHS rollout</li>
                        <li>Multi-Trust or ICS-wide digital programme</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base md:text-lg">
                      <span>Group 2 – Startup Funding & Grants</span>
                      <Badge className="bg-amber-500 text-white text-[10px] sm:text-xs w-fit">Strong growth signal</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2 md:space-y-2.5 p-2 sm:p-2 md:p-2 pt-0">
                    <p className="text-xs sm:text-sm">These are funding or grant announcements that enable companies to grow.</p>
                    <div>
                      <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Why this matters:</p>
                      <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                        <li>Funding creates hiring capacity</li>
                        <li>Hiring often follows within weeks or months</li>
                        <li>Early conversations build strong relationships</li>
                      </ul>
                    </div>
                    <div className="mt-2 sm:mt-2 md:mt-2">
                      <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Examples:</p>
                      <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                        <li>HealthTech startup raises Seed / Series A funding</li>
                        <li>Innovate UK grant awarded for digital health project</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base md:text-lg">
                      <span>Group 3 – HealthTech Media Coverage</span>
                      <Badge className="bg-blue-500 text-white text-[10px] sm:text-xs w-fit">Early indicators</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2 md:space-y-2.5 p-2 sm:p-2 md:p-2 pt-0">
                    <p className="text-xs sm:text-sm">These are media articles that suggest activity before contracts or funding are formally announced.</p>
                    <div>
                      <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Why this matters:</p>
                      <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                        <li>Early signals = less competition</li>
                        <li>Helps build pipeline before everyone else reacts</li>
                      </ul>
                    </div>
                    <div className="mt-2 sm:mt-2 md:mt-2">
                      <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Examples:</p>
                      <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                        <li>NHS pilot or go-live announced</li>
                        <li>New partnership with NHS mentioned</li>
                        <li>Product launch into NHS or health system</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                3. Sources We Scan (and How They're Filtered)
              </h2>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm">
                We only scan relevant sections of each source and apply strict filters so you don't see irrelevant results.
              </p>

              <div className="space-y-2 sm:space-y-2 md:space-y-2.5">
                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="text-sm sm:text-base md:text-lg">NHS Contracts & Procurement Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2 md:space-y-2.5 p-2 sm:p-2 md:p-2 pt-0">
                    <Badge variant="outline" className="mb-1.5 sm:mb-1.5 md:mb-1.5 text-[10px] sm:text-xs">Used for Group 1 – NHS Contracts</Badge>
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">We only include items that:</p>
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                      <li>Are NHS or NHS-related buyers (Trusts, ICBs, NHS England)</li>
                      <li>Are digital / technology focused</li>
                      <li>Are confirmed awards or clear supplier announcements</li>
                      <li>Exclude estates, catering, cleaning, non-digital services</li>
                    </ul>
                    <p className="font-medium text-slate-900 italic text-xs sm:text-sm mt-2">
                      What you'll see: Only NHS digital contracts that could realistically lead to hiring.
                    </p>
                  </CardContent>
                </Card>

                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="text-sm sm:text-base md:text-lg">Funding & Grant Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2 md:space-y-2.5 p-2 sm:p-2 md:p-2 pt-0">
                    <Badge variant="outline" className="mb-1.5 sm:mb-1.5 md:mb-1.5 text-[10px] sm:text-xs">Used for Group 2 – Startup Funding & Grants</Badge>
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">We only include items that:</p>
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                      <li>Are HealthTech, Digital Health, or closely related</li>
                      <li>Are UK-based (or UK-relevant)</li>
                      <li>Represent meaningful funding or grants (not noise)</li>
                    </ul>
                    <p className="font-medium text-slate-900 italic text-xs sm:text-sm mt-2">
                      What you'll see: Companies that now have the budget and momentum to grow teams.
                    </p>
                  </CardContent>
                </Card>

                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="text-sm sm:text-base md:text-lg">HealthTech Media Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-2 md:space-y-2.5 p-2 sm:p-2 md:p-2 pt-0">
                    <Badge variant="outline" className="mb-1.5 sm:mb-1.5 md:mb-1.5 text-[10px] sm:text-xs">Used for Group 3 – HealthTech Media Coverage</Badge>
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">We only include articles that:</p>
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                      <li>Mention NHS, Trusts, or health systems</li>
                      <li>Suggest delivery work (rollout, go-live, implementation)</li>
                      <li>Name suppliers or partners where possible</li>
                    </ul>
                    <p className="font-medium text-slate-900 italic text-xs sm:text-sm mt-2">
                      What you'll see: Early-stage opportunities that others often miss.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                4. How Scoring Works (Simple & Transparent)
              </h2>
              <p className="mb-2 sm:mb-3 text-xs sm:text-sm">
                Every opportunity gets a score from 0 to 10.
              </p>
              <p className="mb-3 sm:mb-4 font-medium text-slate-900 text-xs sm:text-sm">
                The score helps you decide what to focus on first.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-3 md:p-3 mb-3 sm:mb-3 md:mb-3">
                <p className="font-semibold text-slate-900 mb-2 text-xs sm:text-sm">The Scoring Formula</p>
                <p className="text-sm sm:text-base md:text-lg font-mono bg-white p-2 sm:p-3 rounded border break-words">
                  Score = Base Score (by group) + Extra signals
                </p>
                <p className="text-[10px] sm:text-xs text-slate-600 mt-2">(Max score = 10)</p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                5. Base Scores (By Opportunity Type)
              </h2>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse border border-slate-300 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-left font-semibold">Group</th>
                      <th className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-left font-semibold">What It Represents</th>
                      <th className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-left font-semibold">Base Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-medium">NHS Contracts</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Immediate hiring signal</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold text-red-600">7</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-medium">Funding & Grants</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Near-term growth</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold text-amber-600">6</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-medium">Media Coverage</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Early indicator</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold text-blue-600">4</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 sm:mt-4 italic text-slate-600 text-xs sm:text-sm">
                This means: An NHS contract already starts high. Media mentions need stronger signals to rank highly.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                6. Extra Signals That Increase the Score (Modifiers)
              </h2>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm">
                Depending on the opportunity type, extra points are added if certain details are present.
              </p>

              <div className="space-y-2 sm:space-y-2 md:space-y-2.5">
                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="text-sm sm:text-base md:text-lg">For NHS Contracts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2 md:p-2 pt-0">
                    <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Extra points if:</p>
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                      <li>An NHS Trust / ICB is named</li>
                      <li>The contract is digital / tech-focused</li>
                      <li>The contract value is significant</li>
                      <li>It's a multi-Trust or ICS rollout</li>
                      <li>The delivery supplier is named</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="text-sm sm:text-base md:text-lg">For Funding & Grants</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2 md:p-2 pt-0">
                    <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Extra points if:</p>
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                      <li>It's clearly HealthTech / Digital Health</li>
                      <li>The funding amount is substantial</li>
                      <li>The company is UK-based</li>
                      <li>The article mentions scaling or growth plans</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="gap-2 sm:gap-2 md:gap-2 py-2 sm:py-2 md:py-2">
                  <CardHeader className="p-2 sm:p-2 md:p-2 pb-0.5 sm:pb-0.5 md:pb-0.5">
                    <CardTitle className="text-sm sm:text-base md:text-lg">For Media Coverage</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-2 md:p-2 pt-0">
                    <p className="font-semibold text-slate-900 mb-1 sm:mb-1.5 md:mb-1.5 text-xs sm:text-sm">Extra points if:</p>
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-0.5 ml-3 sm:ml-4 text-xs sm:text-sm">
                      <li>NHS involvement is explicit</li>
                      <li>Delivery language is used (rollout, go-live)</li>
                      <li>A supplier or partner is named</li>
                      <li>It's more than just a small pilot</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                7. What the Scores Mean for You
              </h2>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full border-collapse border border-slate-300 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-left font-semibold">Score</th>
                      <th className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-left font-semibold">Meaning</th>
                      <th className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-left font-semibold">Suggested Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-red-50">
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold">9–10</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">🔥 Very strong</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Call immediately</td>
                    </tr>
                    <tr className="bg-amber-50">
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold">7–8</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">✅ Strong</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Prioritise outreach</td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold">5–6</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">👀 Worth tracking</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Add to CRM / nurture</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-bold">Below 5</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">❌ Low relevance</td>
                      <td className="border border-slate-300 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">Hidden by default</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 sm:mt-4 italic text-slate-600 text-xs sm:text-sm">
                By default, the dashboard shows scores of 5 and above.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                8. Why This System Is Flexible
              </h2>
              <p className="mb-2 sm:mb-3 text-xs sm:text-sm">The scoring system is:</p>
              <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                <li>Not fixed forever</li>
                <li>Designed to be reviewed after real usage</li>
                <li>Easy to adjust without rebuilding anything</li>
              </ul>
              <p className="mb-2 sm:mb-3 text-xs sm:text-sm">Once the dashboard is live, you can:</p>
              <ul className="list-disc list-inside space-y-1 ml-3 sm:ml-4 text-xs sm:text-sm">
                <li>Increase or reduce the importance of certain signals</li>
                <li>Adjust thresholds</li>
                <li>Refine what "good" looks like for your business</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-3 md:p-3 rounded">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">
                9. The Key Principle to Remember
              </h2>
              <div className="space-y-1 sm:space-y-2">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  Filtering decides what is relevant.
                </p>
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  Scoring decides what is most urgent.
                </p>
                <p className="text-xs sm:text-sm">
                  You only see opportunities that already make sense for Solo Search — scoring simply helps you prioritise them.
                </p>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

