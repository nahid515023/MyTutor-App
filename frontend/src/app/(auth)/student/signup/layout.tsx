import { Metadata } from "next"
import { pageMetadata } from "@/app/metadata"

export const metadata: Metadata = pageMetadata.signupStudent

export default function StudentSignupLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return <>
    {children}
    </>
  }