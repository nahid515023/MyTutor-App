import { Metadata } from "next"
import { pageMetadata } from "@/app/metadata"

export const metadata: Metadata = pageMetadata.signupTeacher

export default function TeacherSignupLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <>
    {children}
    </>
  }