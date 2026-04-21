import AppShell from "@/components/AppShell";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
