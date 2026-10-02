export default function HowIBuild() {
  const steps = [
    {
      num: "01",
      title: "Problem Architecture",
      desc: "Deep dive into constraints, domain models, user needs, and scalability edge cases before writing code."
    },
    {
      num: "02",
      title: "System Design",
      desc: "Architect resilient data models, typed schemas, clean APIs, and secure access boundaries."
    },
    {
      num: "03",
      title: "Iterative Build",
      desc: "Develop type-safe, maintainable components with continuous validation and automated testing."
    },
    {
      num: "04",
      title: "Optimize & Ship",
      desc: "Profile query bottlenecks, refine bundle performance, and ship reliable production systems."
    }
  ];

  return (
    <section className="bg-slate-50/60 dark:bg-[#0A0E17]/50 border-t border-b border-slate-200 dark:border-slate-800/80 py-24 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Engineering Methodology
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            How I Build Software
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A disciplined engineering approach to designing, developing, and shipping resilient products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-400 font-mono font-bold text-xs flex items-center justify-center border border-sky-500/20 mb-5">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
