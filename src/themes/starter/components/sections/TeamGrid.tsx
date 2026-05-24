import Image from "next/image"
import { Container } from "@/themes/starter/components/ui/Container"

interface TeamGridMember {
  name: string
  role: string
  bio?: string
  imageSrc?: string
  sortOrder: number
  isEnabled: boolean
}

interface TeamGridProps {
  title?: string
  subtitle?: string
  members: TeamGridMember[]
}

function TeamGrid({ title, subtitle, members }: TeamGridProps) {
  const enabledMembers = members
    .filter((member) => member.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (enabledMembers.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <Container>
        {title || subtitle ? (
          <div className="mx-auto mb-10 max-w-3xl text-center">
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
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {enabledMembers.map((member) => (
            <article key={`${member.sortOrder}-${member.name}`}>
              <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                {member.imageSrc ? (
                  <Image
                    src={member.imageSrc}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl font-bold text-neutral-400">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="mt-4 font-semibold text-neutral-900">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-primary-500">{member.role}</p>
              {member.bio ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
                  {member.bio}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export { TeamGrid }
export type { TeamGridMember, TeamGridProps }
