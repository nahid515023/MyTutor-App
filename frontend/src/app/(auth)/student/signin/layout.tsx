import { Metadata } from "next"
import { pageMetadata } from "@/app/metadata"

export const metadata: Metadata = pageMetadata.signinStudent

export default function StudentLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>
  {children}
  </>
}