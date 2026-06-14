import { CmsImage } from "@/themes/starter/components/ui/CmsImage"
import { Container } from "@/themes/starter/components/ui/Container"

interface TeamGridMember {
  name: string
  role: string
  organizationName?: string
  credentials?: string
  responsibility?: string
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
              <h2 className="text-2xl font-bold leading-tight text-neutral-900 md:text-4xl">
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enabledMembers.map((member) => (
            <article
              key={`${member.sortOrder}-${member.name}`}
              className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                {member.imageSrc ? (
                  <CmsImage
                    src={member.imageSrc}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-[center_20%]"
                    fallbackLabel={member.name}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-2xl font-bold text-neutral-400">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="break-words text-lg font-semibold leading-7 text-neutral-900">
                  {member.name}
                </h3>
                {member.role ? (
                  <p className="mt-2 break-words text-sm font-semibold leading-6 text-primary-600">
                    {member.role}
                  </p>
                ) : null}
                {member.organizationName ? (
                  <p className="mt-1 break-words text-sm leading-6 text-neutral-500">
                    {member.organizationName}
                  </p>
                ) : null}
                {member.credentials ? (
                  <p className="mt-4 break-words rounded-lg bg-neutral-50 px-3 py-2 text-sm font-medium leading-6 text-neutral-700">
                    {member.credentials}
                  </p>
                ) : null}
                {member.responsibility ? (
                  <p className="mt-4 whitespace-normal break-words text-sm leading-7 text-neutral-600">
                    {member.responsibility}
                  </p>
                ) : null}
                {member.bio ? (
                  <p className="mt-3 whitespace-normal break-words text-sm leading-7 text-neutral-600">
                    {member.bio}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}

export { TeamGrid }
export type { TeamGridMember, TeamGridProps }
