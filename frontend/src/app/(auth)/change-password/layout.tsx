import { Metadata } from "next"
import { pageMetadata } from "@/app/metadata"
import Nav from "@/components/Nav"
import { FooterPage } from "@/components/FooterPage"
export const metadata: Metadata = pageMetadata.changePassword
export default function ChangePasswordLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
    <Nav />
     {children}
     <FooterPage />
    </>
  )
}
