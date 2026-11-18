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
  emi: {
    intro: "Check the monthly EMI and total interest on a home, car or personal loan before you sign anything.",
    sections: [
      {
        h: "How the EMI is worked out",
        p: [
          "We use the standard reducing balance formula that banks use. Each month you're charged interest only on what you still owe, so early EMIs are mostly interest and later ones are mostly principal.",
          "On a ₹50 lakh home loan at 8.5% for 20 years, the EMI is ₹43,391. Over the full term you'd pay about ₹54 lakh in interest, which is more than the loan itself. Most people are surprised by that number the first time they see it.",
        ],
      },
      {
        h: "Tenure and rate matter more than you'd think",
        p: [
          "Stretching the same loan to 30 years drops the EMI to ₹38,446, which feels easier. But total interest jumps to about ₹88 lakh. Cutting it to 15 years pushes the EMI up to ₹49,237 and brings interest down to roughly ₹39 lakh.",
          "The rate works the same way. At 9.5% instead of 8.5%, that ₹50 lakh loan costs ₹46,607 a month and about ₹7.7 lakh more in interest over 20 years. A small difference in rate is worth negotiating for, or worth switching lenders over.",
          "A sensible approach is to pick the shortest tenure whose EMI you can pay comfortably even in a bad month, and prepay whenever you have spare money. Our prepayment calculator shows what that saves.",
        ],
      },
    ],
    faqs: [
      { q: "How much EMI can I afford?",
        a: "Most lenders get uneasy once all your EMIs together go past about 40% to 50% of your take home pay. For your own comfort, staying well under that leaves room for savings and surprises." },
      { q: "Does this include processing fees or insurance?",
        a: "No. It shows the loan itself. Processing fees, GST on them and any loan insurance the bank adds are extra, so ask for them in writing before you compare offers." },
      { q: "My rate is floating. Is this still accurate?",
        a: "It's accurate for the rate you enter today. When a floating rate changes, banks usually adjust the tenure first and keep your EMI the same, so rerun the numbers whenever your rate moves." },
      { q: "Is it better to take a longer tenure and prepay later?",
        a: "It can work if you're disciplined, since a longer tenure gives you a lower compulsory EMI. The risk is that the prepayments never happen and you end up paying far more interest." },
    ],
    related: ["prepay", "ctc", "cardemi"],
  },

  cardemi: {
    intro: "Find out what a credit card EMI really costs once interest, GST and the processing fee are added up.",
    sections: [
      {
        h: "What you actually pay",
        p: [
          "A card EMI has three costs. There's the interest the bank charges. There's 18% GST on that interest. And there's usually a one time processing fee, which also has 18% GST on it. The headline rate only tells you about the first one.",
          "Say you convert a ₹1 lakh purchase into 12 EMIs at 16% with a 1% processing fee. The interest comes to ₹8,877, GST on it adds ₹1,598 and the fee with GST is ₹1,180. All in, the EMI costs you ₹11,655, about 11.7% of what you bought.",
        ],
      },
      {
        h: "How no cost EMI works",
        p: [
          "With a no cost EMI the bank still charges interest. The seller or brand gives you a discount equal to that interest, so the two cancel out. What they don't cancel is the GST on the interest, and often a processing fee as well.",
          "To check one properly, enter the bank's real interest rate here rather than 0%, and ignore the interest line because the discount covers it. The GST and the fee are what the no cost EMI really costs you. On a ₹60,000 phone over six months at 15%, the GST alone is close to ₹500.",
          "Also check whether you'd get a bigger discount by paying in full. Some sellers only offer their best price to people who don't take the EMI.",
        ],
      },
    ],
    faqs: [
      { q: "Is a card EMI cheaper than just carrying a balance?",
        a: "Usually, yes, by a lot. If you only pay the minimum due, card finance charges often run at around 3% to 3.75% a month, which is over 40% a year. An EMI at 14% to 18% plus GST is far cheaper than that." },
      { q: "Does converting to EMI affect my credit limit?",
        a: "Yes. The full amount is usually blocked from your limit and frees up as you pay each EMI. Keep that in mind if you rely on the card for other spending." },
      { q: "Can I close a card EMI early?",
        a: "Most banks allow it, but many charge a foreclosure fee plus GST. Check your bank's terms before you assume closing early will save money." },
      { q: "What happens if I miss an EMI?",
        a: "You'll pay a late fee and interest, and the missed payment can show up on your credit report. Setting up auto debit for at least the EMI amount avoids most of this." },
    ],
    related: ["emi", "ctc", "sip"],
  },

  sip: {
    intro: "See what a monthly SIP or a one time lumpsum could grow to over the years, at a return you choose.",
    sections: [
      {
        h: "How we calculate it",
        p: [
          "For a SIP we assume you invest the same amount at the start of every month and that it grows at a steady yearly rate, compounded monthly. For a lumpsum it's a single amount compounded once a year.",
          "At ₹10,000 a month for 15 years at 12%, you'd put in ₹18 lakh and end up with about ₹50.5 lakh. Give it 20 years and it's close to ₹1 crore on ₹24 lakh invested. Most of that extra comes in the last few years, which is why starting early matters more than starting big.",
        ],
      },
      {
        h: "Be careful with the return you pick",
        p: [
          "Real markets don't return a neat 12% every year. Some years are up 30%, some are down 20%, and the average only shows up over long periods. Treat any single figure as a planning assumption, not a forecast.",
          "It's worth running a more cautious number too. The same ₹10,000 a month for 15 years at 10% comes to about ₹41.8 lakh, roughly ₹9 lakh less than at 12%. If your plan only works at the optimistic rate, it's a fragile plan.",
          "The figures here are before tax. Gains on equity funds held over a year are taxed at 12.5% above ₹1.25 lakh of gains a year, and at 20% if you sell within a year.",
        ],
      },
    ],
    faqs: [
      { q: "SIP or lumpsum, which is better?",
        a: "If you already have the money, a lumpsum has more time in the market and often ends up higher. A SIP spreads your entry over many months, which takes the timing worry away and suits money that comes in from your salary. For most people it's the SIP, simply because that's how they earn." },
      { q: "What return should I assume?",
        a: "For an equity fund over 10 years or more, 10% to 12% is a common planning range. For debt funds, something closer to FD rates is more realistic. Run both a hopeful and a cautious number." },
      { q: "Does this account for inflation?",
        a: "No. ₹50 lakh in 15 years won't buy what ₹50 lakh buys today. If you're planning for a goal like retirement, the FIRE calculator builds inflation in." },
      { q: "Can I increase my SIP every year?",
        a: "Yes, and it makes a big difference, but this calculator keeps the amount fixed. Think of the result as the floor you'd reach without ever raising it." },
    ],
    related: ["fire", "ppf", "fd"],
  },

  fd: {
    intro: "Work out the maturity value and interest on a fixed deposit or recurring deposit.",
    sections: [
      {
        h: "How FD and RD interest is calculated",
        p: [
          "For an FD we compound interest every quarter, which is how most Indian banks do it. That's why a 7.1% FD actually earns a little more than 7.1% a year. ₹5 lakh at 7.1% for five years grows to about ₹7.11 lakh.",
          "For an RD we treat each monthly deposit as earning interest from the month it goes in. ₹10,000 a month for five years at 7.1% comes to around ₹7.2 lakh on ₹6 lakh deposited. Banks usually compound RDs quarterly, so your bank's figure may differ slightly from ours.",
        ],
      },
      {
        h: "Tax on FD interest",
        p: [
          "FD and RD interest is added to your income and taxed at your slab rate. It isn't tax free, even though the bank pays it out in full when the interest is below the TDS limit.",
          "Banks deduct TDS once the interest you earn from that bank in a year goes above ₹50,000, or ₹1 lakh if you're a senior citizen. If your total income is low enough that you owe no tax, you can submit Form 121, which replaced Forms 15G and 15H from April 2026, so the bank doesn't deduct it.",
          "After tax and inflation, an FD often only just keeps your money's value steady. That's fine for an emergency fund or money you'll need in a year or two. For longer goals it's worth comparing with PPF and other options.",
        ],
      },
    ],
    faqs: [
      { q: "Is a cumulative or a payout FD better?",
        a: "A cumulative FD reinvests the interest, so it grows more. A monthly or quarterly payout FD suits people who need the income to live on, such as retirees." },
      { q: "Are senior citizen rates included?",
        a: "Enter whatever rate your bank offers you. Most banks pay senior citizens around 0.5% more, so use that rate if it applies." },
      { q: "Is my FD safe?",
        a: "Deposits in a bank are insured by DICGC up to ₹5 lakh per person per bank, covering principal and interest together. Above that, spreading money across banks lowers the risk." },
      { q: "What happens if I break an FD early?",
        a: "Most banks pay a lower rate for the period you actually held it and may take off a penalty of around 0.5% to 1%. Check before you lock in money you might need." },
    ],
    related: ["ppf", "sip", "tax"],
  },

  ppf: {
    intro: "See what your PPF account could be worth at maturity, and what happens if you extend it.",
    sections: [
      {
        h: "How PPF grows",
        p: [
          "PPF pays a rate the government sets every quarter. It's 7.1% right now and has stayed there for a long time, but it can change. Interest is worked out every month and added to your account once a year, at the end of March.",
          "We assume you put in your full yearly amount at the start of each financial year, before 5 April. That's the way to get the most out of it, because PPF pays interest on the lowest balance between the 5th and the end of each month. Money deposited after the 5th misses that month's interest.",
          "Putting in the maximum ₹1.5 lakh a year for 15 years means ₹22.5 lakh invested and roughly ₹40.7 lakh at maturity. Every rupee of it is tax free.",
        ],
      },
      {
        h: "Extending after 15 years",
        p: [
          "When the 15 years are up you can extend the account in blocks of five years, with or without fresh deposits. This is where PPF really pulls ahead. Keep putting in ₹1.5 lakh a year and the balance reaches about ₹66.6 lakh at 20 years and just over ₹1 crore at 25.",
          "The tax benefit on deposits only applies under the old regime, through 80C. Under the new regime you don't get a deduction for putting money in, but the interest and the maturity amount are still completely tax free.",
        ],
      },
    ],
    faqs: [
      { q: "How much can I put into PPF?",
        a: "At least ₹500 and at most ₹1.5 lakh in a financial year. Anything above ₹1.5 lakh earns no interest and doesn't count for tax." },
      { q: "Can I take money out before 15 years?",
        a: "Partial withdrawals are allowed from the seventh financial year, up to a limit based on your balance. You can also take a loan against your PPF from the third year to the sixth. Closing it early is only allowed in specific cases, such as serious illness or higher education." },
      { q: "Is PPF better than an FD?",
        a: "For long term money, usually yes. FD interest is taxed at your slab rate, while PPF interest is tax free, so the same headline rate leaves you with more in PPF. The catch is the 15 year lock in." },
      { q: "Can I open a PPF account for my child?",
        a: "Yes, a parent can open one for a minor. The ₹1.5 lakh yearly limit covers your own account and your child's together." },
    ],
    related: ["fd", "sip", "fire"],
  },

  fire: {
    intro: "Work out how much you'd need to stop depending on a salary, and whether your current savings will get you there.",
    sections: [
      {
        h: "How we work out your FIRE number",
        p: [
          "First we take your monthly expenses today and grow them with inflation until the year you want to retire. Then we divide the yearly figure by your withdrawal rate. At a 4% withdrawal rate that's 25 times your yearly spending at retirement.",
          "If you spend ₹50,000 a month now and want to stop in 20 years, 6% inflation turns that into about ₹1.6 lakh a month by then. Your FIRE number comes out at roughly ₹4.8 crore. Starting from zero, you'd need to invest around ₹48,000 a month at 12% to get there.",
          "The second tab works the other way round. Tell it what you've saved and what you invest each month, and it shows the corpus you'd build and how long it would last.",
        ],
      },
      {
        h: "Why the 4% rule needs care in India",
        p: [
          "The 4% figure comes from studies of American markets, where inflation has historically been lower than ours. Many people planning in India use 3% to 3.5% to be safer, which means a target of roughly 29 to 33 times your yearly spending rather than 25.",
          "Inflation is the number that moves the result most. Spending on school fees, healthcare and travel tends to rise faster than general inflation, so try 7% as well as 6% and see how much the target changes.",
          "Leave out the house you live in, and keep health insurance and an emergency fund separate from your FIRE corpus. Retiring early only works if a single bad year doesn't force you back to work.",
        ],
      },
    ],
    faqs: [
      { q: "What does FIRE stand for?",
        a: "Financial Independence, Retire Early. In practice most people use it to mean having enough invested that work becomes optional, whether or not they actually stop." },
      { q: "Is ₹5 crore enough to retire in India?",
        a: "It depends on what you spend, not on the number. At a 4% withdrawal rate, ₹5 crore supports about ₹1.67 lakh a month in the first year. At 3.5% it's closer to ₹1.46 lakh. Put your own expenses in the calculator and see." },
      { q: "Should I include my EPF and PPF?",
        a: "Yes. Count everything that will be available to you at retirement, including EPF, PPF, NPS and mutual funds. Leave out your home unless you plan to sell it." },
      { q: "What return should I assume?",
        a: "Before retirement, 10% to 12% is a common range for a mostly equity portfolio. After retirement most people shift towards safer assets, so the second tab lets you set a lower return for those years." },
    ],
    related: ["sip", "ppf", "ctc"],
  },
};
