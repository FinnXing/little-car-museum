export function VehicleListSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="汽车列表正在加载"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.75rem] border-2 border-ink/20 bg-card"
        >
          <div className="aspect-[16/9] bg-mint-soft motion-safe:animate-pulse" />
          <div className="grid gap-4 p-6">
            <div className="h-7 w-2/3 rounded-full bg-ink/10 motion-safe:animate-pulse" />
            <div className="h-4 w-1/2 rounded-full bg-ink/10 motion-safe:animate-pulse" />
            <div className="h-16 rounded-2xl bg-ink/10 motion-safe:animate-pulse" />
          </div>
        </div>
      ))}
      <span className="sr-only">汽车正在开过来，请稍等。</span>
    </section>
  );
}
