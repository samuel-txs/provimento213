import { LucideProps } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface DynamicIconProps extends LucideProps {
  name: string
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // Convert kebab-case or snake_case to PascalCase (e.g. shield-check -> ShieldCheck)
  const pascalName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  const IconComponent = (LucideIcons as any)[pascalName] || LucideIcons.Circle

  return <IconComponent {...props} />
}
