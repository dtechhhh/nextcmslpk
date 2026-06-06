import type { CSSProperties } from "react"
import {
  Award,
  BookOpen,
  Briefcase,
  Building,
  Check,
  Clock,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  Plane,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Container } from "@/themes/starter/components/ui/Container"

const ICON_REGISTRY: Record<string, LucideIcon> = {
  graduation_cap: GraduationCap,
  briefcase: Briefcase,
  plane: Plane,
  users: Users,
  building: Building,
  clock: Clock,
  star: Star,
  heart: Heart,
  check: Check,
  globe: Globe,
  award: Award,
  book: BookOpen,
}

interface StepFlowItem {
  iconKey: string
  stepLabel?: string
  title: string
  description: string
  sortOrder: number
  isEnabled: boolean
}

interface StepFlowProps {
  title?: string
  subtitle?: string
  items: StepFlowItem[]
}

function StepFlow({ title, subtitle, items }: StepFlowProps) {
  const steps = items
    .filter((item) => item.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 6)

  if (steps.length === 0) {
    return null
  }

  return (
    <section className="bg-neutral-50 py-16 md:py-20 lg:py-24">
      <Container>
        {title || subtitle ? (
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {title ? (
              <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <ol
          className="relative grid gap-8 lg:grid-cols-[repeat(var(--step-count),minmax(0,1fr))] lg:gap-6"
          style={{ "--step-count": steps.length } as CSSProperties}
        >
          {steps.map((step, index) => {
            const Icon = ICON_REGISTRY[step.iconKey] ?? HelpCircle
            const stepNumber = index + 1
            const isLast = index === steps.length - 1

            return (
              <li key={`${step.sortOrder}-${step.title}`} className="relative">
                {!isLast ? (
                  <>
                    <div
                      className="absolute left-4 top-8 h-[calc(100%+2rem)] border-l border-dashed border-primary-200 lg:hidden"
                    />
                    <div
                      className="absolute left-[calc(50%+1rem)] right-[calc(-50%+1rem)] top-4 hidden border-t border-dashed border-primary-200 lg:block"
                    />
                  </>
                ) : null}

                <div className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white">
                    {stepNumber}
                  </div>

                  <div className="min-w-0 pb-2 lg:pb-0">
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white text-[var(--color-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] lg:mx-auto">
                      <Icon aria-hidden="true" className="size-6" />
                    </div>
                    {step.stepLabel ? (
                      <p className="mb-2 text-xs font-semibold uppercase text-primary-600">
                        {step.stepLabel}
                      </p>
                    ) : null}
                    <h3 className="text-base font-semibold text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}

export { StepFlow }
export type { StepFlowItem, StepFlowProps }
