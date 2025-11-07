import { ClientConfigWrapper } from "@/components/client/config-wrapper";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientConfigWrapper>{children}</ClientConfigWrapper>;
}
