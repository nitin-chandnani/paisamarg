// Written explainer + FAQs shown under selected calculators.
// Shared by the app (rendered below the calculator) and scripts/prerender.mjs
// (baked into the static HTML + FAQPage structured data).
// House style: plain sentences, no dashes as punctuation.

export const CONTENT = {
  tax: {
    intro: "Put in your salary and deductions to see which regime leaves you paying less tax. Figures are for Tax Year 2026-27.",
    sections: [
      {
        h: "How we work out your tax",
        p: [
          "For the new regime we take your salary, knock off the ₹75,000 standard deduction and apply this year's slabs. Nothing is taxed up to ₹4 lakh. After that it's 5%, 10%, 15%, 20% and 25% on each ₹4 lakh band, and 30% on anything above ₹24 lakh. Budget 2026 left these slabs as they were.",
          "If what's left after the standard deduction is ₹12 lakh or less, a rebate wipes the tax out completely. Go slightly over ₹12 lakh and you don't get the full bill either, because your tax can't be more than the amount you crossed ₹12 lakh by. So ₹12.1 lakh of taxable income means ₹10,000 of tax, not ₹61,500.",
          "For the old regime we take off the ₹50,000 standard deduction plus whatever you claim under 80C, 80D and HRA, then apply the old slabs: 5% from ₹2.5 lakh, 20% from ₹5 lakh and 30% above ₹10 lakh. Both regimes add 4% health and education cess on top.",
          "The Income-tax Act, 2025 gave these sections new numbers from April 2026. Most payslips and HR portals still say 80C and 80D, so we've kept those names.",
        ],
      },
      {
        h: "Which regime usually wins",
        p: [
          "For most salaried people it's the new one, and it isn't close. Take a ₹15 lakh salary. The new regime tax is ₹97,500. The old regime, with a full ₹1.5 lakh in 80C and ₹25,000 of health insurance, comes to ₹2,02,800.",
          "The old regime only pulls ahead when your deductions are big. On our numbers you need roughly ₹5.5 lakh of deductions at a ₹15 lakh salary, about ₹7 lakh at ₹20 lakh and around ₹8 lakh from ₹25 lakh upwards. That's on top of the standard deduction, and it usually takes a home loan, a large HRA claim or both, plus a full 80C.",
          "If you're nowhere near those figures, don't buy tax saving products just to make the old regime work. You'll usually end up worse off.",
        ],
      },
    ],
    faqs: [
      { q: "Is income up to ₹12 lakh really tax free?",
        a: "Under the new regime, yes, as long as we're talking about taxable income. For a salaried person that means a salary of up to ₹12.75 lakh, because the ₹75,000 standard deduction comes off first. The rebate doesn't cover income taxed at special rates, such as capital gains on shares, so that part is still taxed." },
      { q: "Can I switch between regimes every year?",
        a: "If your income is from salary, yes. You make the final choice when you file your return, whatever you told your employer at the start of the year. People with business income have far less freedom to switch back and forth." },
      { q: "Which regime applies if I don't choose?",
        a: "The new regime. If you don't tell your employer otherwise, they'll deduct tax from your salary under it." },
      { q: "Does the calculator include surcharge?",
        a: "No. It assumes your income is under ₹50 lakh, where there's no surcharge. Above that, treat the result as a rough guide." },
      { q: "What does it leave out?",
        a: "Home loan interest, your own NPS contributions, rental income and the separate slabs for senior citizens aren't in this version. Also note that the HRA box wants the exempt part of your HRA, not the full allowance. If any of this applies to you, check the final figure with a CA." },
    ],
    related: ["ctc", "prepay", "emi"],
  },

  ctc: {
    intro: "Enter the CTC from your offer letter to see roughly what lands in your bank account each month under the new tax regime.",
    sections: [
      {
        h: "Why your monthly pay is less than CTC divided by 12",
        p: [
          "CTC is everything the company spends on you in a year. It isn't what you get paid. A few things sit inside it that never reach your account.",
          "Employer PF is the obvious one. It goes into your PF account, not your salary. Your own PF contribution also comes out of every payslip. Then there's professional tax in most states, around ₹2,400 to ₹2,500 a year, and the income tax your employer deducts each month.",
          "Some companies also count gratuity as part of CTC, usually about 4.8% of basic. You normally only get it after five years of service, so if your offer letter lists it, take it out of the CTC before you use this calculator.",
          "With our default settings a ₹12 lakh CTC works out to about ₹96,200 a month, and ₹20 lakh to about ₹1,47,200.",
        ],
      },
      {
        h: "What we assume",
        p: [
          "Basic at 40% of CTC and HRA at 20%. You can change both with the sliders.",
          "PF on the ₹15,000 a month wage ceiling, which is ₹1,800 a month from you and ₹1,800 from your employer. Plenty of companies take 12% of your full basic instead. If yours does, your take home will be lower than what you see here.",
          "The new tax regime only, since that's where most salaried people end up. HRA, LTA and meal allowances don't save tax under it. They just change how your pay is split. If you claim a lot of deductions, run your numbers through the income tax calculator as well.",
        ],
      },
      {
        h: "The one thing worth asking HR about",
        p: [
          "The new regime has done away with almost every deduction. Employer contribution to NPS is the exception. Your employer can put up to 14% of your basic into NPS and none of it is taxed as your income.",
          "At a ₹20 lakh CTC that saves about ₹23,000 a year in tax. Your monthly take home drops a little, because that money goes into NPS, where most of it stays until retirement. Not every employer offers it, but it costs nothing to ask.",
        ],
      },
    ],
    faqs: [
      { q: "Is a ₹12 lakh CTC tax free?",
        a: "Usually, yes. After employer PF and the ₹75,000 standard deduction come off, taxable salary on a ₹12 lakh CTC is around ₹11 lakh, which is under the ₹12 lakh rebate limit. Income tax is zero. You still pay PF and professional tax." },
      { q: "Why doesn't this match my payslip exactly?",
        a: "Every company structures pay a bit differently. Variable pay, insurance premiums, food card deductions and the way your employer calculates PF all move the number. Use this to compare offers or check you're in the right range, and go by your payslip for the exact figure." },
      { q: "Is my bonus part of CTC?",
        a: "Often it is, as variable pay you may or may not get in full. Leave it out of the CTC box and add it under Annual Bonus instead, so your monthly figure isn't inflated." },
      { q: "How should I compare two job offers?",
        a: "Run both CTCs with the same basic and PF settings and compare the monthly take home, not the headline number. Then look at what the number doesn't show: health insurance, how much of the pay is variable, and whether gratuity has been counted in." },
    ],
    related: ["tax", "emi", "sip"],
  },

  prepay: {
    intro: "Thinking of putting a bonus or some savings into your home loan? See how much interest it saves and how much sooner the loan ends.",
    sections: [
      {
        h: "How the calculator works",
        p: [
          "We work out your EMI from the loan amount, rate and tenure, then run the loan month by month. When you prepay, the money comes straight off what you still owe. Your EMI stays the same and the loan finishes earlier. That's the option that saves the most interest, and most banks let you choose it.",
          "Here's an example. On a ₹50 lakh loan at 8.5% for 20 years, the EMI is ₹43,391 and you'd pay about ₹54 lakh in interest over the life of the loan. Prepay ₹5 lakh after three years and you save around ₹13 lakh of interest and finish about three and a half years early.",
          "Timing matters a lot. Make the same ₹5 lakh payment in year 12 instead and the saving falls to about ₹4 lakh. In the early years most of each EMI is interest, so money you put in then does the most work.",
          "Small amounts add up too. Paying just ₹5,000 extra every month on that same loan saves close to ₹14 lakh and cuts more than four years.",
        ],
      },
      {
        h: "Prepay or invest?",
        p: [
          "This is the real question for most people. Prepaying gives you a guaranteed return equal to your loan rate. Investing might earn more, but nothing is guaranteed.",
          "A rough rule: if your loan rate is higher than what you'd realistically earn after tax somewhere safe, prepay. If you have a long horizon and you're comfortable with the ups and downs of equity, investing can come out ahead. That only works if the money actually gets invested and doesn't get spent.",
          "Before doing either, keep about six months of expenses aside. Money you put into a home loan is hard to get back out.",
          "One tax point. If you're on the old regime, interest on a loan for the home you live in is deductible up to ₹2 lakh a year, and prepaying shrinks that deduction, so your real saving is a bit lower. On the new regime there's no such deduction for a home you live in, so the saving you see is the saving you get.",
        ],
      },
    ],
    faqs: [
      { q: "Will my bank charge me for prepaying?",
        a: "If it's a floating rate home loan taken by you as an individual, generally no. RBI doesn't allow banks or NBFCs to charge prepayment fees on floating rate loans to individuals for non business purposes. Fixed rate loans can still carry a charge, so check your loan agreement first." },
      { q: "Should I reduce my EMI or my tenure?",
        a: "Reducing the tenure saves more interest, and that's what this calculator shows. Reducing the EMI makes sense if your monthly budget is tight or you think your income might drop." },
      { q: "Is it better to prepay early or late in the loan?",
        a: "Early. In the first few years most of your EMI goes to interest, so a prepayment then cuts much more of it. Near the end of a loan, prepaying saves very little." },
      { q: "What if my interest rate changes?",
        a: "Most home loans are floating, so your rate will move. The calculator uses one rate for the whole loan, so treat the result as an estimate. The main point, that early prepayments save the most, holds whatever the rate does." },
    ],
    related: ["emi", "ctc", "tax"],
  },
};
