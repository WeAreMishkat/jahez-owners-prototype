import { Phone } from './Phone'
import { ActivityPanel, ScenarioGuide } from './Panels'

export default function App() {
  return (
    <div className="flex min-h-full flex-col gap-4 p-4 lg:h-full lg:flex-row lg:gap-5 lg:p-5">
      <aside className="order-3 h-[640px] shrink-0 lg:order-1 lg:h-auto lg:w-[252px] xl:w-[272px] 2xl:w-[312px]">
        <ScenarioGuide />
      </aside>
      <main className="order-1 h-[calc(100svh-32px)] min-w-0 flex-1 lg:order-2 lg:h-auto">
        <Phone />
      </main>
      <aside className="order-2 h-[560px] shrink-0 lg:order-3 lg:h-auto lg:w-[320px] xl:w-[340px] 2xl:w-[400px]">
        <ActivityPanel />
      </aside>
    </div>
  )
}
