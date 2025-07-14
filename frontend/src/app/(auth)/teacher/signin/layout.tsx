import { Metadata } from "next"
import { pageMetadata } from "@/app/metadata"

export const metadata: Metadata = pageMetadata.signinTeacher

export default function TeacherLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>
  {children}
  </>
}