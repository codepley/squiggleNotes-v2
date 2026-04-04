type PageProps = { params: Promise<{ sessionId: string }> };

export default async function RevisionSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0E0F] text-[#F0EDE6]/40">
      <p>Session <code className="font-mono text-xs">{sessionId}</code> — coming in step 3.7</p>
    </div>
  );
}
